var sys = require("sys");
var io = require("socket.io-client");

var verbose = true;

//Apparently this is how you connect a client nodejs script to the server
var socket = io.connect('http://localhost:8000', {reconnect: true});

//Dimensions of all the rectangles
var rectangleList = [[200, 400], [200, 200], [200, 200]];

//Setting boundingWidth as a very large number
var boundingWidth = 1<<14;

var boundingHeight = 1<<14;

//List of all free and non-free blocks
var blockTree = [];

var max_width = 0;
//Object that represents a block
//boolean free - the block is free if set to true

sortByOrdinate = function(rectangleList){

	for(var i=0; i<rectangleList.length-1; i++)
	{
		for(var j=0; j<rectangleList.length-1; j++)
		{	
			if(rectangleList[j][1] > rectangleList[j+1][1])
			{
				temp = rectangleList[j];
				rectangleList[j] = rectangleList[j+1];
				rectangleList[j+1] = temp;
			}
		}
	}
}
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

	if(new_x > boundingWidth || new_y > boundingHeight)
		return null;

	//The horizontal partition
	horizontal = new CanvasBlock(bounding_block.width - canvas.width, canvas.height, true);
	horizontal.setOrigin(new_x, canvas.y);
	horizontal.free = true;

	vertical = new CanvasBlock(bounding_block.width, bounding_block.height - canvas.height, true);
	vertical.setOrigin(canvas.x, new_y);
	horizontal.free = true;

	if(verbose)
	{
		sys.puts("The partitions are : " + horizontal.width + "," + horizontal.height + " and " + vertical.width + "," + vertical.height);
	}
	return [horizontal, vertical];
}

//Add a CanvasBlock to the 'tree'
function addCanvas(canvas, blockTree)
{
	sys.puts("adding canvas");
	sys.puts(blockTree.length);
	for(var i=0; i<blockTree.length; i++)
	{
		current_block = blockTree[i];

		if(current_block.free == true)
		{
			
			if(current_block.width >= canvas.width && current_block.height >= canvas.height)
			{
				//Free block can accommodate the canvas
				canvas.setOrigin(current_block.x, current_block.y);
				partitions = guillotine(current_block, canvas);
				if(partitions == null)
					break;
				if(canvas.x + canvas.width > max_width)
					max_width = canvas.x + canvas.width;

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
	sortByOrdinate(rectangleList);
	sys.puts(rectangleList);
	for(var i=rectangleList.length-1; i>=0; i--)
	{
		if(i == rectangleList.length-1)
		{
			//Setting the bounding rectangle
			boundingHeight = rectangleList[i][1];
			freeBlock = new CanvasBlock(boundingWidth, boundingHeight, true)
			freeBlock.setOrigin(0, 0);
			blockTree.push(freeBlock);
		}

		canvas = new CanvasBlock(rectangleList[i][0], rectangleList[i][1], false);
		addCanvas(canvas, blockTree);
	}
}

function compactFreeBlocks(blockTree)
{

	for(var i=0; i<blockTree.length; i++)
	{
		block = blockTree[i];
		if(block.free == true)
		{
			if(block.x + block.width == boundingWidth)
				block.width = max_width - block.x;
		}
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
compactFreeBlocks(blockTree);
render(blockTree);
socket.disconnect();