const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const helper = require("./helpers.js");

console.log("Preparing server...");
const app = express();

app.use(express.static("static"));
app.use(express.static("node_modules"));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

let loadedData = {}

if (fs.existsSync("data-persistence.json")) {
  const loadedDataRaw = fs.readFileSync("data-persistence.json", "utf8");
  loadedData = JSON.parse(loadedDataRaw);
} else {
  console.warn("Unable to load persistent data");
}

currentState = {
  mode: "clock",
  countdownGoal: new Date().getTime(),
  showMilliSeconds: true,
  defaultFullScreen: true,
  timeAmountInital: 0,
  timerRunState: false,
  pauseMoment: 0,
  showTimeOnCountdown: true,
  message: "",
  showMessage: false,
  messageAppearTime: 0,
  showProgressbar: true,
  colorSegments: {  40000: "yellow", 20000: "#FFAE00", 5000: "#ff0000", "START": "green" },
  textColors: {},
  srvTime: 0,
  enableColoredText: true,
  debug: false
};

const dataToBeWritten = {};

currentState = Object.assign({}, currentState, loadedData);

console.log(currentState)

currentState.textColors = currentState.colorSegments



console.log("Preparing routes...");
app.get("/", function (req, res) {
  const data = fs.readFileSync("templates/newAdminPanel.html", "utf8");
  res.send(data);
});

app.get("/old", function (req, res) {
  const data = fs.readFileSync("templates/adminPanel.html", "utf8");
  res.send(data);
});


app.get("/timer", function (req, res) {
  const data = fs.readFileSync("templates/timerPage.html", "utf8");
  res.send(data);
});

app.get("/api/v1/data", function (req, res) {
  currentState.srvTime = new Date().getTime()
  res.json(currentState);
});

app.get("/api/v1/set/mode", function (req, res) {
  currentState.mode = req.query.mode;
  res.json({ status: "ok" });
});

app.get("/api/v1/set/layout/showMillis", function (req, res) {
  const resy = helper.wrapBooleanConverter(req.query.show, res)
  if (resy) {
    currentState.showMilliSeconds = resy;
    if (req.query.persist === 'true') {
      dataToBeWritten.showMilliSeconds = currentState.showMilliSeconds
    }
    res.json({ status: "ok" });
  }

});

app.get("/api/v1/set/timerGoal", function (req, res) {
  currentState.countdownGoal = new Date(parseInt(req.query.time)).getTime(); // ToDO error handling
  res.json({ status: "ok" });
});

app.get("/api/v1/set/addMillisToTimer", function (req, res) {
  currentState.timeAmountInital = req.query.time;
  currentState.countdownGoal = new Date().getTime() + parseInt(req.query.time)
  res.json({ status: "ok" });
});

app.get("/api/v1/ctrl/timer/pause", function (req, res) {
  currentState.timerRunState = false;
  currentState.pauseMoment = new Date().getTime();
  res.json({ status: "ok" });
});

app.get("/api/v1/ctrl/timer/play", function (req, res) {

  if (currentState.timerRunState == false) {
    currentState.timerRunState = true
    currentState.countdownGoal += new Date().getTime() - currentState.pauseMoment;
  }
  res.json({ status: "ok" });
});

app.get("/api/v1/ctrl/timer/restart", function (req, res) {
  currentState.countdownGoal = new Date().getTime() + parseInt(currentState.timeAmountInital)
  res.json({ status: "ok" });
});

app.get("/api/v1/set/layout/showTime", function (req, res) {
  const resy = helper.wrapBooleanConverter(req.query.show, res)
  if (resy) {
    currentState.showTimeOnCountdown = resy;
    if (req.query.persist === 'true') {
      dataToBeWritten.showTimeOnCountdown = currentState.showTimeOnCountdown
    }
    res.json({ status: "ok" });
  }
});

app.get("/api/v1/set/progressbar/show", function (req, res) {
  currentState.showProgressbar = (req.query.show === 'true');
  if (req.query.persist === 'true') {
    dataToBeWritten.showProgressbar = currentState.showProgressbar
  }
  res.json({ status: "ok" });
});

app.get("/api/v1/set/progressbar/colors", function (req, res) {
  try {
    let data = req.query.colors
    if(req.query.isBase64 === "true"){
      data = atob(data)
    }
    console.debug(data)
    currentState.colorSegments = JSON.parse(data);
    if (req.query.persist === 'true') {
      dataToBeWritten.colorSegments = currentState.colorSegments
    }
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", message: error });
    console.error(error)
  }
});

app.get("/api/v1/set/text/colors", function (req, res) {
  try {
    if (req.query.copy === "true") {
      currentState.textColors = currentState.colorSegments;
    } else {
      currentState.textColors = JSON.parse(req.query.colors);
    }
    if (req.query.persist === 'true') {
      dataToBeWritten.textColors = currentState.textColors
    }
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

app.get("/api/v1/set/text/enableColoring", function (req, res) {
  currentState.enableColoredText = (req.query.enable === 'true');
  if (req.query.persist === 'true') {
    dataToBeWritten.enableColoredText = currentState.enableColoredText
  }
  res.json({ status: "ok" });
});

app.get("/api/v1/ctrl/message/show", function (req, res) {
  currentState.message = req.query.msg
  currentState.showMessage = true
  currentState.messageAppearTime = new Date().getTime()
  res.json({ status: "ok" });
});

app.get("/api/v1/debug", function (req, res) {
  currentState.debug = (req.query.enable === 'true');
  res.json({ status: "ok" });
});

app.get("/api/v1/ctrl/message/hide", function (req, res) {
  currentState.showMessage = false
  res.json({ status: "ok" });
});

app.get("/api/v1/storage/commit", function (req, res) {
  const tempString = JSON.stringify(dataToBeWritten);
  try {
    fs.writeFileSync("data-persistence.json", tempString);
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", reason: error });
  }
});


app.get("/api/v1/storage/delete", function (req, res) {
  if (req.query.delete === "true") {
    if (fs.existsSync("data-persistence.json")) {
      fs.unlinkSync("data-persistence.json");
      res.json({ status: "ok" });
    } else {
      res.json({ status: "error", reason: "No persistence data was found" });
    }

  } else {

  } res.json({ status: "error", reason: "Missing delete argument" });

});


console.log("Starting server...");
const port = 8005
app.listen(port);

console.info("Server running on port " + port);
console.info("Visit localhost:" + port + "/timer for the timer page");
console.info("Visit localhost:" + port + " for the admin page");
