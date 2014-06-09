var Constants = Object.freeze({
  TYPE: { REMINDER: 1, SETTING: 0 },
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
});

function compare_by_due(one, two) {
  var one_due = new Date(one.due);
  var two_due = new Date(two.due);
  if (one_due.getTime() < two_due.getTime()) return -1;
  if (one_due.getTime() > two_due.getTime()) return 1;
  return 0;
}

function reminders_as_array(items){
  var reminders = new Array();
  
  for(key in items){
    if(items[key].type == Constants.TYPE.REMINDER) reminders.push(items[key]);
  }
  
  return reminders;
}

function getElementByAttributeValue(method, selector, attribute, value){
  var allElements = [];
  if(method == "tag"){
    allElements = document.getElementsByTagName(selector);
  }else if(method == "class"){
    allElements = document.getElementsByClassName(selector);
  }else{
    return null;
  }
  for (var i = 0; i < allElements.length; i++)
   {
    if (allElements[i].getAttribute(attribute) == value)
    {
      return allElements[i];
    }
  }
}

function show_notification(title, body){
  var notification = new Notification(title, { icon: "../images/solitude.png", body: body});
  setTimeout(function(){
    notification.close();
  }, 5000);
}
