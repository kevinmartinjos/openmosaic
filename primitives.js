var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");


function line(x1, y1, x2, y2)
{
	coordinates = []
	coordinates.push(x1);
	coordinates.push(y1);
	coordinates.push(x2);
	coordinates.push(y2);
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
}
