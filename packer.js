var sys = require("sys");
var io = require("socket.io-client");

//Apparently this is how you connect a client nodejs script to the server
var socket = io.connect('http://localhost:8000', {reconnect: true});

//Dimensions of all the rectangles
var rectangleList = [[200, 200]];

//For the time being, assume a fixed bounding rectangle
var boundingWidth = 500;
var boundingHeight = 500;

//List of all free and non-free blocks
var blockTree = [];

//Object that represents a block
//boolean free - the block is free if set to true
function CanvasBlock(width, height, free)
{
	this.width = width;
	this.height = height;
	this.free = free;
}

CanvasBlock.prototype.setOrigin = function setOrigin(x, y){this.x = x; this.y = y;}

//Partitions the space horizontally and vertically
function guillotine(bounding_block, canvas)
{
	//Always go for horizontal partitioning

	new_x = canvas.x + canvas.width;
	new_y = canvas.y + canvas.height;

	//The horizontal partition
	horizontal = new CanvasBlock(bounding_block.width - new_x, new_y, true);
	horizontal.setOrigin(new_x, canvas.y);
	horizontal.free = true;

	vertical = new CanvasBlock(bounding_block.width, bounding_block.height - new_y, true);
	vertical.setOrigin(canvas.x, new_y);
	horizontal.free = true;

	return [horizontal, vertical];
}

//Add a CanvasBlock to the 'tree'
function addCanvas(canvas, blockTree)
{
	sys.puts(blockTree.length);
	for(var i=0; i<blockTree.length; i++)
	{
		current_block = blockTree[i];

		if(current_block.free == true)
		{
			if(current_block.width > canvas.width && current_block.height > canvas.height)
			{
				//Free block can accommodate the canvas
				canvas.setOrigin(current_block.x, current_block.y);
				partitions = guillotine(current_block, canvas);
				blockTree[i] = canvas;
				
				//Inserting the newly created partitions
				blockTree.splice(i+1, 0, partitions[0], partitions[1]);
				sys.puts("Block succcesfully added : " + blockTree[i].width + ":" + blockTree[i].height);
				break;
			}

		}
	}
}

function pack(rectangleList)
{

	//sorts the list based on x values
	rectangleList.sort();
	sys.puts(rectangleList);
	for(var i=rectangleList.length-1; i>=0; i--)
	{
		if(i == 0)
		{
			//Setting the bounding rectangle
			freeBlock = new CanvasBlock(boundingWidth, boundingHeight, true)
			freeBlock.setOrigin(0, 0);
			blockTree.push(freeBlock);
		}

		canvas = new CanvasBlock(rectangleList[i][0], rectangleList[i][1], false);
		addCanvas(canvas, blockTree);
	}
}

function render(blockTree)
{
	socket.emit('setBound', boundingWidth, boundingHeight);
	for(var i=0; i<blockTree.length; i++)
	{
		if(blockTree[i].free == true)
			socket.emit('drawRectangleFree', blockTree[i]);
		else
			socket.emit('drawRectangle', blockTree[i]);
	}
}

pack(rectangleList);
render(blockTree);
socket.disconnect();