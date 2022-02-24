function convertTimeOffset(){
    selTime = new Date().getTime() + document.getElementById('time2').valueAsNumber
    document.getElementById("time").value = selTime
}

function updateHiddenForm2(){
    document.getElementById("time4").value = document.getElementById('time3').value
}