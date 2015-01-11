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


/*code that displays the fps bar*/
/**
* @author mrdoob / http://mrdoob.com/
*https://github.com/mrdoob/stats.js/
*/
var Stats = function () {
var startTime = Date.now(), prevTime = startTime;
var ms = 0, msMin = Infinity, msMax = 0;
var fps = 0, fpsMin = Infinity, fpsMax = 0;
var frames = 0, mode = 0;
var container = document.createElement( 'div' );
container.id = 'stats';
container.addEventListener( 'mousedown', function ( event ) { event.preventDefault(); setMode( ++ mode % 2 ) }, false );
container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';
var fpsDiv = document.createElement( 'div' );
fpsDiv.id = 'fps';
fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
container.appendChild( fpsDiv );
var fpsText = document.createElement( 'div' );
fpsText.id = 'fpsText';
fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
fpsText.innerHTML = 'FPS';
fpsDiv.appendChild( fpsText );
var fpsGraph = document.createElement( 'div' );
fpsGraph.id = 'fpsGraph';
fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';
fpsDiv.appendChild( fpsGraph );
while ( fpsGraph.children.length < 74 ) {
var bar = document.createElement( 'span' );
bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
fpsGraph.appendChild( bar );
}
var msDiv = document.createElement( 'div' );
msDiv.id = 'ms';
msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
container.appendChild( msDiv );
var msText = document.createElement( 'div' );
msText.id = 'msText';
msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
msText.innerHTML = 'MS';
msDiv.appendChild( msText );
var msGraph = document.createElement( 'div' );
msGraph.id = 'msGraph';
msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';
msDiv.appendChild( msGraph );
while ( msGraph.children.length < 74 ) {
var bar = document.createElement( 'span' );
bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
msGraph.appendChild( bar );
}
var setMode = function ( value ) {
mode = value;
switch ( mode ) {
case 0:
fpsDiv.style.display = 'block';
msDiv.style.display = 'none';
break;
case 1:
fpsDiv.style.display = 'none';
msDiv.style.display = 'block';
break;
}
};
var updateGraph = function ( dom, value ) {
var child = dom.appendChild( dom.firstChild );
child.style.height = value + 'px';
};
return {
REVISION: 12,
domElement: container,
setMode: setMode,
begin: function () {
startTime = Date.now();
},
end: function () {
var time = Date.now();
ms = time - startTime;
msMin = Math.min( msMin, ms );
msMax = Math.max( msMax, ms );
msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
updateGraph( msGraph, Math.min( 30, 30 - ( ms / 200 ) * 30 ) );
frames ++;
if ( time > prevTime + 1000 ) {
fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );
fpsMin = Math.min( fpsMin, fps );
fpsMax = Math.max( fpsMax, fps );
fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
updateGraph( fpsGraph, Math.min( 30, 30 - ( fps / 100 ) * 30 ) );
prevTime = time;
frames = 0;
}
return time;
},
update: function () {
startTime = this.end();
}
}
};

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

canvas = document.getElementById("canvas");
context = canvas.getContext("2d");
var socket = io.connect();



// requestAnimFrame shim
window.requestAnimFrame = (function()
{
   return  window.requestAnimationFrame       || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame    || 
           window.oRequestAnimationFrame      || 
           window.msRequestAnimationFrame     || 
           function(callback)
           {
               window.setTimeout(callback);
           };
})();

// remove frame margin and scrollbars when maxing out size of canvas
document.body.style.margin = "0px";
document.body.style.overflow = "hidden";

// get dimensions of window and resize the canvas to fit
var width = window.innerWidth,
    height = window.innerHeight,
    mousex = width/2, mousey = height/2;
canvas.width = width;
canvas.height = height;

// get 2d graphics context and set global alpha
context.globalAlpha=0.25;

// setup aliases
var Rnd = Math.random,
    Sin = Math.sin,
    Floor = Math.floor;

// constants and storage for objects that represent star positions
var warpZ = 12,
    units = 100,
    stars = [],
    cycle = 0,
    Z = 0.025 + (1/25 * 2);

