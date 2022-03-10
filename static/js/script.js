var newDateObj = new Date();
newDateObj = new Date(newDateObj.getTime() + 1000 * 20)

backReqInt = 0;
websocketFailed = false
recoveryAttempts = 0;

let socket = new ReconnectingWebSocket("ws://localhost:" + location.port);


socket.onopen = function (e) {
  // alert("[open] Connection established");
  //alert("Sending to server");
  socket.send("new client");
};

socket.onmessage = function (event) {
  // alert(`[message] Data received from server: ${event.data}`);
  dataFame = JSON.parse(event.data);
  timeDiff = new Date().getTime() - dataFame.srvTime
};

socket.onclose = function (event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.error('[close] Connection died');

    /*websocketFailed = true
    if (recoveryAttempts < 5) {
      setTimeout(function handleWebsocketRecovery() {
        // requestBackend()
        websocketFailed = false
        recoveryAttempts++;
        console.warn("Trying to recover websocket connection")
        socket.onopen = function (e) {
          // alert("[open] Connection established");
          //alert("Sending to server");
          socket.send("new client");
        };
      }, 1000)
    } else {
      backReqInt = setInterval(requestBackend, 500);
    }
    */
  }
};

socket.onerror = function (error) {
  alert(`[error] ${error.message}`);
};

allowFullscreen = true
let dataFame = {}
let timeDiff = 0

function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.msRequestFullscreen) {      // for IE11 (remove June 15, 2022)
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {  // iOS Safari
    element.webkitRequestFullscreen();
  }
}

function returnData() {
  return (JSON.parse(document.getElementById("incomeData").innerHTML))
}

function percentage(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
}

function updateFullscreen() {
  if (JSON.parse(document.getElementById("incomeData").innerHTML).defaultFullScreen && allowFullscreen) {
    enterFullscreen(document.documentElement)
  }
}



function msToTime(s, data) {
  isSmallerThenZero = false
  if (s < 0) {
    isSmallerThenZero = true
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  let out = ""

  if (!data.showMilliSeconds) {
    out = ('00' + Math.abs(hrs)).slice(-2) + ':' + ('00' + Math.abs(mins)).slice(-2) + ':' + ('00' + Math.abs(secs)).slice(-2)
  } else {
    out = ('00' + Math.abs(hrs)).slice(-2) + ':' + ('00' + Math.abs(mins)).slice(-2) + ':' + ('00' + Math.abs(secs)).slice(-2) + '.' + ('000' + Math.abs(ms)).slice(-3)
  }

  if (isSmallerThenZero) {
    out = "-" + out
  }
  return out;
}

function findProgessColor(colors, value) {
  const allColors = Object.keys(colors);
  let resColor = colors["START"]
  for (let color in allColors) {
    const currColor = allColors[color]
    // console.log(color, currColor, parseInt(currColor), value, colors[String(currColor)], resColor)
    if (value <= parseInt(currColor)) {
      resColor = colors[String(currColor)]
      break
    }
  }
  return (resColor)
}

function requestBackend() {
  resp = httpGet("/api/v1/data");
  resp.onloadend = function (e) {
    if (resp.status == 200) {
      resp = resp.responseText;
      var data = JSON.parse(resp);
      timeDiff = new Date().getTime() - data.srvTime
      dataFame = data;
    }
  }
}

let isSlowed = false

function handleRecovery() {
  var img = document.body.appendChild(document.createElement("img"));
  img.onload = function () {
    location.reload();
  };
  img.src = "SMPTE_Color_Bars.svg";
}

let recoInter = -1

function handleUpdate() {
  var data = dataFame;
  document.getElementById("incomeData").innerHTML = JSON.stringify(data)
  document.getElementById("timediff").innerHTML = timeDiff + "<br>" + String(new Date().getTime() - data.srvTime);
  if (new Date().getTime() - data.srvTime > 1000 * 5) {

    if (!isSlowed) {
      console.error("Server timeout")
      clearInterval(updateInter)
      updateInter = setInterval(handleUpdate, 900)
      document.getElementById("warningBanner").style.display = "block"
      isSlowed = true
      recoInter = setInterval(handleRecovery, 10000)
    }
  } else {
    if (isSlowed) {
      clearInterval(updateInter)
      clearInterval(recoInter)
      updateInter = setInterval(handleUpdate, 2)
      document.getElementById("warningBanner").style.display = "none"
      isSlowed = false
    }
  }

  if (data.debug) {
    document.getElementById("timediff").style.display = "block";
  } else {
    document.getElementById("timediff").style.display = "none";
  }

  if (data.defaultFullScreen && document.getElementById("initalDate").innerHTML.includes("true") && allowFullscreen) {
    enterFullscreen(document.documentElement);
    document.getElementById("initalDate").innerHTML = "false"
  }

  if (data.showMessage) {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("text").innerHTML = data.message
  } else {
    document.getElementById("overlay").style.display = "none";
  }

  if (data.showTimeOnCountdown && data.mode == "timer") {
    document.getElementById("clockSec").innerHTML = getTime();
  } else {
    document.getElementById("clockSec").innerHTML = "";
  }

  if (new Date().getTime() - data.messageAppearTime < 5000) {
    if (!document.getElementById("text").classList.contains('blink')) {
      document.getElementById("text").classList.add("blink")
    }
  } else {
    if (document.getElementById("text").classList.contains('blink')) {
      document.getElementById("text").classList.remove("blink")
    }
  }


  if (data.mode == "clock") {
    document.getElementById("timer").innerHTML = getTime();
    document.getElementById("testImg").style.display = "none";
    document.getElementById("wholeProgBar").style.display = "none";
    document.getElementById("clockSec").innerHTML = "";
    document.getElementById("timer").style.color = "white"

  } else if (data.mode == "timer") {
    document.getElementById("wholeProgBar").style.display = "block";
    if (data.timerRunState) {
      const now = new Date()
      const diff = data.countdownGoal - now.getTime()
      document.getElementById("timer").innerHTML = msToTime(diff, data);
      if (diff > 0) {
        document.getElementById("progBar").style.width = percentage(diff, data.timeAmountInital) + "%";
      } else {
        document.getElementById("progBar").style.width = "0%";
      }

      document.getElementById("progBar").style.backgroundColor = findProgessColor(data.colorSegments, diff)
      document.getElementById("testImg").style.display = "none";
      if (data.enableColoredText) {
        document.getElementById("timer").style.color = findProgessColor(data.textColors, diff)
      } else {
        document.getElementById("timer").style.color = "white"
      }

    }
  } else if (data.mode == "black") {
    document.getElementById("timer").innerHTML = "";
    document.getElementById("testImg").style.display = "none";
    document.getElementById("wholeProgBar").style.display = "none";
    document.getElementById("clockSec").innerHTML = "";

  } else if (data.mode == "test") {
    document.getElementById("timer").innerHTML = "";
    document.getElementById("testImg").style.display = "block";
    document.getElementById("progBar").style.display = "none";
    document.getElementById("clockSec").innerHTML = "";
  }
}

function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, true); // false for synchronous request
  xmlHttp.send(null);
  xmlHttp.onerror = function (e) {
    console.log(e);
  };
  return xmlHttp;
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


// setInterval(requestBackend, 500);
updateInter = setInterval(handleUpdate, 2);

let temp = new URLSearchParams(window.location.search).get("smaller");


if (temp == "true") {
  var cssURL = '/css/smallerTextMod.css';
  document.head.innerHTML += '<link rel="stylesheet" href="' + cssURL + '"/>'
  allowFullscreen = false
}
