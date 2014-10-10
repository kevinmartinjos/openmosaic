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
var socket_count=0;

//Draw the arrangement of the canvas blocks
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
		viewLayout(blockTree, socket);
	});

	//The packer_view is special, so it goes as an attribute
	socket.on('packer_view', function(){
		socket_list.packer_view = socket;
	});

	socket.on('line', function(coordinates)
	{
		socket.broadcast.emit('line', coordinates);
	})

});

