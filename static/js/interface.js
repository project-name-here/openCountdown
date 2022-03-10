function convertTimeOffset() {
    selTime = new Date().getTime() + document.getElementById('time2').valueAsNumber
    document.getElementById("time").value = selTime
}



function convertColorSegments(elementId) {
    const raw = document.getElementById(elementId);
    console.log(raw)
    const segmentData = {}
    for (elm in raw.children) {
        if (raw.children[elm].nodeName == "TBODY") {
            const child = raw.children[elm].firstChild.childNodes
            segmentData[child[0].innerText] = child[2].firstChild.value
        }
    }
    console.info(segmentData)
    return (segmentData)
}

$(document).ready(function () {
    $(".numVal").bind("DOMSubtreeModified", alert);

    const modes = ["timer", "clock", "black", "test"]
    let selectPresetTime = 0;

    if (Cookies.get("interfaceColor") != undefined) {
        const color = Cookies.get("interfaceColor");
        $("#Mbtnradio" + (color))[0].checked = true
        if (color == 1) {
            DarkReader.disable()
        } else if (color == 2) {
            DarkReader.enable()
        } else {
            DarkReader.auto()
        }
    }

    saveOption("/api/v1/system", function systemInfo(event) {
        const dataSystem = JSON.parse(event.originalTarget.response)
        document.getElementById("nodejsVers").innerHTML = dataSystem.nodeVersion

        const tree2 = jsonview.create(dataSystem);
        jsonview.render(tree2, document.getElementById("systemInfo"));
        jsonview.expand(tree2);
        // console.log(dataSystem)
    })

    $("#addRow").click(function (event) {
        $("#colors1").append(
            '<tr>' +
            '<td contenteditable="true" class="time"></td>' +
            '<td contenteditable="true" class="color"><input id="demo-input1" class="colorPicky" type="button" value="#COLOR#" /></td></td>' +
            '<td><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 deleteRow1">Remove</button></td>' +
            '</tr>'
        );
        $('.colorPicky').colorpicker();

    });

    $("#addRow2").click(function (event) {
        $("#colors2").append(
            '<tr>' +
            '<td contenteditable="true" class="time"></td>' +
            '<td contenteditable="true" class="color"><input id="demo-input2" class="colorPicky" type="button" value="#COLOR#" /></td></td>' +
            '<td><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 deleteRow1">Remove</button></td>' +
            '</tr>'
        );
        $('.colorPicky').colorpicker();
    });

    $("#copyColors").click(function CopyTextColors(event) {
        event.target.innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        saveOption("/api/v1/set/text/colors?copy=true", function finishCopyColors(event) {
            setTimeout(function () {
                document.getElementById("copyColors").innerHTML = "Copy from progressbar colors"
            }, 500)

        })
    });


    $("input[name='btnradio2']").click(function (event) {
        console.debug()
        const darkid = parseInt(event.currentTarget.id.replace("Mbtnradio", ""))
        if (darkid == 1) {
            DarkReader.disable()
        } else if (darkid == 2) {
            DarkReader.enable()
        } else {
            DarkReader.auto()
        }
        Cookies.set("interfaceColor", darkid)
    });

    // Restore settings
    saveOption("/api/v1/data", function (event, xmlHttp) {

        const tableEntry = ' <tr><td class="pt-3-half numVal" contenteditable="true">#VALUE#</td>\
            <td class="pt-3-half" contenteditable="false" style="background-color: #bg-COLOR#;"><input id="demo-input1" class="colorPicky" type="button" value="#COLOR#" /></td>\
            <td>\
                <span class="table-remove"><button type="button"\
                        class="btn btn-danger btn-rounded btn-sm my-0 deleteRow1">\
                        Remove\
                    </button></span>\
            </td></tr>'

        const jsonResult = JSON.parse(xmlHttp.response)
        //.innerHTML = JSON.stringify(jsonResult, null, 4)
        const tree = jsonview.create(jsonResult);
        jsonview.render(tree, document.getElementById("responeSnippet"));
        jsonview.expand(tree);
        // Restore mode radio
        const currentModeInt = modes.indexOf(jsonResult.mode);
        $("#btnradio" + (currentModeInt + 1))[0].checked = true
        // Restore layout settings
        $("#showTime")[0].checked = jsonResult.showTimeOnCountdown;
        $("#showMillis")[0].checked = jsonResult.showMilliSeconds;
        $("#progBarShow")[0].checked = jsonResult.showProgressbar;
        $("#textColors")[0].checked = jsonResult.enableColoredText;
        for (item in jsonResult.colorSegments) {
            let temp = tableEntry.replace("#VALUE#", item);
            temp = temp.replace("#COLOR#", jsonResult.colorSegments[item]);
            temp = temp.replace("#bg-COLOR#", jsonResult.colorSegments[item]);
            document.getElementById("colors1").innerHTML += temp
            console.log(jsonResult.colorSegments[item])
        }

        // Text colors
        for (item in jsonResult.textColors) {
            let temp = tableEntry.replace("#VALUE#", item);
            temp = temp.replace("#COLOR#", jsonResult.textColors[item]);
            temp = temp.replace("#bg-COLOR#", jsonResult.textColors[item]);
            document.getElementById("colors2").innerHTML += temp
            console.log(jsonResult.textColors[item])
        }



        console.debug(jsonResult, currentModeInt)
        $('.colorPicky').colorpicker();
        $('.colorPicky').on('colorpickerChange', function (event) {
            event.target.parentElement.style.backgroundColor = event.target.value
        });
        $(".deleteRow1").on("click", function removeRowEntry(event) {
            console.warn(event.target.parentElement)
            $(event.target).closest("tbody").remove();
        });
    })

    // Presets
    $(".pres").click(function (event) {
        currentTime = parseInt(event.currentTarget.value)
        const times = msToTime(currentTime)
        $("#timerHoursV")[0].innerHTML = times[3];
        $("#timerMinuteV")[0].innerHTML = times[2];
        $("#timerSecondsV")[0].innerHTML = times[1];
    })


    $(".goTimer").click(function (event) {
        event.currentTarget.innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        setTimeout(function () {
            event.currentTarget.innerHTML = 'Go'
        }, 200);

        saveOption("/api/v1/set/addMillisToTimer?time=" + currentTime, function (ev) {
        })
    })

    // Layout settings
    $("#applyLayout").click(function (event) {
        $("#applyLayout")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'

        // Collect all data, build all paths3
        const allPathes = [];

        const showTimeB = $("#showTime")[0].checked
        const showMillisB = $("#showMillis")[0].checked
        const progBarShowB = $("#progBarShow")[0].checked
        const textColorsB = $("#textColors")[0].checked

        const colors = convertColorSegments("colors1")
        const colors2 = convertColorSegments("colors2")

        console.log(JSON.stringify(colors))

        allPathes.push("/api/v1/set/layout/showTime?show=" + showTimeB)
        allPathes.push("/api/v1/set/layout/showMillis?show=" + showMillisB)
        allPathes.push("/api/v1/set/progressbar/show?show=" + progBarShowB)
        allPathes.push("/api/v1/set/text/enableColoring?enable=" + textColorsB)
        allPathes.push("/api/v1/set/progressbar/colors?isBase64=true&colors=" + btoa(JSON.stringify(colors)))
        allPathes.push("/api/v1/set/text/colors?isBase64=true&colors=" + btoa(JSON.stringify(colors2)))


        for (pI in allPathes) {
            const path = allPathes[pI];
            console.warn(path)
            saveOption(path, function (event) {
                console.debug(event)
            })
        }

        setTimeout(function () {
            $("#applyLayout")[0].innerHTML = 'Apply settings'
        }, 500)
    })


    $("#saveLayout").click(function (event) {
        $("#saveLayout")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'

        // Collect all data, build all paths3
        const allPathes = [];

        const showTimeB = $("#showTime")[0].checked
        const showMillisB = $("#showMillis")[0].checked
        const progBarShowB = $("#progBarShow")[0].checked
        const textColorsB = $("#textColors")[0].checked

        allPathes.push("/api/v1/set/layout/showTime?persist=true&show=" + showTimeB)
        allPathes.push("/api/v1/set/layout/showMillis?persist=true&show=" + showMillisB)
        allPathes.push("/api/v1/set/progressbar/show?persist=true&show=" + progBarShowB)
        allPathes.push("/api/v1/set/text/enableColoring?persist=true&enable=" + textColorsB)

        for (pI in allPathes) {
            const path = allPathes[pI];
            console.warn(path)
            saveOption(path, function (event) {
                console.debug(event)
            })
        }

        saveOption("/api/v1/storage/commit", function (event) {
            console.debug(event)
            setTimeout(function () {
                $("#saveLayout")[0].innerHTML = 'Save as startup settings (Layout only)'
            }, 500)
        })



    })


    function msToTime(s, data) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        let out = ""

        return [ms, secs, mins, hrs];
    }

    //  Timer custom
    let currentTime = 0;
    $("#timerHourInc").click(function (event) {
        currentTime += 3600000
        const times = msToTime(currentTime)
        $("#timerHoursV")[0].innerHTML = times[3];
        $("#timerMinuteV")[0].innerHTML = times[2];
        $("#timerSecondsV")[0].innerHTML = times[1];
    })

    $("#timerHourDec").click(function (event) {
        if (currentTime > 3600000) {
            currentTime -= 3600000
            const times = msToTime(currentTime)
            $("#timerHoursV")[0].innerHTML = times[3];
            $("#timerMinuteV")[0].innerHTML = times[2];
            $("#timerSecondsV")[0].innerHTML = times[1];
        }
    })

    $("#timerMinuteInc").click(function (event) {
        currentTime += 60000
        const times = msToTime(currentTime)
        $("#timerHoursV")[0].innerHTML = times[3];
        $("#timerMinuteV")[0].innerHTML = times[2];
        $("#timerSecondsV")[0].innerHTML = times[1];
    })
    $("#timerMinuteDec").click(function (event) {
        if (currentTime > 60000) {
            currentTime -= 60000
            const times = msToTime(currentTime)
            $("#timerHoursV")[0].innerHTML = times[3];
            $("#timerMinuteV")[0].innerHTML = times[2];
            $("#timerSecondsV")[0].innerHTML = times[1];
        }
    })
    $("#timerSecondsInc").click(function (event) {
        currentTime += 1000
        const times = msToTime(currentTime)
        $("#timerHoursV")[0].innerHTML = times[3];
        $("#timerMinuteV")[0].innerHTML = times[2];
        $("#timerSecondsV")[0].innerHTML = times[1];
    })
    $("#timerSecondsDec").click(function (event) {
        if (currentTime > 1000) {
            currentTime -= 1000
            const times = msToTime(currentTime)
            $("#timerHoursV")[0].innerHTML = times[3];
            $("#timerMinuteV")[0].innerHTML = times[2];
            $("#timerSecondsV")[0].innerHTML = times[1];
        }
    })

    $("input[name='btnradio']").click(function (event) {
        $("#sendMessage")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        let value = modes[parseInt(event.currentTarget.id.replace("btnradio", "")) - 1]
        console.log(value, parseInt(event.currentTarget.id.replace("btnradio", "")))
        saveOption("/api/v1/set/mode?mode=" + value, function (event) {
            setTimeout(function () {
                $("#sendMessage")[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16"> \
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/> \
                  </svg>'
            }, 200)

        })
    })


    $("#sendMessage").click(function (event) {
        $("#sendMessage")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        let value = $("#messageContent").val()
        saveOption("/api/v1/ctrl/message/show?msg=" + value, function (event) {
            setTimeout(function () {
                $("#sendMessage")[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16"> \
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/> \
                  </svg>'
            }, 200)

        })
    })

    $("#ctrlRemoveMessage").click(function (event) {
        $("#ctrlRemoveMessage")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        saveOption("/api/v1/ctrl/message/hide", function (event) {
            setTimeout(function () {
                $("#ctrlRemoveMessage")[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">\
                    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>\
                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>\
                  </svg>'
            }, 200)

        })
    })

    $("#funcPlay").click(function (event) {
        $("#funcPlay")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        saveOption("/api/v1/ctrl/timer/play", function (event) {
            setTimeout(function () {
                $("#funcPlay")[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path></svg>'
            }, 200);
        })
    })


    $("#funcPause").click(function (event) {
        $("#funcPause")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'

        saveOption("/api/v1/ctrl/timer/pause", function (event) {
            setTimeout(function () {
                $("#funcPause")[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause" viewBox="0 0 16 16" style="--darkreader-inline-fill: currentColor;" data-darkreader-inline-fill=""><path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"></path></svg>'
            }, 200);
        })
    })

    $("#funcRestart").click(function (event) {
        $("#funcRestart")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        saveOption("/api/v1/ctrl/timer/restart", function (event) {
            setTimeout(function () {
                $("#funcRestart")[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16" style="--darkreader-inline-fill: currentColor;" data-darkreader-inline-fill=""><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"></path><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"></path></svg>'
            }, 200)
        })
    })

    $("#applyDebug").click(function (event) {
        $("#applyDebug")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        let value = $("#debugModeEnable")[0].checked
        saveOption("/api/v1/debug?enable=" + value, function (event) {
            setTimeout(function () {
                $("#applyDebug")[0].innerHTML = "Apply settings"
            }, 200)

        })
    })

    $("a.nav-link").click(function (event) {
        event.preventDefault();
        $("a.nav-link").removeClass("active")

        event.currentTarget.classList.add("active")

        $(".pageC").addClass("hidden")
        $("#" + event.target.href.split("#")[1]).removeClass("hidden")
        console.log(event.target.href.split("#")[1])
    });
});

function saveOption(path, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", path, true); // false for synchronous request
    xmlHttp.send(null);
    xmlHttp.onerror = function (e) {
        console.log(e); // ToDo: Popup, etc.
    };
    xmlHttp.onloadend = function (event) {
        callback(event, xmlHttp)
    }
}