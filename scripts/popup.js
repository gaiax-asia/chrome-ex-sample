function get_all_today(){
  var html = document.getElementById("list_items");
  var todo_count = 0;

  html.innerHTML = "";

  chrome.storage.local.get(null, function(items){
    reminders = reminders_as_array(items);
    reminders.sort(compare_by_due);

    for(key in reminders){
      var item = reminders[key];
      var now = new Date();
      var current = new Date(item.due);

      now.setHours(0,0,0,0);
      current.setHours(0,0,0,0);

      if(now.getTime() == current.getTime()){
        var container = document.createElement("DIV");
        var title = document.createElement("h3");
        var content = document.createElement("P");

        container.className = "reminder_item";

        title.appendChild(document.createTextNode(item.title));
        content.appendChild(document.createTextNode(item.details));
        container.appendChild(title);
        container.appendChild(content);

        html.appendChild(container);
        todo_count++;
      }
    }
    
    if(!todo_count){
      var note = document.createElement("P");
      note.className = "no_records";
      note.appendChild(document.createTextNode("No reminders found for this day."));
      html.appendChild(note);
    }
  });
}

window.addEventListener("load", function(){
  get_all_today();
});
