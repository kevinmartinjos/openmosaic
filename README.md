####Openmosaic Readme(for the lack of a better name)

Openmosaic uses javascript and nodejs to split up a sketch (html5 canvas thing) into multiple canvases.


####Requirements :

1) Nodejs
2) socket.io node packet [use 'npm install socket.io']
3) A modern web browser that supports html5 (chrome, chromium or firefox)

####How to :

1) 'node server.js' runs the server.

2) Open browser, go to "http://localhost:8000/packer_view.html". This shows which screens go where. Its use will become clear later. It is important that you open this page first.

3) In another tab, open "http://localhost:8000/slave1". This is your first client.

4) another tab-> "localhost:8000/slave2" to add another client. You can add as many clients as you want, as long as the url ends with slave<no>

5) In another tab, go to "locahost:8000/index.html". Move mouse over this page and you should see some lines. Look in the slave tabs and you should see the enlarged lines. If you want to see this properly, open the slave tabs in seperate phone screens. The correct arrangement needed is shown in packer_view.html tab.

6) Keep drawing lines. The display is updated in real time