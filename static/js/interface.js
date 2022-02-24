function convertTimeOffset(){
    selTime = new Date().getTime() + document.getElementById('time2').valueAsNumber
    document.getElementById("time").value = selTime
}

function updateHiddenForm(){
    document.getElementById("time").value = document.getElementById('time2').valueAsNumber
}