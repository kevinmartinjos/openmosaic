var socket = io.connect();

p5.prototype._originx = 0;
p5.prototype._originy = 0;
p5.prototype._mosaicScaleFactorX = 0;
p5.prototype._mosaicScaleFactorY = 0;

p5.prototype.mosaicStart = false;
p5.prototype.syncInterval = 0;
p5.prototype.syncCallback = null;

p5.prototype.mosaicTranslate = function(x_, y_){
	this._originx = x_;
	this._originy = y_;
	this.translate(this._originx, this._originy);
};

p5.prototype.mosaicInit = function(){
	
	socket.emit('canvasHello', [width, height]);

	mosaicSync(1, function(){
  		socket.emit('lock');
  	});

	socket.on('translate', function(x, y, scale){
		mosaicTranslate(x, y);
		p5.prototype.mosaicStart = true;
		loop();
	});

	var canvas = document.getElementById('defaultCanvas');
	canvas.addEventListener('click', function(e){
			socket.emit('mousePressed', mouseX + p5.prototype._originx, mouseY + p5.prototype._originy);
	});

	socket.on('mousePressed', function(x, y){
		var e = document.createEvent('MouseEvents');
		e.initMouseEvent('click', true, true, window, 0, 0, 0, x, y, false, false, false, false, 0, null);
			
		//internal function. See src/input/mouse.js in p5.js source
		_updateMouseCoords(e);
		//call the mousePressed() function in the sketch
		mousePressed();
	});

	socket.on('unlock', function(){
		loop();
	});

}

//scales an (x,y) pair by the scaling factor
p5.prototype.mosaicScalePoint = function(point){
  point.x = point.x * this._mosaicScaleFactorX;
  point.y = point.y * this._mosaicScaleFactorY;
  return point;
};

// interval - number of frames elapsed before 'callback()' is invoked again
// callback - a function that emits the necessary signals to make 
// sure that the sketches in different screens are in sync.

p5.prototype.mosaicSync = function(interval, callback){
	p5.prototype.syncInterval = interval;
	p5.prototype.syncCallback = callback;
};

p5.prototype.mosaicKeepSync = function(){

	//Don't draw() until the user confirms that all
	//clients have connected
	if(p5.prototype.mosaicStart != true){
		this.noLoop();
		console.log('tried doing that');
	}
	else if(frameCount % p5.prototype.syncInterval == 0){
		//Maintains synchronization between sketches
		this.noLoop();
		p5.prototype.syncCallback();
	}
};

p5.prototype.registerMethod('pre', p5.prototype.mosaicKeepSync);
