const colors = require('colors');
const util = require('util')
const fs = require('fs');

let logToFileJson = false;
let logJournal = [];

function init(logToFile = false) {
  logToFileJson = logToFile;
  log("Logging initialized", "info", "Logging");
}

function close(){
  if(logToFileJson){
    const tempString = JSON.stringify(logJournal);
    try {
      fs.writeFileSync("log-journal.json", tempString);
    } catch (error) {
      log("Error while closing log file: " + error, "error", "Logging");
    }
  }
  log("Saved log", "info", "Logging");
}

/**
 * A simple logging function
 * @param {String} message A messaged to be logged
 * @param {String} level  Loglevel, may either be warn, error, magic or info
 * @param {String} module Kinda the source
 */
function log(message, level, module, ignore = false) {
  if (level == undefined) {
    level = "info";
  }
  if (module == undefined) {
    module = "Unknown";
  }
  if(String(message) == "[object Object]"){
    message = util.inspect(message, false, null, false);
  }
  const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
  var message = timestamp + " [" + String(level) + "] " + " [" + String(module) + "] " + String(message);
  if (level == "warn") {
    console.warn(message.yellow);
  } else if (level == "error") {
    console.error(message.red);
  } else if (level == "magic") {
    console.error(message.magenta);
  } else if (level == "info") {
    console.info(message.white);
  } else {
    console.log(message.gray);
  }

  if(logToFileJson && ignore == false){
    jsonObject = {timestamp: timestamp, level: level, module: module, message: message};
    logJournal.push(jsonObject);
  }
}

module.exports = { log, init, close };