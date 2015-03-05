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

//Main server
var http = require("http");
var sys = require("sys");
var fs = require("fs");
var ds = require("./scripts/data_structures.js");
var io = require('socket.io');
var packer = require("./scripts/packer.js");

var clientTemplate = "./client_template.html"

var Globals = {
	port: 8000,
	localPath: __dirname,
	socketList: [],
	verbose: false,
	initWidth: 400,
	initHeight: 400,
	canvasList: [],
	packedBlockTree: [],
	socketCount: 0,
	sketch: process.argv[2]
};


if(Globals.sketch == null){
	sys.puts("provide a sketch name as argument");
	process.exit(1);
}

//Draw the arrangement of the canvas blocks at packer_view.html
function viewLayout(blockTree, _socket)
{
	Globals.socketList.packer_view.emit('packerSetBound', packer.PackerProperties.max_width, packer.PackerProperties.max_height);
	for(var i=0; i<blockTree.length; i++)
	{
		if(blockTree[i].free == true)
			Globals.socketList.packer_view.emit('packerDrawRectangleFree', blockTree[i].x, blockTree[i].y, blockTree[i].width, blockTree[i].height, blockTree[i].id);
		else
			Globals.socketList.packer_view.emit('packerDrawRectangle', blockTree[i].x, blockTree[i].y, blockTree[i].width, blockTree[i].height, blockTree[i].id);
	}
}


//translate the origin of the client canvases
function translateCanvases(blockTree)
{
	for(var i=0; i<blockTree.length; i++)
	{
		if(blockTree[i].free == false)
		{
			//sys.puts("translating " + i +" to " + blockTree[i].x * -1 + "," + blockTree[i].y * -1);
			blockTree[i].socket.emit('translate', blockTree[i].x * -1, blockTree[i].y * -1, getScaleFactor());
		}
	}
}

//The scaling factor - by how much each point should be scaled to fit
//the new total display
function getScaleFactor(){
	var scale_x = packer.PackerProperties.max_width/Globals.initWidth;
	var scale_y = packer.PackerProperties.max_height/Globals.initHeight;
	return {x: scale_x, y: scale_y};
}

server = http.createServer(function(req, res)
{
	//One file might load many other files. Creating the filename dynamically
	//so that those files would be loaded by the node server
	var filename = Globals.localPath + req.url;

	if(Globals.verbose)
		sys.puts("Requesting for" + filename);

	//If url ends with "/slave<no>", respond by sending the client template html file
	if(/\/slave\d/.test(req.url))
	{
		fs.readFile(clientTemplate, function(err, contents)
		{
			if(!err)
			{
				res.statusCode = 200;
				res.end(contents);
			}
		});
	}
	else
	{
		fs.readFile(filename, function(err, contents)
		{
			if(!err)
			{
				res.statusCode = 200;
				res.end(contents);
			}
		});
	}

});

server.listen(Globals.port);

io.listen(server).on('connection', function(socket){

	if(Globals.verbose)
		sys.puts("client connected");
	
	
	//Only canvases that emit this signal are added to the Globals.socketList
	socket.on('canvasHello', function(dimensions)
	{
		Globals.socketCount++;
		Globals.socketList.push(socket);
		var canvas = new ds.CanvasBlock(dimensions[0], dimensions[1], false);
		canvas.socket = socket;
		canvas.id = Globals.socketCount;

		Globals.canvasList.push(canvas);

		packer.setup(true);
		Globals.packedBlockTree = packer.pack(Globals.canvasList);

		//without this check, packer_view.html should be open
		//every time we run the program or it will crash
		if(Globals.socketList.packer_view != null)
			viewLayout(Globals.packedBlockTree, socket);
		
		//translateCanvases(blockTree);
		socket.emit('setSketch', Globals.sketch);
	});

	//The packer_view is special, so it goes as an attribute
	socket.on('packer_view', function(){
		Globals.socketList.packer_view = socket;
	});

	//load and start are buttons in packer_view.html
	socket.on('load', function(){
		socket.broadcast.emit('load');
	});

	socket.on('start', function(){
		translateCanvases(Globals.packedBlockTree);
	});


});

