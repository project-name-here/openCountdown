const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

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

currentState = {
  mode: "clock",
  countdownGoal: new Date().getTime(),
  showMilliSeconds: true,
  defaultFullScreen: true,
  timeAmountInital: 0,
  timerRunState: true,
  pauseMoment: 0,
  showTimeOnCountdown: true,
  message: "",
  showMessage: false,
  messageAppearTime: 0,
  showProgressbar: true,
  colorSegments: {20000: "#FFAE00", 5000: "#ff0000", "START": "yellow"},
  textColors: {},
  srvTime: 0,
  enableColoredText: true,
  debug: false
};

currentState.textColors = currentState.colorSegments


app.get("/", function (req, res) {
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
  currentState.showMilliSeconds = (req.query.show === 'true');
  res.json({ status: "ok" });
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
  currentState.timerRunState = true
  currentState.countdownGoal += new Date().getTime() - currentState.pauseMoment;
  res.json({ status: "ok" });
});

app.get("/api/v1/ctrl/timer/restart", function (req, res) {
  currentState.countdownGoal = new Date().getTime() + parseInt(currentState.timeAmountInital)
  res.json({ status: "ok" });
});

app.get("/api/v1/set/layout/showTime", function (req, res) {
  currentState.showTimeOnCountdown = (req.query.show === 'true');
  res.json({ status: "ok" });
});

app.get("/api/v1/set/progressbar/show", function (req, res) {
  currentState.showProgressbar = (req.query.show === 'true');
  res.json({ status: "ok" });
});

app.get("/api/v1/set/progressbar/colors", function (req, res) {
  try {
    currentState.colorSegments = JSON.parse(req.query.colors);
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

app.get("/api/v1/set/text/colors", function (req, res) {
  try {
    if(req.query.copy === "true"){
      currentState.textColors = currentState.colorSegments;
    } else {
      currentState.textColors = JSON.parse(req.query.colors);
    }
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

app.get("/api/v1/set/text/enableColoring", function (req, res) {
  currentState.enableColoredText = (req.query.enable === 'true');
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

app.listen(3005);
