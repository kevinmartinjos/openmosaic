//Main server
var http = require("http");
var sys = require("sys");
var fs = require("fs");

var io = require('socket.io');

var port = 8000;
var localPath = __dirname;
var socket_list = [];
var socket_count= -1;
var height;
var width;


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
	
	socket.on('setTotalCanvas', function(dimenstions){
		
		sys.puts("setTotalCanvas received");
		socket_list.push(socket);
		socket_list[socket_list.indexOf(socket)].width = dimenstions[0];
		socket_list[socket_list.indexOf(socket)].height = dimenstions[1];

		width = 0;
		height = 0;

		origin_x=0;
		origin_y=0;

		for(i=0; i<socket_list.length; i++)
		{
			if(socket_list.length % 2 != 0)
				break;
			if(i <= socket_list.length/2 - 1)
			{
				width = width + socket_list[i].width;
				origin_x = origin_x + socket_list[i].width;
			}
			
			if(i > socket_list.length/2 - 1)
			{
				height = height + socket_list[i].height;
				origin_y = origin_y + socket_list[i].height;
			}
		
		}

		sys.puts(width);
		sys.puts(height);
	});

	socket.on('line', function(coordinates)
	{
		socket.broadcast.emit('line', coordinates);
	})

	socket.on('setBound', function(width, height)
	{
		socket.broadcast.emit('setBound', width, height);
	});

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

