function convertTimeOffset() {
    selTime = new Date().getTime() + document.getElementById('time2').valueAsNumber
    document.getElementById("time").value = selTime
}


function convertColorSegments(elementId) {
    const raw = document.getElementById(elementId);
    const segmentData = {}
    for (elm in raw.children) {
        if (raw.children[elm].nodeName == "TR") {
            const child = raw.children[elm].children[1].children[0]
            let timeVal = parseInt(raw.children[elm].children[0].children[0].value * 1000);
            if(Number.isInteger(timeVal)){
                segmentData[timeVal] = child.style.color
            } else {
                segmentData["START"] = child.style.color
            }
        }
    }
    console.info(segmentData)
    return (segmentData)
}

$(function () {
    // $(".numVal").bind("DOMSubtreeModified", alert);

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

    saveOption("/api/v1/system", function systemInfoLoader(event) {
        const dataSystem = JSON.parse(event.target.response)
        document.getElementById("nodejsVers").innerHTML = dataSystem.nodeVersion
        document.getElementById("nodeSwVers").innerHTML = dataSystem.systemVersion

        const tree2 = jsonview.create(dataSystem);
        jsonview.render(tree2, document.getElementById("systemInfo"));
        jsonview.expand(tree2);
    })

    $("#addRow").on("click", function (event) {
        const tableEntryDom = document.getElementById("tableCopySource").cloneNode(true)
        let temp = tableEntryDom.innerHTML
        temp = temp.replace("#COLOR#", "gray");
        temp = temp.replace("#bg-COLOR#", "gray");
        temp = temp.replace("#VALUE#", 60); // BUG: Doesn't work but not too important
        temp = temp.replace("timeValue-ID", Math.floor(Math.random() * 9999999))
        tableEntryDom.innerHTML = temp;
        tableEntryDom.firstChild.nextSibling.children[0].classList.add("timeDurPicker")
        tableEntryDom.id = Math.floor(Math.random() * 9999999)
        document.getElementById("colors1").appendChild(tableEntryDom)
        $(".deleteRow1").on("click", function removeRowEntry(event) {
            $(event.target).closest("tr").remove();
        });
        $('.timeDurPicker').durationPicker({
            showSeconds: true,
            showDays: false,
            onChanged: function (newVal, test, val2) {
                //   $('#duration-label2').text(newVal);
                val2.days[0].parentElement.parentElement.parentElement.parentElement.children[1].value = newVal
                //console.log(val2.days[0].parentElement.parentElement.parentElement.parentElement.children[1].value)
                //console.log(val2.days[0].parentElement.parentElement.parentElement.parentElement.children[1])
            }
        });
    });

    $("#addRow2").on("click", function (event) {
        const tableEntryDom = document.getElementById("tableCopySource").cloneNode(true)
        let temp = tableEntryDom.innerHTML
        temp = temp.replace("#COLOR#", "gray");
        temp = temp.replace("#bg-COLOR#", "gray");
        temp = temp.replace("#VALUE#", 60); // BUG: Doesn't work but not too important
        temp = temp.replace("timeValue-ID", Math.floor(Math.random() * 9999999))
        tableEntryDom.innerHTML = temp;
        tableEntryDom.firstChild.nextSibling.children[0].classList.add("timeDurPicker")
        tableEntryDom.id = Math.floor(Math.random() * 9999999)
        document.getElementById("colors2").appendChild(tableEntryDom)
        $(".deleteRow1").on("click", function removeRowEntry(event) {
            $(event.target).closest("tr").remove();
        });
        $('.timeDurPicker').durationPicker({
            showSeconds: true,
            showDays: false,
            onChanged: function (newVal, test, val2) {
                //   $('#duration-label2').text(newVal);
                val2.days[0].parentElement.parentElement.parentElement.parentElement.children[1].value = newVal
            }
        });
    });

    

    // Restore settings
    saveOption("/api/v1/data", function (event, xmlHttp) {
        const jsonResult = JSON.parse(xmlHttp.response)
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
        console.log(document.getElementById("tableCopySource"))

        let tableEntryDom = document.getElementById("tableCopySource").cloneNode(true)
        let currIndex = 0
        for (item in jsonResult.colorSegments) {
            tableEntryDom = document.getElementById("tableCopySource").cloneNode(true)
            let temp = tableEntryDom.innerHTML
            temp = temp.replace("#COLOR#", jsonResult.colorSegments[item]);
            temp = temp.replace("#bg-COLOR#", jsonResult.colorSegments[item]);
            temp = temp.replace("timeValue-ID", "timeValue-1C" + currIndex)

            if(item != "START"){
                temp = temp.replace("#VALUE#", item/1000);
                tableEntryDom.innerHTML = temp;
                tableEntryDom.firstChild.nextSibling.children[0].classList.add("timeDurPicker")
            } else {
                tableEntryDom.innerHTML = temp;
                tableEntryDom.children[2].children[0].children[0].disabled = true;
                tableEntryDom.children[2].children[0].setAttribute("data-toggle", "tooltip")
                tableEntryDom.children[2].children[0].setAttribute("data-placement", "right")// 'data-placement="right" title="Tooltip on right"'
                tableEntryDom.children[2].children[0].setAttribute("title", "You cannot delete the start time")
                
                tableEntryDom.children[0].innerHTML = '<i class="bi bi-flag-fill"></i> Start'
            }
            tableEntryDom.id = "1C" + currIndex
            tableEntryDom.style.display = "table-row"
            document.getElementById("colors1").appendChild(tableEntryDom)
            currIndex++;
        }


        // Text colors
        currIndex = 0
        for (item in jsonResult.textColors) {
            tableEntryDom = document.getElementById("tableCopySource").cloneNode(true)
            let temp = tableEntryDom.innerHTML
            temp = temp.replace("#COLOR#", jsonResult.textColors[item]);
            temp = temp.replace("#bg-COLOR#", jsonResult.textColors[item]);
            temp = temp.replace("timeValue-ID", "timeValue-1C" + currIndex)

            if(item != "START"){
                temp = temp.replace("#VALUE#", item/1000);
                tableEntryDom.innerHTML = temp;
                tableEntryDom.firstChild.nextSibling.children[0].classList.add("timeDurPicker")
            } else {
                tableEntryDom.innerHTML = temp;
                tableEntryDom.children[2].children[0].children[0].disabled = true;
                tableEntryDom.children[2].children[0].setAttribute("data-toggle", "tooltip")
                tableEntryDom.children[2].children[0].setAttribute("data-placement", "right")// 'data-placement="right" title="Tooltip on right"'
                tableEntryDom.children[2].children[0].setAttribute("title", "You cannot delete the start time")
                
                tableEntryDom.children[0].innerHTML = '<i class="bi bi-flag-fill"></i> Start'
            }
            
            
            // timeDurPicker
            tableEntryDom.id = "1C" + currIndex
            tableEntryDom.style.display = "table-row"
            document.getElementById("colors2").appendChild(tableEntryDom)
            currIndex++;
        }


        $('.timeDurPicker').durationPicker({
            showSeconds: true,
            showDays: false,
            onChanged: function (newVal, test, val2) {
                val2.days[0].parentElement.parentElement.parentElement.parentElement.children[1].value = newVal
            }
        });



        //console.debug(jsonResult, currentModeInt)
        $('.colorPicky').on('colorpickerChange', function (event) {
            event.target.parentElement.style.backgroundColor = event.target.value
        });

        $(".deleteRow1").on("click", function removeRowEntry(event) {
            $(event.target).closest("tr").remove();
        });
        $('[data-toggle="tooltip"]').tooltip({container: "body"})
    })

    $("#copyColors").click(function CopyTextColors(event) {
        event.target.innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        saveOption("/api/v1/set/text/colors?copy=true", function finishCopyColors(event) {
            setTimeout(function () {
                document.getElementById("copyColors").innerHTML = "Copy from progressbar colors"
            }, 500)

        })
    });


    $("input[name='btnradio2']").click(function (event) {
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
    
    // Presets
    $(".pres").click(function (event) {
        currentTime = parseInt(event.currentTarget.value)
        $("#customValue").data("durationPicker").setValue(currentTime/1000)
    })


    $(".goTimer").on("click", function (event) {
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

        // Collect all data, build all paths
        const allPathes = [];

        const showTimeB = $("#showTime")[0].checked
        const showMillisB = $("#showMillis")[0].checked
        const progBarShowB = $("#progBarShow")[0].checked
        const textColorsB = $("#textColors")[0].checked

        const colors = convertColorSegments("colors1")
        const colors2 = convertColorSegments("colors2")

        allPathes.push("/api/v1/set/layout/showTime?show=" + showTimeB)
        allPathes.push("/api/v1/set/layout/showMillis?show=" + showMillisB)
        allPathes.push("/api/v1/set/progressbar/show?show=" + progBarShowB)
        allPathes.push("/api/v1/set/text/enableColoring?enable=" + textColorsB)
        allPathes.push("/api/v1/set/progressbar/colors?isBase64=true&colors=" + btoa(JSON.stringify(colors)))
        allPathes.push("/api/v1/set/text/colors?isBase64=true&colors=" + btoa(JSON.stringify(colors2)))


        for (pI in allPathes) {
            const path = allPathes[pI];
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
        if (currentTime >= 3600000) {
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
        if (currentTime >= 60000) {
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
        if (currentTime >= 1000) {
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
                $("#sendMessage")[0].innerHTML = '<i class="bi bi-send"></i>'
            }, 200)

        })
    })


    $("#sendMessage").click(function (event) {
        $("#sendMessage")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        let value = $("#messageContent").val()
        saveOption("/api/v1/ctrl/message/show?msg=" + value, function (event) {
            setTimeout(function () {
                $("#sendMessage")[0].innerHTML = '<i class="bi bi-send"></i>'
            }, 200)

        })
    })

    $("#ctrlRemoveMessage").click(function (event) {
        $("#ctrlRemoveMessage")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        saveOption("/api/v1/ctrl/message/hide", function (event) {
            setTimeout(function () {
                $("#ctrlRemoveMessage")[0].innerHTML = '<i class="bi bi-eye-slash-fill"></i>'
            }, 200)

        })
    })

    $("#funcPlay").click(function (event) {
        $("#funcPlay")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        saveOption("/api/v1/ctrl/timer/play", function (event) {
            setTimeout(function () {
                $("#funcPlay")[0].innerHTML = '<i class="bi bi-play-fill"></i>'
            }, 200);
        })
    })


    $("#funcPause").click(function (event) {
        $("#funcPause")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'

        saveOption("/api/v1/ctrl/timer/pause", function (event) {
            setTimeout(function () {
                $("#funcPause")[0].innerHTML = '<i class="bi bi-pause"></i>'
            }, 200);
        })
    })

    $("#funcRestart").click(function (event) {
        $("#funcRestart")[0].innerHTML = '<div class="spinner-border-sm spinner-border"></div>'
        saveOption("/api/v1/ctrl/timer/restart", function (event) {
            setTimeout(function () {
                $("#funcRestart")[0].innerHTML = '<i class="bi bi-arrow-clockwise"></i>'
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
        // console.log(event.target.href.split("#")[1])
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

navStatus = true
function openNav() {
    document.getElementById("navbarToggleExternalContent").style.width = "250px";
    document.getElementById("navbarToggleExternalContent").style.opacity = "1";
    document.getElementById("navbarToggleExternalContent").style.display = "block";
    document.getElementById("navbarToggleExternalContent").style.zIndex = 999999;
    document.getElementById("pageCont").style.marginLeft = "0px";
    navStatus = true
  }
  
  function closeNav() {
    document.getElementById("navbarToggleExternalContent").style.width = "0px";
    document.getElementById("navbarToggleExternalContent").style.opacity = "0";
    document.getElementById("navbarToggleExternalContent").style.display = "none";
    document.getElementById("navbarToggleExternalContent").style.zIndex = -999999;
    document.getElementById("pageCont").style.marginLeft = "0";
    navStatus = false
  }

  function toogleNav(){
      if(navStatus){
          closeNav()
      }else{
          openNav()
      }

  }