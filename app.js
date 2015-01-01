/*
copyright © Kevin Martin Jose

This file is part of openmosaic.

openmosaic is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

openmosaic is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with openmosaic.  If not, see <http://www.gnu.org/licenses/>.
*/

/*Small app for demonstration purposes
*Shows a line moving across the screen
*Press arrow keys to change the direction of motion
*/

/*All code that goes to rendering the original canvas 
SHOULD be in app.js*/

canvas = document.getElementById("canvas");
context = canvas.getContext("2d");
var socket = io.connect();



var x = 0;
var y = 200;

//controls the direction
var xmod = 1;
var ymod = 0;

function draw(){
	/*We draw a line*/
	requestAnimationFrame(draw);


	//After every drawing action, we send the command to via sockets
	//to server, which sends it to all clients
	//The value inside brackets is a JSON string
	clearScreen();
	socket.emit('action', 'clearScreen', "{}");
	context.beginPath();
	socket.emit('action', 'context.beginPath',"{}");
	context.moveTo(x, y);
	//The JSON keys can be anything. Its okay if you had used "blah" instead of "a"
	socket.emit('action', 'context.moveTo', "{\"a\": ["+x+","+y+"]}");
	context.lineTo(x+10, y);
	socket.emit('action', 'context.lineTo', "{\"a\": ["+(x+10)+","+y+"]}");
	context.stroke();
	socket.emit('action', 'context.stroke',"{}");
	
	/*Move the line*/
	x= x + xmod;
	y = y + ymod;
}

/*Html canvas cannot listen to keyboard events unless 
it is focused. This event listener focuses the canvas
when we move mouse over it.
*/
canvas.addEventListener('mouseover', function(e){
	canvas.focus();
	return false;
}, false);

/*Listen to keyboard events and change direction
of motion (set variables) accordingly. Remember, the 
canvas should be focused by moving the mouse over
it for the key presses to work
*/
canvas.addEventListener('keypress', function(e){
	console.log("hurray");
	if(e.keyCode == 37){
		xmod = -1;
		ymod = 0;
	}
	else if(e.keyCode == 39){
		xmod = 1;
		ymod = 0;
	}
	else if(e.keyCode == 38){
		xmod = 0;
		ymod = -1;
	}
	else if(e.keyCode == 40){
		xmod = 0;
		ymod = 1;
	}}, false);

draw();


