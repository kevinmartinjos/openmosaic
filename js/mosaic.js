var socket = io.connect();

p5.prototype._originx = 0;
p5.prototype._originy = 0;
p5.prototype._mosaicScaleFactorX = 0;
p5.prototype._mosaicScaleFactorY = 0;

p5.prototype.mosaicStart = false;
p5.prototype.syncInterval = 0;
p5.prototype.syncCallback = null;

p5.prototype.mosaicTranslate = function(x_, y_){
	p5.prototype._originx = x_;
	p5.prototype._originy = y_;
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

	socket.on('mousePressed', function(x, y){
		var e = document.createEvent('MouseEvents');
		e.initMouseEvent('click', true, true, window, 0, 0, 0, x, y, false, false, false, false, 0, null);
		console.log('received mouse : ' + x + ',' + y);
		//internal function. See src/input/mouse.js in p5.js source
		_updateMouseCoords(e);
		//call the mousePressed() function in the sketch
		mousePressed();
	});

	socket.on('unlock', function(){
		loop();
	});

}

/*Overriding the p5.js version of this function*/
p5.prototype.onmousedown = function(e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;

    var e = new MouseEvent("mouseclick", {clientX: e.clientX - p5.prototype._originx,
    										clientY: e.clientY - p5.prototype._originy});
    this._setProperty('isMousePressed', true);
    this._setProperty('mouseIsPressed', true);
    this._setMouseButton(e);
    this._updateMouseCoords(e);
    if (typeof context.mousePressed === 'function') {
      executeDefault = context.mousePressed(e);
      if(executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.touchStarted === 'function') {
      executeDefault = context.touchStarted(e);
      if(executeDefault === false) {
        e.preventDefault();
      }
      this._updateTouchCoords(e);
    }

    socket.emit('mousePressed', mouseX, mouseY);
};

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
