//Main server
var http = require("http");
var sys = require("sys");
var fs = require("fs");

var io = require('socket.io');
var clientio = require('socket.io-client'); 
var stream = require('stream');



var port = 8000;
var localPath = __dirname;
var socket_list = [];
var socket_count=0;

server = http.createServer(function(req, res)
{
	/*One file might load many other files. Creating the filename dynamicall
	so that those files would be loaded by the node server*/
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

	socket_count++;
	socket_list.push(socket);
	sys.puts("client connected\n");
	socket.on('line', function(coordinates)
	{
		socket.broadcast.emit('line', coordinates);
	})
});
