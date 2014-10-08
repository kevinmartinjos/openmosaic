function CanvasBlock(width, height, free)
{
	this.width = width;
	this.height = height;
	this.free = free;
	this.id = null;
	this.socket = null;
}

CanvasBlock.prototype.setOrigin = function setOrigin(x, y){this.x = x; this.y = y;}

module.exports.CanvasBlock = CanvasBlock;
