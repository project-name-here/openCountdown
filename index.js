const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const countdown = require("countdown")

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
  timeLeft: "00:00:00",
  timerInternal: 0,
};

app.get("/", function (req, res) {
  const data = fs.readFileSync("templates/adminPanel.html", "utf8");
  res.send(data);
});

app.post("/", function (req, res) {
  console.log(req.body);
  currentState.mode = req.body.mode;
  currentState.timeLeft = req.body.timeLeft;
  res.send("OK");
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

app.get("/api/v1/set/timeLeft", function (req, res) {
  currentState.timerInternal = req.query.time;
  res.json({ status: "ok" });
});

console.log(countdown( new Date(2022, 1, 24) ).toString())

app.listen(3000);
