var sketchGlobals = {
	x: 200,
	y: 200,
	modif: 5
};

function setup(){

	createCanvas(400, 400);
	frameRate(30);
}

function draw(){

	background(255);
	ellipse(sketchGlobals.x, sketchGlobals.y, 30, 30);
	sketchGlobals.y += sketchGlobals.modif;

	if(sketchGlobals.y > height || sketchGlobals.y < 0)
		sketchGlobals.modif *= -1;
}

function mousePressed(){
	fill(255, 0, 0);
}