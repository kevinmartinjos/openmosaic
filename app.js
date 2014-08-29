function draw() {   
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var socket = io.connect();

    canvas.addEventListener('mousemove', function(evt)
    {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(evt.clientX, evt.clientY);
        ctx.stroke();
        pixels = ctx.getImageData(0, 0, 400, 400);
        socket.emit('message', pixels);
    });   
 }

draw();
