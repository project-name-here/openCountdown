var newDateObj = new Date();
newDateObj =  new Date(newDateObj.getTime() + 1000*20)

function enterFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.msRequestFullscreen) {      // for IE11 (remove June 15, 2022)
    element.msRequestFullscreen();
  } else if(element.webkitRequestFullscreen) {  // iOS Safari
    element.webkitRequestFullscreen();
  }
}

function updateFullscreen(){
  if(JSON.parse(document.getElementById("incomeData").innerHTML).defaultFullScreen){
    enterFullscreen(document.documentElement)
  }
}

function msToTime(s, data) {
  isSmallerThenZero = false
  if(s < 0){
    isSmallerThenZero = true
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  let out = ""

  if(!data.showMilliSeconds){
    out = ('00' + Math.abs(hrs)).slice(-2) + ':' + ('00'+Math.abs(mins)).slice(-2) + ':' + ('00'+Math.abs(secs)).slice(-2)
  }else {
    out = ('00' + Math.abs(hrs)).slice(-2) + ':' + ('00'+Math.abs(mins)).slice(-2) + ':' + ('00'+Math.abs(secs)).slice(-2) + '.' + ('000'+Math.abs(ms)).slice(-3)
  }

  if(isSmallerThenZero){
    out = "-" + out
  }
  return out;
}

function handleUpdate() {
  resp = httpGet("/api/v1/data?markRead=mark");

  var data = JSON.parse(resp);
  document.getElementById("incomeData").innerHTML = JSON.stringify(data)

  if(data.defaultFullScreen && document.getElementById("initalDate").innerHTML.includes("true")){
    enterFullscreen(document.documentElement);  
    document.getElementById("initalDate").innerHTML = "false"
  }


  if (data.mode == "clock") {
    document.getElementById("timer").innerHTML = getTime();
    document.getElementById("testImg").style.display = "none";

  } else if (data.mode == "timer") {
    const now = new Date()
    const diff = data.countdownGoal - now.getTime()


    
    document.getElementById("timer").innerHTML = msToTime(diff, data);
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

setInterval(handleUpdate, 200);

let temp = new URLSearchParams(window.location.search).get("smaller");


if (temp == "true") {
  var cssURL = '/css/smallerTextMod.css';
  document.head.innerHTML +='<link rel="stylesheet" href="' + cssURL + '"/>'
}
