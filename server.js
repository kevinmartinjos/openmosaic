const yargs = require("yargs");
const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const swig = require("swig");


const options = yargs
 .usage("Usage: -c <config file> -s <sketch file>")
 .option("c", { alias: "config", describe: "Path to config file", type: "string", demandOption: true })
 .option("s", { alias: "sketch", describe: "Path to sketch file", type: "string", demandOption: true })
 .argv;

const CLIENT_TEMPLATE = "./client_template.html"

let rawdata = fs.readFileSync(options.config);
let config = JSON.parse(rawdata);
let connected_screens = [];
let Globals = {
	lock_count: 0
}

app.use(express.static('.'));

app.get('/', function(req, res){
	res.send('<h1>Hello world</h1>');
});

app.get('/screen/:name/', function(req, res){
	const rendered = swig.renderFile(CLIENT_TEMPLATE, {sketch: "/" + options.sketch});
	res.send(rendered);
});

app.get('/start/', (req, res) => {
	connected_screens.forEach((screen_obj, index) => {
		screen_obj.socket.emit('start');
	});
	res.send('<span>Sketch must have started</span>');
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

io.on('connection', (socket) => {
	console.log("User connected")

	socket.on('screen_ready', (screen_name) => {
		if(!alreadyConnected(screen_name)) {
			connected_screens.push({
				'screen_name': screen_name,
				'screen_config': config[screen_name],
				'socket': socket
			});
			socket.emit('change_origin', config[screen_name].origin[0], config[screen_name].origin[1]);		
		}
	});

	socket.on('lock', () => {
		Globals.lock_count += 1;
		if(Globals.lock_count == connected_screens.length){
			connected_screens.forEach((screen_obj, index) => {
				screen_obj.socket.emit('unlock');
			});
			Globals.lock_count = 0;
		}
	});
});

const alreadyConnected = (screen_name) => {
	for(var i in connected_screens) {
		screen_obj = connected_screens[i];
		if(screen_name == screen_obj.screen_name){
			return true;
		}
	}

	return false;
}