var Globals = {
	x: 300,
	y: 0,
	width: 400,
	height: 400,
	start: false,
	frameCount: 0,
	clientCount: 1,
	unlocked:true
};

function setup(){
	createCanvas(Globals.width, Globals.height);
		socket.on('goahead', function(){
		console.log("recieved go ahead for "+Globals.frameCount);
		Globals.unlocked=true;
	});
}


function draw(){

	if(Globals.unlocked==true){
		background(255);
		
		line(0, 0, Globals.x, Globals.y);

		Globals.y += 1;

		if(Globals.y > width)
		Globals.y = 0;

		text("frame: "+Globals.frameCount,0,40)
		text("frame: "+Globals.frameCount,0,500)
		Globals.frameCount+=1;
	}
	
	if(Globals.frameCount%30==0){
			Globals.unlocked=false;
			socket.emit("reached");
			console.log("reached lock "+Globals.frameCount);
			Globals.frameCount+=1;
	}

}

