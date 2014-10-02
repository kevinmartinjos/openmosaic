canvas = document.getElementById("canvas");
context = canvas.getContext("2d");
var socket = io.connect();


canvas.addEventListener('mousemove', function(evt){

	socket.emit('line', [0, 0, evt.clientX, evt.clientY]);
	line(0, 0, evt.clientX, evt.clientY);
});