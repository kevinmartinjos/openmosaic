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

/*I should rename the file to something more meaningful. In due time*/

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

/*easier way to clear the screen*/
function clearScreen()
{
	context.save();
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.restore();
}

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


/*Sets the value of a variable.
Make sure that the variable you
want to set it already defined. Not
doing so will define the variable
in global scope*/

function setVariable(varname, value){

	var evalString = "(" + varname + "=" + value + ")";
	eval(evalString);
}