const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const ws = require('ws');
const helper = require("./helpers.js");
const loggy = require("./logging")
const Eta = require("eta");
const _ = require("underscore")
const path = require("path")

loggy.init(true)

loggy.log("Preparing server", "info", "Server");
const app = express();

loggy.log("Preparing static routes", "info", "Server");
app.use(express.static("static"));

loggy.log("Preparing middlewares", "info", "Server");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

// Allowed urls for requests to /assets/
const allowsURLs = [
  'bootstrap-icons/font/bootstrap-icons.css',
  'js-cookie/dist/js.cookie.min.js',
  'bootstrap/dist/css/bootstrap.min.css',
  'mdbootstrap/css/style.css',
  'bootstrap/dist/js/bootstrap.bundle.min.js',
  'jquery/dist/jquery.min.js',
  'darkreader/darkreader.js',
  'bootstrap-duration-picker/dist/bootstrap-duration-picker.css',
  'flatpickr/dist/flatpickr.min.css',
  'bootstrap-duration-picker/dist/bootstrap-duration-picker-debug.js',
  'flatpickr/dist/flatpickr.js',
  'bootstrap-icons/font/fonts/bootstrap-icons.woff2',
  'bootstrap/dist/css/bootstrap.min.css.map',
  'less/dist/less.min.js',
  'less/dist/less.min.js.map',
  'mdbootstrap/js/mdb.min.js'
];

let loadedData = {}

loggy.log("Loading config", "info", "Config");
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
  colorSegments: { 40000: "yellow", 20000: "#FFAE00", 5000: "#ff0000", "START": "green" },
  textColors: {},
  srvTime: 0,
  enableColoredText: true,
  debug: false,
  enableOverrun: true,
  sessionToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
};

let configObject = {
  language: "en_uk",
  port: 3000
}
if(!fs.existsSync("config.json")) {
  fs.writeFileSync("config.json", "{}");
}
const tempJsonText = JSON.parse(fs.readFileSync("config.json", "utf8"));
configObject = _.extend(configObject, tempJsonText);
fs.writeFileSync("config.json", JSON.stringify(configObject));

currentState = Object.assign({}, currentState, loadedData);
currentState.textColors = currentState.colorSegments

loggy.log("Searching for languages", "info", "Language")
const languagesRaw = fs.readdirSync("./lang");
const languages = [];
for (let i = 0; i < languagesRaw.length; i++) {
  if (languagesRaw[i].endsWith(".json")) {
    languages.push(languagesRaw[i].replace(".json", ""));
  }
}
loggy.log("Found " + languages.length + " languages", "info", "Language")



loggy.log("Reading language file", "info", "Language")
let languageProfile = JSON.parse(fs.readFileSync("lang/" + configObject.language + ".json", "utf8"));

loggy.log("Preparing websocket", "info", "Websocket");
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', function incoming(data) {
    if (data.toString() == "new client") {
      updatedData()
    }
  });
});

wsServer.broadcast = function broadcast(data) {
  wsServer.clients.forEach(function each(client) {
    // The data is coming in correctly
    // console.log(data);
    client.send(data);
  });
};

let updatey = undefined;

function updatedData() {
  currentState.srvTime = new Date().getTime()
  wsServer.broadcast(JSON.stringify(currentState));
  clearTimeout(updatey);
  setTimeout(updatedData, 5000);
}

loggy.log("Preparing routes", "info", "Server");
app.get("/", function (req, res) {
  const data = fs.readFileSync("templates/newAdminPanel.html", "utf8");
  try {
    res.send(
      Eta.render(data, {
        lang: languageProfile,
        additional: {
          languages: languages
        }
      }));
  } catch (e) {
    loggy.log("Error rendering template", "error", "Server");
    const dataN = fs.readFileSync("templates/brokenTranslation.html", "utf8");
    res.send(
      Eta.render(dataN, {
        additional: {
          languages: languages
        }
      }));
  }
});

app.get("/timer", function (req, res) {
  const data = fs.readFileSync("templates/ng-timerview.html", "utf8");
  res.send(data);
});

app.get("/timer-old", function (req, res) {
	const data = fs.readFileSync("templates/timerPage.html", "utf8");
	res.send(data);
      });

app.get("/api/v1/data", function (req, res) {
  currentState.srvTime = new Date().getTime()
  res.json(currentState);
});

