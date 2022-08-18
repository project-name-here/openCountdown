const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, MenuItem, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const _ = require("underscore")
const open = require('open');
const childProcess = require('child_process');

const packageJson = JSON.parse(fs.readFileSync("package.json"))

// a minimal config
let configObject = {
    language: "en_uk",
    startMinimised: false,
    port: 3000
}
if (!fs.existsSync("config.json")) {
    fs.writeFileSync("config.json", "{}");
}
const tempJsonText = JSON.parse(fs.readFileSync("config.json", "utf8"));
configObject = _.extend(configObject, tempJsonText);
fs.writeFileSync("config.json", JSON.stringify(configObject));

const processArgs = process.argv;
// Check if --headless is passed as an argument
if (processArgs.includes("--headless")) {
    startServer()

} else {
    // Start electron 
    app.whenReady().then(() => {
        startServer()
        createTray()
        createWindow()
    })
    
    ipcMain.on('info', function () {
        if (win) {
            win.webContents.send('info', { "appStatus": "Testing", "appURL": "http://127.0.0.1:" + configObject.port, "appName": "openCountdown " + packageJson.version, "startMinimised": configObject.startMinimised, "port": configObject.port })
        }
    })
    
    ipcMain.on('skeleton-close', function (req, cb) {
        trayQuit()
    })
    
    ipcMain.on('skeleton-minimize', function (req, cb) {
        win.hide()
    })
    
    ipcMain.on('skeleton-launch-gui', function () {
        launchUI()
    })
    
    ipcMain.on('skeleton-start-minimised', function (e, msg) {
        configObject.startMinimised = msg
        fs.writeFileSync("config.json", JSON.stringify(configObject));
    })
    
    ipcMain.on('skeleton-bind-port', function (e, msg) {
        configObject.port = msg
        console.log("Update port")
        fs.writeFileSync("config.json", JSON.stringify(configObject));
        dialog.showMessageBoxSync({
            message: "Port changed. Restart openCountdown to apply change.",
            buttons: ["OK"]})
    })
}

var win, tray = null;


const createWindow = () => {
    win = new BrowserWindow({
        width: 370,
        height: 500,
        transparent: true,
        frame: false,
        resizable: false,
        icon: path.join(__dirname, 'static/logo/faviconLogo.svg'),
        webPreferences: {
            pageVisibility: true,
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'electronAssets/windowPreload.js'),
        }
    })




    win.loadFile('electronAssets/index2.html')
    if (configObject.startMinimised) {
        win.hide()
    }
}

function createTray() {
    tray = new Tray('static/logo/faviconLogo.png')
    tray.setIgnoreDoubleClickEvents(true)

    const menu = new Menu()
	menu.append(
		new MenuItem({
			label: 'Show window',
			click: showScreen,
		})
	)
	menu.append(
		new MenuItem({
			label: 'Launch GUI',
			click: launchUI,
		})
	)
	menu.append(
		new MenuItem({
			label: 'Quit',
            accelerator: 'Command+Q',
			click: trayQuit,
		})
	)

    tray.setToolTip('openCountdown ' + packageJson.version)
    tray.setContextMenu(menu)

    tray.on('click', function (e) {
        if (win.isVisible()) {
            win.hide()
        } else {
            win.show()
        }
    });
}

function showScreen(){
    win.show()
}

function launchUI(){
    open("http://127.0.0.1:" + configObject.port)
}

function trayQuit(){
    let options  = {
        buttons: ["Yes","No"],
        message: "Do you really want to quit openCountdown?"
       }
    let response = dialog.showMessageBoxSync(options)
    if(response == 0){
        srvProc.kill("SIGINT")
        setTimeout(app.quit, 1000)
    }
}


// taken from https://stackoverflow.com/a/22649812/11317151
function runScript(scriptPath, callback, valueCb) {

    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath);

    valueCb(process)
    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });
    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        // var err = code === 0 ? null : new Error('exit code ' + code);
        callback(code);
    });


}

srvProc = null;

function setServer(process){
    srvProc = process
}

function startServer(){
    runScript(path.join(__dirname, 'index.js'), function (err) {
        if (err) throw err;
    }, setServer)
}