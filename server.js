//Main server
var http = require("http");
var sys = require("sys");
var fs = require("fs");
var ds = require("./data_structures.js");
var io = require('socket.io');
var packer = require("./packer.js");

var port = 8000;
var localPath = __dirname;
var socket_list = [];
var canvas_list = [];

packer.setup(true);

function viewLayout(blockTree, _socket)
{
	_socket.emit('packerSetBound', packer.PackerProperties.max_width, packer.PackerProperties.max_height);
	for(var i=0; i<blockTree.length; i++)
	{
		sys.puts("Here");
		if(blockTree[i].free == true)
			socket_list.packer_view.emit('packerDrawRectangleFree', blockTree[i].x, blockTree[i].y, blockTree[i].width, blockTree[i].height);
		else
			socket_list.packer_view.emit('packerDrawRectangle', blockTree[i].x, blockTree[i].y, blockTree[i].width, blockTree[i].height);
	}
}

server = http.createServer(function(req, res)
{
	//One file might load many other files. Creating the filename dynamicall
	//so that those files would be loaded by the node server
	filename = localPath + req.url;
	sys.puts("Requesting for" + filename);

	fs.readFile(filename, function(err, contents)
	{
		if(!err)
		{
			res.statusCode = 200;
			res.end(contents);
		}
	});
});

server.listen(port);

io.listen(server).on('connection', function(socket){

	sys.puts("client connected");
	
	
	socket.on('canvasHello', function(dimensions)
	{
		socket_list.push(socket);
		canvas = new ds.CanvasBlock(dimensions[0], dimensions[1], false);
		canvas.socket = socket;
		canvas_list.push(canvas);

		viewLayout(packer.pack(canvas_list), socket);
	});

	socket.on('packer_view', function(){
		socket_list.packer_view = socket;
	});

	socket.on('line', function(coordinates)
	{
		socket.broadcast.emit('line', coordinates);
	})

	socket.on('drawRectangle', function(block)
	{
		sys.puts(block.width + "x" + block.height + "at" + block.x + "," + block.y);
		socket.broadcast.emit('drawRectangle', block)
	});

	socket.on('drawRectangleFree', function(block)
	{
		socket.broadcast.emit('drawRectangleFree', block)
	});

});