app.get("/api/v1/system", function (req, res) {
  const tempPkgFile = fs.readFileSync("package.json", "utf8");
  const tempPkgObj = JSON.parse(tempPkgFile);
  const systemData = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    nodePath: process.execPath,
    nodeArgv: process.argv,
    nodeExecArgv: process.execArgv,
    nodeCwd: process.cwd(),
    nodeEnv: process.env,
    nodeConfig: process.config,
    nodeTitle: process.title,
    systemVersion: tempPkgObj.version
  }
  res.json(systemData);
});


app.get("/api/v1/set/mode", function (req, res) {
  currentState.mode = req.query.mode;
  updatedData()
  res.json({ status: "ok" });
});

app.get("/api/v1/set/layout/showMillis", function (req, res) {
  const resy = helper.wrapBooleanConverter(req.query.show, res)
  if (resy != undefined) {
    currentState.showMilliSeconds = resy;
    if (req.query.persist === 'true') {
      dataToBeWritten.showMilliSeconds = currentState.showMilliSeconds
    }
    res.json({ status: "ok" });
  }
  updatedData()

});

app.get("/api/v1/set/timerGoal", function (req, res) {
  currentState.countdownGoal = new Date(parseInt(req.query.time)).getTime(); // ToDO error handling
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/set/addMillisToTimer", function (req, res) {
  currentState.timeAmountInital = req.query.time;
  currentState.countdownGoal = new Date().getTime() + parseInt(req.query.time)
  currentState.pauseMoment = new Date().getTime();
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/set/relativAddMillisToTimer", function (req, res) {
  currentState.timeAmountInital = req.query.time;
  currentState.countdownGoal = currentState.countdownGoal + parseInt(req.query.time)
  currentState.pauseMoment = new Date().getTime();
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/ctrl/timer/pause", function (req, res) {
  currentState.timerRunState = false;
  currentState.pauseMoment = new Date().getTime();
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/ctrl/timer/play", function (req, res) {

  if (currentState.timerRunState == false) {
    currentState.timerRunState = true
    currentState.countdownGoal += new Date().getTime() - currentState.pauseMoment;
  }
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/ctrl/timer/restart", function (req, res) {
  currentState.countdownGoal = new Date().getTime() + parseInt(currentState.timeAmountInital)
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/set/layout/showTime", function (req, res) {
  const resy = helper.wrapBooleanConverter(req.query.show, res)
  if (resy != undefined) {
    currentState.showTimeOnCountdown = resy;
    if (req.query.persist === 'true') {
      dataToBeWritten.showTimeOnCountdown = currentState.showTimeOnCountdown
    }
    res.json({ status: "ok" });
  }
  updatedData()
});

app.get("/api/v1/set/enableOverrun", function (req, res) {
	const resy = helper.wrapBooleanConverter(req.query.enable, res)
	if (resy != undefined) {
	  currentState.enableOverrun = resy;
	  if (req.query.persist === 'true') {
	    dataToBeWritten.enableOverrun = currentState.enableOverrun
	  }
	  res.json({ status: "ok" });
	}
	updatedData()
      });

app.get("/api/v1/set/progressbar/show", function (req, res) {
  currentState.showProgressbar = (req.query.show === 'true');
  if (req.query.persist === 'true') {
    dataToBeWritten.showProgressbar = currentState.showProgressbar
  }
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/set/progressbar/colors", function (req, res) {
  try {
    let data = req.query.colors
    if (req.query.isBase64 === "true") {
      data = atob(data)
    }
    currentState.colorSegments = JSON.parse(data);
    if (req.query.persist === 'true') {
      dataToBeWritten.colorSegments = currentState.colorSegments
    }
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", message: error });
    console.error(error)
  }
  updatedData()
});

app.get("/api/v1/set/text/colors", function (req, res) {
  try {
    if (req.query.copy === "true") {
      currentState.textColors = currentState.colorSegments
      res.json({ status: "ok" });
    } else {
      let data = req.query.colors
      if (req.query.isBase64 === "true") {
        data = atob(data)
      }
      console.debug(data)
      currentState.textColors = JSON.parse(data);
      if (req.query.persist === 'true') {
        dataToBeWritten.textColors = currentState.textColors
      }
    }
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", message: error });
    console.error(error)
  }
  updatedData()
});

