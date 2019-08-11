var socket = io();

p5.prototype._originx = 0;
p5.prototype._originy = 0;
p5.prototype._mosaicScaleFactorX = 0;
p5.prototype._mosaicScaleFactorY = 0;

p5.prototype.mosaicStart = false;
p5.prototype.syncInterval = 0;
p5.prototype.syncCallback = null;

const get_screen_name = () => {
	const url = window.location.href;
	let re = /screen\/(\w+)$/;
	return re.exec(url)[1]

}
p5.prototype.mosaicTranslate = function(x_, y_){
	p5.prototype._originx = x_;
	p5.prototype._originy = y_;
	this.translate(this._originx, this._originy);
};

p5.prototype.mosaicInit = function(){
	
	socket.emit('screen_ready', get_screen_name());


	setSyncMethod(() => {
  		socket.emit('lock');
  	});

	socket.on('change_origin', function(x, y, scale){
		mosaicTranslate(x, y);
	});

	socket.on('start', () => {
		p5.prototype.mosaicStart = true;
		loop();
	});

	socket.on('unlock', function(){
		loop();
	});

}


// interval - number of frames elapsed before 'callback()' is invoked again
// callback - a function that emits the necessary signals to make 
// sure that the sketches in different screens are in sync.

p5.prototype.setSyncMethod = function(callback){
	p5.prototype.syncCallback = callback;
};

p5.prototype.mosaicKeepSync = function(){

	//Don't draw() until the user confirms that all
	//clients have connected
	if(p5.prototype.mosaicStart != true){
		this.noLoop();
	}
	else{
		//Maintains synchronization between sketches
		this.noLoop();
		p5.prototype.syncCallback();
	}
};

p5.prototype.registerMethod('pre', p5.prototype.mosaicKeepSync);
