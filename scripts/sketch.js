var Globals = {
	x: 300,
	y: 0,
	width: 400,
	height: 400,
	start: false,
	frameCount: 0,
	clientCount: 1
};

function setup(){
	createCanvas(Globals.width, Globals.height);
}


function draw(){

	background(255);

	line(0, 0, Globals.x, Globals.y);

	Globals.y += 1;

	if(Globals.y > width)
		Globals.y = 0;

}