app.get("/api/v1/set/text/enableColoring", function (req, res) {
  currentState.enableColoredText = (req.query.enable === 'true');
  if (req.query.persist === 'true') {
    dataToBeWritten.enableColoredText = currentState.enableColoredText
  }
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/ctrl/message/show", function (req, res) {
  currentState.message = req.query.msg
  currentState.showMessage = true
  currentState.messageAppearTime = new Date().getTime()
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/debug", function (req, res) {
  currentState.debug = (req.query.enable === 'true');
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/ctrl/message/hide", function (req, res) {
  currentState.showMessage = false
  res.json({ status: "ok" });
  updatedData()
});

app.get("/api/v1/storage/commit", function (req, res) {
  const tempString = JSON.stringify(dataToBeWritten);
  try {
    fs.writeFileSync("data-persistence.json", tempString);
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", reason: error });
  }
  updatedData()
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
  updatedData()
});

// UI Routes
// Returns an object containg all available languages
app.get("/api/ui/v1/lang/list", function handleLangList(req, res){
  const tempRespObject = {
    status: "ok",
    languages: languages
  }
  res.json(tempRespObject);
})

app.get("/api/ui/v1/lang/set", function (req, res) {
  if(req.query.lang == undefined || req.query.lang == ""){
    res.json({ status: "error", reason: "Missing language" });
    return;
  }
  const testLang = req.query.lang;
  loggy.log("Reloading language file", "info", "Language")
  if(!fs.existsSync("lang/" + testLang + ".json")){
    loggy.log("Language reload failed, file does not exist", "error", "Language")
    res.status(500).json({ status: "error", reason: "Language file not found" });
    return
  }
  const tempLang = fs.readFileSync("lang/" + testLang + ".json", "utf8");
  const tempLangObj = helper.tryToParseJson(tempLang);
  if(!tempLangObj){
    loggy.log("Language reload failed, file is not valid", "error", "Language")
    res.status(500).json({ status: "error", reason: "Language file is not valid" });
    return
  }
  if(tempLangObj._metadata == undefined){
    loggy.log("Language reload failed, file is not valid, metadata missing", "error", "Language")
    res.status(500).json({ status: "error", reason: "Language file is not valid" });
    return
  }
  loggy.log("Language reloaded, loaded " + tempLangObj._metadata.lang + "@" + tempLangObj._metadata.version, "info", "Language")
  configObject.language = req.query.lang;
  languageProfile = tempLangObj;
  res.status(200).json({ status: "ok" });
  fs.writeFileSync("config.json", JSON.stringify(configObject));
});


app.use("/assets/*", function handleModuleFiles(req, res) {
  if(allowsURLs.indexOf(req.params[0]) > -1){
    res.sendFile(path.join(__dirname, "node_modules", req.params[0]));
  } else {
    loggy.log("Attempt to access restricted asset file " + req.params[0], "error", "Security")
    res.status(403).json({ status: "error", reason: "Access to restricted asset file denied" });
  }
  // console.log(recordedURLs)
})

app.use(function (req, res, next) {
  res.status(404);
  loggy.log("Server responded with 404 error", "warn", "Server", true);

  // respond with html page
  if (req.accepts('html')) {
    const data = fs.readFileSync("templates/errorPages/404.html", "utf8");
    res.status(404)
    res.send(data);
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});





/*app.use(function(err, req, res, next) {
  console.error(err.stack);
  if(String(err.stack).includes("TypeError: Cannot read properties of undefined")) {
    const data = fs.readFileSync("templates/brokenTranslation.html", "utf8");
    res.send(data);
  }else{
    res.status(500).send('Something broke!');
  }
 
});*/



loggy.log("Starting server", "info", "Server");

const port = configObject.port;

process.on('SIGINT', function () {
  loggy.log("Caught interrupt signal and shutting down gracefully", "info", "Shutdown");
  server.close(); // Make the express server stop
  loggy.log("Goodbye! 👋", "magic", "Shutdown", true)
  loggy.close(); // Close and write log
  process.exit(); // Quit the application
});

const server = app.listen(port);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});


loggy.log("=======================", "info", "", true);
loggy.log("Server running on port " + port, "magic", "", true);
loggy.log("Visit http://localhost:" + port + "/timer for the timer view", "magic", "", true);
loggy.log("Visit http://localhost:" + port + " for the admin view", "magic", "", true);
loggy.log("=======================", "info", "", true);