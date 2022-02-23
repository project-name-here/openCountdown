var newDateObj = new Date();
newDateObj =  new Date(newDateObj.getTime() + 1000*20)

function handleUpdate() {
  resp = httpGet("/api/v1/data?markRead=mark");

  var data = JSON.parse(resp);
  if(data.changed){
    newDateObj = data.countdownGoal;
  }

  if (data.mode == "clock") {
    document.getElementById("timer").innerHTML = getTime();
    document.getElementById("testImg").style.display = "none";

  } else if (data.mode == "timer") {
    
    countdown(
      newDateObj,
      function(ts) {
        // console.log(ts)
        if(ts.value <= 0){
          document.getElementById("timer").innerHTML = ('00'+ts.hours).slice(-2) + ":" + ('00'+ts.minutes).slice(-2) + ":" + ('00'+ts.seconds).slice(-2);
        }else{
          document.getElementById("timer").innerHTML  = "00:00:00"
        }
        
      },
      countdown.HOURS|countdown.MINUTES|countdown.SECONDS);
    document.getElementById("testImg").style.display = "none";

  } else if (data.mode == "black") {
    document.getElementById("timer").innerHTML = "";
    document.getElementById("testImg").style.display = "none";
    
  } else if (data.mode == "test") {
    document.getElementById("timer").innerHTML = "";
    document.getElementById("testImg").style.display = "block";
  }
}

function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
}

function getTime() {
  var date = new Date();
  var h = date.getHours(); // 0 - 23
  var m = date.getMinutes(); // 0 - 59
  var s = date.getSeconds(); // 0 - 59

  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;

  var time = h + ":" + m + ":" + s;
  return time;
}

setInterval(handleUpdate, 50);
