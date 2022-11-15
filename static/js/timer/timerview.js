

// References to the HTML elements
let warningBox = document.getElementById("warningBanner");
let timer = document.getElementById("timer");
let testImage = document.getElementById("testImg");
let clockSec = document.getElementById("clockSec");
let timeDiffContainer = document.getElementById("timediff");
let wholeProgressBar = document.getElementById("wholeProgBar");
let progressBar = document.getElementById("progBar");
let overlay = document.getElementById("overlay");
let overlayText = document.getElementById("text");
let screensaverText = document.getElementById("moveClock");
let screensaverClock = document.getElementById("screensaverClock");

// Prepare connection to backend
let socket = new ReconnectingWebSocket("ws://127.0.0.1:" + location.port);

// State variables
let ackSessionTokenChange = false; // Wether the user has acknowledged the session token mismatch
let dataFrame = {};
let timeDiffToServer = 0;
let sessionToken = ""; // Our current session token
let defaultToFullscreen = false;
let allowFullscreen = true; // If the system is allowed to go fullscreen

// Scale down the interface if the smaller parameter is set
let smallerFlag = new URLSearchParams(window.location.search).get("smaller");
if (smallerFlag == "true") {
	var cssURL = '/css/smallerTextMod.css';
	document.head.innerHTML += '<link rel="stylesheet" href="' + cssURL + '"/>';
	allowFullscreen = false;
}

// Handle the screensaver to fit the screen
setTimeout(handleDVD, 200);
setTimeout(handleDVD, 400);
document.body.onresize = handleDVD;

// Handle connection event
socket.onopen = function (e) {
	socket.send("new client");
};

// Handle connection close event 
socket.onclose = function (event) {
	warningBox.style.display = "block"; // Show warning banner
	if (event.wasClean) {
		console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
	} else {
		// e.g. server process killed or network down
		// event.code is usually 1006 in this case
		console.error('[close] Connection died');
	}
};

// Handle incoming data
socket.onmessage = function (event) {
	// Parse the incoming data as JSON
	const inData = JSON.parse(event.data);
	// Check if the backend has restarted in the background
	if (inData.sessionToken == sessionToken || sessionToken == "") {
		dataFrame = JSON.parse(event.data);
		// Time difference between the client and the server
		timeDiffToServer = new Date().getTime() - dataFrame.srvTime;

		if(dataFrame.debug) {
			console.log(dataFrame)
			timeDiffContainer.innerHTML = timeDiffToServer
			timeDiffContainer.style.display = "block"
		} else {
			timeDiffContainer.style.display = "none"
		}

		// Process the data
		handleUpdate();
	} else {
		// If the user has not acknowledged the session token mismatch, show a warning
		if (!ackSessionTokenChange) {
			ackSessionTokenChange = true;
			if (confirm("Session token mismatch, reload the page?")) {
				location.reload();
			}
		}
	}
};

// Update timer data regularly (every 20ms)
let updateIntervalReference = setInterval(handleUpdate, 20);

// Helper functions

// Get the current time in a HH:MM:SS format
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

function percentage(partialValue, totalValue) {
	return (100 * partialValue) / totalValue;
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
		if (value <= parseInt(currColor)) {
			resColor = colors[String(currColor)]
			break
		}
	}
	return (resColor)
}

function handleUpdate() {
	defaultToFullscreen = dataFrame.defaultFullScreen;
	switch (dataFrame.mode) {
		case "timer":
			// Timer mode
			timer.style.display = "block";
			testImage.style.display = "none";
			screensaverText.style.display = "none";

			if(dataFrame.showTimeOnCountdown) {
				// Show time on countdown
				clockSec.innerHTML = getTime();
				clockSec.style.display = "block";
			} else {
				clockSec.style.display = "none";
			}
			if(dataFrame.showProgressbar) {
				// Show progressbar
				wholeProgressBar.style.display = "block";
			} else {
				wholeProgressBar.style.display = "none";
			}
			// Calculate the time difference between the goal and the current time
			const now = new Date();
			let diff = 0;
			if(dataFrame.timerRunState) {
				diff = dataFrame.countdownGoal - now.getTime()
			} else {
				diff = (now.getTime() - dataFrame.pauseMoment) + dataFrame.countdownGoal - now.getTime() 
			}
			 
			timer.innerHTML = msToTime(diff, dataFrame);

			// Handle the progressbar
			if (diff >= 0) {
				progressBar.style.width = percentage(diff, dataFrame.timeAmountInital) + "%";
			} else {
				progressBar.style.width = "0%";
			}
			progressBar.style.backgroundColor = findProgessColor(dataFrame.colorSegments, diff)

			// Handle the text color
			if (dataFrame.enableColoredText) {
				timer.style.color = findProgessColor(dataFrame.textColors, diff)
			} else {
				timer.style.color = "white"
			}
			break;
		case "clock":
			// Clock mode
			timer.innerHTML = getTime();
			testImage.style.display = "none";
			clockSec.style.display = "none";
			wholeProgressBar.style.display = "none";
			timer.style.display = "block";
			screensaverText.style.display = "none";
			timer.style.color = "white";
			break;
		case "black":
			// Black screen mode
			testImage.style.display = "none";
			clockSec.style.display = "none";
			wholeProgressBar.style.display = "none";
			timer.style.display = "none";
			screensaverText.style.display = "none";
			timer.style.color = "white";
			break;
		case "test":
			// Test image mode
			testImage.style.display = "block";
			clockSec.style.display = "none";
			wholeProgressBar.style.display = "none";
			timer.style.display = "none";
			screensaverText.style.display = "none";
			timer.style.color = "white";
			break;
		case "screensaver":
			// Screensaver mode
			testImage.style.display = "none";
			clockSec.style.display = "none";
			wholeProgressBar.style.display = "none";
			timer.style.display = "none";
			timer.style.color = "white";
			screensaverText.style.display = "block";
			screensaverClock.innerHTML = getTime();
			break;
	}

	// Handle the message overlay
	if (dataFrame.showMessage) {
		overlay.style.display = "block";
		overlayText.innerHTML = dataFrame.message
	} else {
		overlay.style.display = "none";
	}

	// This will result in the text fading in and out when the message changes
	if (new Date().getTime() - dataFrame.messageAppearTime < 5000) {
		if (!overlayText.classList.contains('blink')) {
			overlayText.classList.add("blink")
		}
	} else {
		if (overlayText.classList.contains('blink')) {
			overlayText.classList.remove("blink")
		}
	}
}

function handleDVD() {
	console.info("Recalculating screensaver size")
	const objHeight = document.body.offsetHeight - screensaverText.offsetHeight;
	const objWidth = document.body.offsetWidth - screensaverText.offsetWidth;
	document.documentElement.style.setProperty('--my-end-left', objWidth + "px");
	document.documentElement.style.setProperty('--my-end-top', objHeight + "px");
}

function enterFullscreen(element) {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.msRequestFullscreen) {
		element.msRequestFullscreen();
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	}
}

function updateFullscreen() {
	if (defaultToFullscreen && allowFullscreen) {
		enterFullscreen(document.documentElement)
	}
}