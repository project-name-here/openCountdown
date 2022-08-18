document.getElementById('launch').addEventListener('click', function () {
	api.send('skeleton-launch-gui')
})

document.getElementById('hide').addEventListener('click', function () {
	api.send('skeleton-minimize')
})

document.getElementById('close').addEventListener('click', function () {
	api.send('skeleton-close')
})

api.receive('info', function (info) {
	document.getElementById('status').innerHTML = info.appStatus
	document.getElementById('url').innerHTML = info.appURL
	document.getElementById('model').innerHTML = `${info.appName}`
	document.getElementById('ift').checked = info.startMinimised
	document.getElementById('ifp').value = configObject.port
	document.title = info.appName
})
api.send('info')

document.getElementById('ifpb').addEventListener('click', function () {
	var e = document.getElementById('ifp')
	api.send('skeleton-bind-port', e.value)
})

document.getElementById('ift').addEventListener('click', function () {
	var e = document.getElementById('ift')
	api.send('skeleton-start-minimised', e.checked)
})

api.send('skeleton-ready')