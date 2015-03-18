var sketchGlobals = {
	x: 200,
	y: 200,
	modif: 1,
	toggled: true
};

function setup(){
	createCanvas(400, 400);
	frameRate(30);
	mosaicInit();
}

function draw(){

	background(255);
	ellipse(sketchGlobals.x, sketchGlobals.y, 30, 30);
	sketchGlobals.y += sketchGlobals.modif;

	if(sketchGlobals.y > 700 || sketchGlobals.y < 0)
		sketchGlobals.modif *= -1;
}

function mousePressed(){

	if(sketchGlobals.toggled){
		fill(255, 0, 0);
		sketchGlobals.toggled = false;
	}else{
		fill(255);
		sketchGlobals.toggled = true;
	}
}