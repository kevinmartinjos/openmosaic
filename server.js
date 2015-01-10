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
var ds = require("./data_structures.js");
var io = require('socket.io');
var packer = require("./packer.js");

var client_template = "./client_template.html"

var port = 8000;
var localPath = __dirname;
var socket_list = [];

var verbose = false;

var init_width;
var init_height;

var canvas_list = [];

var socket_count=0;

//Draw the arrangement of the canvas blocks at packer_view.html
function viewLayout(blockTree, _socket)
{
	socket_list.packer_view.emit('packerSetBound', packer.PackerProperties.max_width, packer.PackerProperties.max_height);
	for(var i=0; i<blockTree.length; i++)
	{
		if(blockTree[i].free == true)
			socket_list.packer_view.emit('packerDrawRectangleFree', blockTree[i].x, blockTree[i].y, blockTree[i].width, blockTree[i].height, blockTree[i].id);
		else
			socket_list.packer_view.emit('packerDrawRectangle', blockTree[i].x, blockTree[i].y, blockTree[i].width, blockTree[i].height, blockTree[i].id);
	}
}

function translateCanvases(blockTree)
{
	for(var i=0; i<blockTree.length; i++)
	{
		if(blockTree[i].free == false)
		{
			//sys.puts("translating " + i +" to " + blockTree[i].x * -1 + "," + blockTree[i].y * -1);
			blockTree[i].socket.emit('translate', blockTree[i].x * -1, blockTree[i].y * -1);
		}
	}
}

/*Scale a single point to collective screen dimensions*/
function scalePoint(point)
{
	scale_x = packer.PackerProperties.max_width/init_width;
	scale_y = packer.PackerProperties.max_height/init_height;

	point[0] = point[0] * scale_x;
	point[1] = point[1] * scale_y;
}

/*Go through each and every key:value pairs
in the json object and if it represents coordinate
values, scale it according to the size of the client
screens*/ 
function scale(arg)
{
	for( var key in arg){
		if(arg.hasOwnProperty(key)){

			//if the key represents x, y coordinates
			if(arg[key].length == 2)
			{
				scalePoint(arg[key]);
			}
		}
	}
}

server = http.createServer(function(req, res)
{
	//One file might load many other files. Creating the filename dynamically
	//so that those files would be loaded by the node server
	filename = localPath + req.url;

	if(verbose)
		sys.puts("Requesting for" + filename);

	//If url ends with "/slave<no>", respond by sending the client template html file
	if(/\/slave\d/.test(req.url))
	{
		fs.readFile(client_template, function(err, contents)
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

server.listen(port);

io.listen(server).on('connection', function(socket){

	if(verbose)
		sys.puts("client connected");
	
	
	//Only canvases that emit this signal are added to the socket_list
	socket.on('canvasHello', function(dimensions)
	{
		socket_count++;
		socket_list.push(socket);
		canvas = new ds.CanvasBlock(dimensions[0], dimensions[1], false);
		canvas.socket = socket;
		canvas.id = socket_count;

		canvas_list.push(canvas);

		packer.setup(true);
		blockTree = packer.pack(canvas_list);

		//without this check, packer_view.html should be open
		//every time we run the program or it will crash
		if(socket_list.packer_view != null)
			viewLayout(blockTree, socket);
		
		translateCanvases(blockTree);
	});

	//The packer_view is special, so it goes as an attribute
	socket.on('packer_view', function(){
		socket_list.packer_view = socket;
	});

	socket.on('master', function(width, height)
	{
		init_width = width;
		init_height = height;
	});

	//callback accepts the name of the function,
	//the number of arguments and the arguments
	//as a json string
	//Handles all the socket.emits in app.js
	socket.on('action', function(functionName, args){
		var jsonObject = JSON.parse(args);
		
		scale(jsonObject);

		//making json object string
		var toSendArgs = "";
		for(var key in jsonObject){
			if(jsonObject.hasOwnProperty(key))
				toSendArgs = toSendArgs + jsonObject[key] + ",";
		}
		if(toSendArgs.length != 0)
			toSendArgs = toSendArgs.substring(0, toSendArgs.length-1);
				
		socket.broadcast.emit('action', functionName, toSendArgs);
	});

	socket.on('commandList', function(commands){

		for(var i in commands){
			var command = commands[i];

			if(command["type"] == "pos")
				scale(command["args"]);
		}

		socket.broadcast.emit('commandList', commands);
	});

});

