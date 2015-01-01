####Openmosaic Readme(for the lack of a better name)

Openmosaic uses javascript and nodejs to split up a sketch (html5 canvas thing) into multiple canvases. Imagine playing the classic game of snakes accross multiple screens.

####License
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

####Requirements :

1) Nodejs
2) socket.io node packet [use 'npm install socket.io']
2) A modern web browser that supports html5 (chrome, chromium or firefox or IE 10)

####How to :

1) I haven't tested this on windows. Should work fine.
2) First install [nodejs](http://nodejs.org/). And install socket.io for node. `npm install socket.io` should do it.
3) Install git on your machine and clone this repository.
4) Follow this instructions in the *precise* order given below: 
    a) Use terminal to `cd` to the directory where you downloaded openmosaic to and do `node server.js`. This should start the server
    b) Open your browser and go to `http://localhost:8000/packer_view.html`. That should open a blank screen
    c) Open a new window and go to `http://localhost:8000/slave1`. That should open a blank page too
    d) Switch the window to packer_view.html and now you should see a green box.
    e) Open another new window and go to `http://localhost:8000/slave2`. This should open up another new blank page. The number next to `slave` doesn't really matter. The server will open a blank page as long as the URL starts with `slave` and ends with a number
    f) The browser windows `slave1` and `slave2` that you have opened are basically 2 clients connected to our server. Think of them as two individual screens. Look at packer_view.html now and you should see TWO green boxes. Try scrolling a bit. The boxes are the exact same dimensions as the client screen. Since our two new browser windows are probably in widescreen resolution, the green boxes that represent them don't fit on the screen. I will fix this later. The blue number on the middle of the box represents how the client screens should be arranged physically to make sense of the collective picture.
    g) Open another new window and go to `localhost:8000/index.html`. Resize the slave1 and slave2 windows so that you can see both the slaves and your index.html at the same time. This will open a page with a small line moving across the screen. Move the mouse over the canvas to focus it. Now try pressing arrow keys on the keyboard to watch the line move in different directions.
    h) If everything went correctly, you should be able to see the line moving from the pages slave1 to slave2 (or reverse) as it moves from left to right in index.html
5) To better understand what's going on, open pages slave1 and slave2 on different computers (or preferably, smart phones).
6) Run the server on a computer and have your phones (or other computers) connected to the same network.
7) Open `localhost:8000/packer_view.html` on a browser on your computer, or open `<ipaddress_of_server>:8000/packer_view.html` from somewhere else.
8) Instead of `localhost:8000/slave1`, go to `<ipaddress_of_server>:8000/slave1` on your phone browser. Eg: `192.168.1.15:8000/slave1`. Similarly open slave2 on another phone
9) look at packer_view.html page on your computer and arrange the phones accordingly
10) open `localhost:8000/index.jsp` (or `<ipaddress_server>:8000/index.html` from anywhere else) on your computer running the server and you should see a line moving left to right. If everything went right, you should see the same line moving from one phone screen to another. Try moving mouse over the canvas in index.html to bring focus and press keyboard buttons to change direction of movement of the line.

####That did not work
If you followed the above instructions and you still could not get openmosaic to work, please open a new issue in github. Better yet, fix the problem and make a pull request :)

####Directory structure
1) server.js - the nodejs server. Takes information from index.html, performs some simple calculations, and distributes it to all the clients.
2) app.js - contains the actual code that runs in index.html. If you want to make your own game/program that runs accross multiple screens, this is the file you should edit
3) packer.js - Responsible for the green boxes in packer_view.html. packer.js determines how you should arrange the screens of your client so that the collective image/frame would correspond to the content in index.html canvas. I spend hours trying to come up with a working algorithm and finally hit upon this [great article](http://www.codeproject.com/Articles/210979/Fast-optimizing-rectangle-packing-algorithm-for-bu). The algorithm is adapted to suit my needs.
4) primitives.js - contains one useful function I wrote to make things easier. Will be removed sooner or later. Don't bother
5) data_structures.js - Contains data structures used in packer.js
6) client_template.html - the file that gets loaded every time you open a slave. eg('localhost:8000/slave5')
7) packer_view.html - contains the result of packer.js
8) index.html - takes code from app.js and executes it

####How it works
The node server calls packer.js every time a client connects to it. Packer.js gets the dimensions of the client screen and decides how the screen(s) should be arranged. When another client connects, packer.js is called again. The arrangement of screens can be viewed by navigating to packer_view.html
Opening index.html on the browser loads all the code in app.js and runs it in a canvas on index.html. If you go through app.js, you will see that a signal is emitted each time a function is called. The server distributes this signal to all the clients after scaling the arguments.For example, if you call `lineTo(200, 200)` in app.js, and you have 4 clients of screen size 200 x 200 each, each client will get a signal that asks it execute the function `lineTo` but with different arguments. 