// mouse events
function addCanvasEventListener(name, fn)
{
   canvas.addEventListener(name, fn, false);
}
addCanvasEventListener("mousemove", function(e) {
   mousex = e.clientX;
   mousey = e.clientY;
});

function wheel (e) {
   var delta = 0;
   if (e.detail)
   {
      delta = -e.detail / 3;
   }
   else
   {
      delta = e.wheelDelta / 120;
   }
   var doff = (delta/25);
   if (delta > 0 && Z+doff <= 0.5 || delta < 0 && Z+doff >= 0.01)
   {
      Z += (delta/25);
      //console.log(delta +" " +Z);
   }
}
addCanvasEventListener("DOMMouseScroll", wheel);
addCanvasEventListener("mousewheel", wheel);

// function to reset a star object
function resetstar(a)
{
   a.x = (Rnd() * width - (width * 0.5)) * warpZ;
   a.y = (Rnd() * height - (height * 0.5)) * warpZ;
   a.z = warpZ;
   a.px = 0;
   a.py = 0;
}

// initial star setup
for (var i=0, n; i<units; i++)
{
   n = {};
   resetstar(n);
   stars.push(n);
}

// star rendering anim function
var rf = function()
{
   // clear background
   setTimeout(function(){
        stats.begin();
        requestAnimFrame(rf);
        var commands = [];

       context.fillStyle = "#000";
       context.fillRect(0, 0, width, height);

       //The "type" parameter is there so that in
       //future we can easily distinguish between
       //setting variables and calling
       //drawing functions
       commands.push({
       	'func': 'context.fillRect',
       	'type': "pos",
       	'args': {
       		"a": [0,0],
       		"b": [width, height]
       	}
       });

       //socket.emit('action', 'clearScreen', "{}");

       // mouse position to head towards
       var cx = (mousex - width / 2) + (width / 2),
           cy = (mousey - height / 2) + (height / 2);
       
       // update all stars
       var sat = Floor(Z * 500);       // Z range 0.01 -> 0.5
       if (sat > 100) sat = 100;
       
       for (var i=0; i<units; i++)
       {
          var n = stars[i],            // the star
              xx = n.x / n.z,          // star position
              yy = n.y / n.z,
              e = (1.0 / n.z + 1) * 2;   // size i.e. z
          
          if (n.px !== 0)
          {
             // hsl colour from a sine wave
             context.strokeStyle = "hsl(" + ((cycle * i) % 360) + "," + sat + "%,80%)";
             
	       /*This is how you set a variable on the client side
		   *Be careful with the arguments. See setVariable()
		   *in primitives.js. Not working as of now. Will fix it.
	       */

             
             commands.push({
		       	'func': 'setVariable',
		       	'type': "var",
		       	'args': {
		       		"a": "'context.strokeStyle'",
		       		"b": "\"'"+context.strokeStyle+"'\""
		       	}
       		});

             context.lineWidth = e;

			commands.push({
		       	'func': 'setVariable',
		       	'type': "var",
		       	'args': {
		       		"a": "'context.lineWidth'",
		       		"b": "\""+context.lineWidth+"\""
		       	}
       		});

             line(xx + cx, yy + cy, n.px + cx, n.py + cy);
             var x1 = xx + cx;
             var y1 = yy + cy;
             var x2 = n.px + cx;
             var y2 = n.py + cy;

             commands.push({
              'func': 'line',
               'type': "pos",
               'args': {
                  "a": [x1, y1],
                  "b": [x2, y2] 
               }
             });
          }
          
          // update star position values with new settings
          n.px = xx;
          n.py = yy;
          n.z -= Z;
          
          // reset when star is out of the view field
          if (n.z < Z || n.px > width || n.py > height)
          {
             // reset star
             resetstar(n);
          }
       }
       
       socket.emit('commandList', commands);

       // colour cycle sinewave rotation
       cycle += 0.01;
       stats.end();

   }, 1000/40);
   
   
};
requestAnimFrame(rf);



