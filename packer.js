var sys = require("sys");
//var io = require("socket.io-client");
//var socket = io.connect("http://localhost:8000", {reconnect: true});
var ds = require("./data_structures.js");

function PackerProperties(){};

function setup(_verbose)
{
	PackerProperties.max_width = 0;
	PackerProperties.max_height = 0;

	PackerProperties.bounding_width = 1 << 10;
	PackerProperties.bounding_height = 1 << 10;

	PackerProperties.aspect_ratio = 1;
	blockTree = [];
	PackerProperties.verbose = _verbose;

	return 1;

}

//Sorts the list of rectangles by their y value
sortByOrdinate = function(canvas_list){

	for(var i=0; i<canvas_list.length-1; i++)
	{
		for(var j=0; j<canvas_list.length-1; j++)
		{	
			if(canvas_list[j].height > canvas_list[j+1].height)
			{
				temp = canvas_list[j];
				canvas_list[j] = canvas_list[j+1];
				canvas_list[j+1] = temp;
			}
		}
	}

	return 1;
}


//Partitions the space horizontally and vertically
function _guillotine(bounding_block, canvas)
{
	//Always go for horizontal partitioning

	new_x = canvas.x + canvas.width;
	new_y = canvas.y + canvas.height;

	if(new_x > PackerProperties.bounding_width || new_y > PackerProperties.bounding_height)
		return null;

	//The horizontal partition
	horizontal = new ds.CanvasBlock(bounding_block.width - canvas.width, canvas.height, true);
	horizontal.setOrigin(new_x, canvas.y);
	horizontal.free = true;

	vertical = new ds.CanvasBlock(bounding_block.width, bounding_block.height - canvas.height, true);
	vertical.setOrigin(canvas.x, new_y);
	vertical.free = true;

	if(PackerProperties.verbose)
	{
		sys.puts("The partitions are : " + horizontal.width + "," + horizontal.height + " and " + vertical.width + "," + vertical.height);
	}
	return [horizontal, vertical];
}


//Add a ds.CanvasBlock to the 'tree'
function _addCanvas(canvas, blockTree)
{
	if(!canvas && !blockTree)
	{
		if(verbose)
			sys.puts("_addcanvas : argument undefined");

		return null;
	}
	
	if(PackerProperties.verbose)
	{
		sys.puts("adding canvas");
		sys.puts(blockTree.length);
	}

	for(var i=0; i<blockTree.length; i++)
	{
		current_block = blockTree[i];

		if(current_block.free == true)
		{
			
			if(current_block.width >= canvas.width && current_block.height >= canvas.height)
			{
				//Free block can accommodate the canvas

				predicted_width = PackerProperties.max_width;
				predicted_height = PackerProperties.max_height;

				//Checking if additon of the new canvas increases the maximum width or height
				if(current_block.x + canvas.width > PackerProperties.max_width)
				{
					predicted_width = current_block.x + canvas.width;
				}

				if(current_block.y + canvas.height > PackerProperties.max_height)
				{
					predicted_height = current_block.y + canvas.height;
				}

				//To keep the aspect ratio in check. Useless as of now
				if(predicted_width/predicted_height > PackerProperties.aspect_ratio)
					continue;


				//Adding the canvas to the blockTree
				blockTree[i] = canvas;
				canvas.setOrigin(current_block.x, current_block.y);

				partitions = _guillotine(current_block, canvas);
				
				if(partitions == null)
					break;
				
				if(canvas.x + canvas.width > PackerProperties.max_width)
					PackerProperties.max_width = canvas.x + canvas.width;
				if(canvas.y + canvas.height > PackerProperties.max_height)
					PackerProperties.max_height = canvas.y + canvas.height;


				//Inserting the newly created partitions
				if(partitions[0].width * partitions[0].height > 0)
					blockTree.splice(i+1, 0, partitions[0]);

				if(partitions[1].width * partitions[1].height > 0)
					blockTree.splice(i+2, 0, partitions[1]);

				
				if(PackerProperties.verbose)
					sys.puts("Block succcesfully added : " + blockTree[i].width + ":" + blockTree[i].height);
				
				//break the loop if a canvas is added
				break;
			}

		}
	}

	return 1;
}

function pack(canvas_list)
{
	//Stores info about all the blocks created by the packer
	var blockTree = [];

	//sorts the list based on x values
	sortByOrdinate(canvas_list);

	if(PackerProperties.verbose)
		sys.puts(canvas_list);
	
	for(var i=canvas_list.length-1; i>=0; i--)
	{
		if(i == canvas_list.length-1)
		{
			freeBlock = new ds.CanvasBlock(PackerProperties.bounding_width, PackerProperties.bounding_height, true)
			freeBlock.setOrigin(0, 0);
			blockTree.push(freeBlock);
		}
		var rc = _addCanvas(canvas_list[i], blockTree);
		if(!rc)
		{
			sys.puts("Warning : _addCanvas returns non-zero value");
			return null;
		}
	}

	_compactFreeBlocks(blockTree);
	return blockTree;
}


//The total canvas has got very large width and height initially
//This function trims it down to the obtained max_width and max_height
function _compactFreeBlocks(blockTree)
{

	for(var i=0; i<blockTree.length; i++)
	{
		block = blockTree[i];
		if(block.free == true)
		{
			if(block.x + block.width == PackerProperties.bounding_width)
				block.width = PackerProperties.max_width - block.x;
			if(block.y + block.height == PackerProperties.bounding_height)
				block.height = PackerProperties.max_height - block.y;
		}
	}
}

function render(blockTree)
{
	
	socket.emit('setBound', PackerProperties.max_width, PackerProperties.max_height);
	for(var i=0; i<blockTree.length; i++)
	{
		if(blockTree[i].free == true)
			socket.emit('drawRectangleFree', blockTree[i]);
		else
			socket.emit('drawRectangle', blockTree[i]);
	}
}

module.exports.PackerProperties = PackerProperties;
module.exports.verbose = PackerProperties.verbose;
module.exports.bounding_width = PackerProperties.bounding_width;
module.exports.bounding_height = PackerProperties.bounding_height;
module.exports.pack = pack;
module.exports.render = render;
module.exports.setup = setup;