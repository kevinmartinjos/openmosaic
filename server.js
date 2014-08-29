//Main server
var http = require("http");
var sys = require("sys");
var fs = require("fs");

var io = require('socket.io');
var clientio = require('socket.io-client'); 
var stream = require('stream');



var port = 8000;
var localPath = __dirname;

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

	sys.puts("client connected\n");
	socket.on('message', function(string)
	{
		//sys.puts(string);
	});
});
