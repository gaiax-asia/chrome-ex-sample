function save_data(){
  var form = document.getElementById('new_form');
  var date = form.due.valueAsDate;
  var data = {}
  var item = {type: Constants.TYPE.REMINDER, title: form.title.value, details: form.details.value, due: form.due.value, created_at: Date()}

  if(!item.title.trim() || !date){
    alert("Data Incomplete");
    return false;
  }

  date.setHours(0,0,0,0);
  data[item.title] = {}

  chrome.storage.local.get(data, function(items){
    data[item.title] = item;
    
    if((items[item.title].title == item.title) && form.getAttribute("data-purpose") == "create"){
      alert("Title is Already Existing.");
      return false;
    }

    chrome.storage.local.set(data, function(){
      form.reset();
      form.title.disabled = false;
      form.setAttribute("data-purpose", "create");
      location.href = "#";
    });
  });
}

function get_data(button){
  var data = {}
  var title = button.getAttribute("data-title");
  var form = document.getElementById('new_form');
  
  data[title] = {}
  
  chrome.storage.local.get(data, function(items){
    if(items[title].title == title){
      form.title.value = items[title].title;
      form.details.value = items[title].details != undefined ? items[title].details : ""
      form.due.value = items[title].due;
      form.setAttribute("data-purpose", "update");
      form.title.disabled = true;
    }else{
      alert("No data Found!");
    }
  });
}

function delete_data(button){
  if (confirm('Are you sure you want to save this thing into the database?')) {
    var data = {}
    var title = button.getAttribute("data-title");
  
    data[title] = {}
  
    chrome.storage.local.get(data, function(items){
      if(items[title].title == title){
        chrome.storage.local.remove(title);
      }else{
        alert("No data Found!");
      }
    });
  }
}

function get_all_data(){
  var html = document.getElementById("list_items");
  html.innerHTML = "";
  
  chrome.storage.local.get(null, function(items){
    reminders = reminders_as_array(items);
    reminders.sort(compare_by_due);
    
    if(reminders.length){
      var prev = null;
      for(key in reminders){
        var item = reminders[key];
        current = new Date(item.due);
        if(!prev || (prev && prev.getTime() != current.getTime())){
          var date_panel = document.createElement("h4");
          date_panel.innerHTML = "<span>" + Constants.WEEKDAYS[current.getDay()] + "</span><span class='keep_right'>" + Constants.MONTHS[current.getMonth()] + " " + current.getDate() + ", " + current.getFullYear() + "</span>";
          html.appendChild(date_panel);
        }

        html.appendChild(create_single_item(item));
        prev = current;
      }
    }else{
      var note = document.createElement("P");
      note.className = "no_records";
      note.appendChild(document.createTextNode("No Reminders Found"));
      html.appendChild(note);
    }
    
    bind_buttons();
  });
}

function bind_buttons(){
  edit_buttons = document.getElementsByClassName("edit_button");
  for(var i = 0; i < edit_buttons.length; i++){
    edit_buttons[i].onclick = function(){
      get_data(this);
    }
  }
  
  delete_buttons = document.getElementsByClassName("delete_button");
  for(var i = 0; i < delete_buttons.length; i++){
    delete_buttons[i].onclick = function(){
      delete_data(this);
    }
  }
}

function create_single_item(item){
  var container = document.createElement("DIV");
  var title = document.createElement("h3");
  var content = document.createElement("P");
  var due = document.createElement("SMALL");
  var span = document.createElement("SPAN");
  var edit = document.createElement("A");

  container.className = "reminder_item";
  span.className = "keep_right title_button";
  span.innerHTML = "<small><a href='#modal-one' class='edit_button' data-title='" + item.title + "'>edit</a><a href='#' class='delete_button'  data-title='" + item.title + "'>delete</a></small>";
  container.setAttribute("data-title", item.title);

  title.appendChild(document.createTextNode(item.title));
  due.appendChild(document.createTextNode(item.due));
  title.appendChild(due);
  title.appendChild(span);
  content.appendChild(document.createTextNode(item.details));
  container.appendChild(title);
  container.appendChild(content);
  
  return container;
}


window.addEventListener("DOMContentLoaded", function(){
  document.getElementById("new_form").onsubmit = function(){
    save_data();
    return false;
  }

  document.getElementById("reset_form").onclick = function(){
    document.getElementById("new_form").reset();
    document.getElementById("new_form").title.disabled = false;
  }

  get_all_data();

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];

      if(storageChange.oldValue){
        if(storageChange.oldValue.type != Constants.TYPE.REMINDER) return false;
      
        if(storageChange.newValue){
          if(storageChange.oldValue.due == storageChange.newValue.due){
            element = getElementByAttributeValue("tag", "DIV", "data-title", storageChange.newValue.title);

            if(element){
              element.parentNode.replaceChild(create_single_item(storageChange.newValue), element);
              buttons = getElementByAttributeValue("tag", "A", "data-title", storageChange.newValue.title);

              for(var i = 0; i < buttons.length; i++){
                if(buttons[i].className == "edit_button"){
                  get_data(this);
                }else if(buttons[i].className == "delete_button"){
                  delete_data(this);
                }
              }
            }
          }else{
            get_all_data();
          }

          bind_buttons();
          show_notification("Reminder Updated!", storageChange.newValue.title + " has been updated");
        }else if(storageChange.oldValue && !storageChange.newValue){
          element = getElementByAttributeValue("tag", "DIV", "data-title", storageChange.oldValue.title);
          element.remove();
          show_notification("Reminder Deleted!", storageChange.oldValue.title + " has been deleted");
        }
      }else if(storageChange.newValue){
        get_all_data();
        show_notification("New Reminder!", storageChange.newValue.title + " has been Created");
      }
      
    }
  });
}, false);