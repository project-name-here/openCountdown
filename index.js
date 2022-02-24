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
  pauseMoment: 0
};

app.get("/", function (req, res) {
  const data = fs.readFileSync("templates/adminPanel.html", "utf8");
  res.send(data);
});

app.get("/timer", function (req, res) {
  const data = fs.readFileSync("templates/timerPage.html", "utf8");
  res.send(data);
});

app.get("/api/v1/data", function (req, res) {
  res.json(currentState);
});

app.get("/api/v1/set/mode", function (req, res) {
  currentState.mode = req.query.mode;
  res.json({ status: "ok" });
});

app.get("/api/v1/set/showMillis", function (req, res) {
  currentState.showMilliSeconds = (req.query.show === 'true');
  res.json({ status: "ok" });
});

app.get("/api/v1/set/timerGoal", function (req, res) {
  currentState.countdownGoal = new Date(parseInt(req.query.time)).getTime();
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

app.listen(3005);
