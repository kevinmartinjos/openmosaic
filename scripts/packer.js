/*
copyright © Kevin Martin Jose

This file is part of openmosaic.

openmosaic is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

openmosaic is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with openmosaic.  If not, see <http://www.gnu.org/licenses/>.
*/

/*This module calculates how the client screens should be arranged
so as to make some sense out of the total frame. The results of 
the computations done here are viewed on packer_view.html*/

var sys = require("sys");
//var io = require("socket.io-client");
//var socket = io.connect("http://localhost:8000", {reconnect: true});
var ds = require("./data_structures.js");


//How it works:
//Imagine a really large rectangle. We fill the rectangle
//with our client canvas one by one, so that the resulting
//arrangement of clients is closes to our required
//aspect ratio.
//Refer to Matt Perdeck's article for more :
//http://www.codeproject.com/Articles/210979/Fast-optimizing-rectangle-packing-algorithm-for-bu

function PackerProperties(){};

//_verbose - show debug logs if true
function setup(_verbose)
{
	PackerProperties.max_width = 0;
	PackerProperties.max_height = 0;

	//The initial dimensions of the packer
	PackerProperties.bounding_width = 1 << 12;
	PackerProperties.bounding_height = 1 << 12;

	PackerProperties.aspect_ratio = 1;
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
				var temp = canvas_list[j];
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
	if(PackerProperties.verbose == true)
		sys.puts("_guillotine");

	var new_x = canvas.x + canvas.width;
	var new_y = canvas.y + canvas.height;

	if(new_x > PackerProperties.bounding_width || new_y > PackerProperties.bounding_height)
		return null;

	//The horizontal partition
	var horizontal = new ds.CanvasBlock(bounding_block.width - canvas.width, canvas.height, true);
	horizontal.setOrigin(new_x, canvas.y);
	horizontal.free = true;

	//vertical partition
	var vertical = new ds.CanvasBlock(bounding_block.width, bounding_block.height - canvas.height, true);
	vertical.setOrigin(canvas.x, new_y);
	vertical.free = true;

	if(PackerProperties.verbose)
	{
		sys.puts("The partitions are : " + horizontal.width + "," + horizontal.height + " and " + vertical.width + "," + vertical.height);
	}
	return [horizontal, vertical];
}


//Find the best place to insert the canvas
//and return that index
function _findInsertLocation(canvas, blockTree)
{
	var location = null;

	//An uncommon value to hold the 
	//best aspect ratio seen so far
	var best_ratio = 100;

	for(var i=0; i<blockTree.length; i++)
	{
		if(blockTree[i].free == true)
		{
			if(blockTree[i].width >= canvas.width && blockTree[i].height >= canvas.height)
			{
				var predicted_width = PackerProperties.max_width;
				var predicted_height =PackerProperties.max_height;

				if(blockTree[i].x + canvas.width > PackerProperties.max_width)
				{
					predicted_width = blockTree[i].x + canvas.width;
				}

				if(blockTree[i].y + canvas.height > PackerProperties.max_height)
				{
					predicted_height = blockTree[i].y + canvas.height;
				}

				var p_ratio = predicted_width/predicted_height;

				//we check if the predicted
				//aspect ratio is any better
				if(Math.abs(PackerProperties.aspect_ratio - p_ratio) < Math.abs(PackerProperties.aspect_ratio - best_ratio))
				{
					best_ratio = p_ratio;
					location = i;
				}
			}
		}
	}

	return location;
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
		sys.puts("BlockTree length : " + blockTree.length);
	}

	var i = _findInsertLocation(canvas, blockTree);
	if(PackerProperties.verbose)
	{
		if(i == null)
			sys.puts("cannot insert : could not find insert location");
	}

	canvas.setOrigin(blockTree[i].x, blockTree[i].y);

	partitions = _guillotine(blockTree[i], canvas);

	blockTree[i] = canvas;

	sys.puts("canvas origin : " + canvas.x + "," + canvas.y);
	if(partitions == null)
	{
		if(PackerProperties.verbose)
			sys.puts("could not create partitions");
	}

	if(canvas.x + canvas.width > PackerProperties.max_width)
		PackerProperties.max_width = canvas.x + canvas.width;
	if(canvas.y + canvas.height > PackerProperties.max_height)
		PackerProperties.max_height = canvas.y + canvas.height;

	//some times partitioning can return partitions
	//with zero area. We don't include them
	if(partitions[0].width * partitions[0].height > 0)
		blockTree.splice(i+1, 0, partitions[0]);
	if(partitions[1].width * partitions[1].height > 0)
		blockTree.splice(i+2, 0, partitions[1]);

	if(PackerProperties.verbose)
		sys.puts("Block succcesfully added  at + " + blockTree[i].x + "," + blockTree[i]. y + " : " + blockTree[i].width + ":" + blockTree[i].height);

	return 1;
}

function pack(canvas_list)
{
	//Stores info about all the blocks created by the packer
	var blockTree = [];

	//sorts the list based on x values
	sortByOrdinate(canvas_list);

	if(PackerProperties.verbose)
		sys.puts("canvas_list: " + canvas_list);
	
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


module.exports.PackerProperties = PackerProperties;
module.exports.verbose = PackerProperties.verbose;
module.exports.bounding_width = PackerProperties.bounding_width;
module.exports.bounding_height = PackerProperties.bounding_height;
module.exports.pack = pack;
module.exports.setup = setup;