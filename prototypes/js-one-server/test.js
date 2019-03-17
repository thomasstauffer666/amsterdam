
'use strict';

function isNodeJs() {
	return (typeof window) === 'undefined';
}

let player =  {
	x: 0,
	y: 0,
	direction: 'left',
	action: 'staying',
	jumpTargetY: undefined,
}

let g_conns = [];

let state = {
	'Shift': 'up',
	'ArrowDown': 'up',
	'ArrowLeft': 'up',
	'ArrowUp': 'up',
	'ArrowRight': 'up',
	' ': 'up',
};

function handleInput(message) {
	const data = JSON.parse(message);
	console.log(message);
	//console.log(data);
	//console.log(player);
	// TODO update
	state[data.key] = data.type;
	//console.log(player);
	//conn.write(JSON.stringify(player));
}

function send(message) {
	for(let i = 0; i < g_conns.length; i += 1) {
		const conn = g_conns[i];
		conn.write(message);
	}
}

function update() {
	player.action = 'staying';
	const isRunning = state['Shift'] === 'down';
	const speed = isRunning ? 5 : 1;
	if(state['ArrowLeft'] === 'down') {
		player.x -= speed;
		player.direction = 'left';
		player.action = isRunning ? 'running' : 'walking';
	}
	if(state['ArrowRight'] === 'down') {
		player.x += speed;
		player.direction = 'right';
		player.action = isRunning ? 'running' : 'walking';
	}
	if(state['ArrowUp'] === 'down') {
		player.y -= speed;
		player.action = isRunning ? 'running' : 'walking';
	}
	if(state['ArrowDown'] === 'down') {
		player.y += speed;
		player.action = isRunning ? 'running' : 'walking';
	}
	if(state[' '] === 'down') {
		player.jumpTargetY = player.y - 60;
	}
	if(player.jumpTargetY !== undefined) {
		player.action = 'jumping';
		if(player.y < player.jumpTargetY) {
			player.y += speed * 5;
		} else if(player.y > player.jumpTargetY) {
			player.y -= speed * 5;
		} else {
			player.jumpTargetY = undefined;
		}
	}

	send(JSON.stringify(player));

	const timeoutMs = isNodeJs() ? 50 : 1000;
	setTimeout(update, timeoutMs);
}

/*
function diff(a, b) {
	const len = a.length;
	let result = [];
	for(let i = 0; i < len; i += 1) {
		if(a[i] !== b[i]) {
			result.push(0);
		}
	}
}

function testdiff() {
	const N = 1024 * 1024;
	const a = new Uint8Array(N);
	const b = new Uint8Array(N);
	
	for(let i = 0; i < 50; i += 1) {
		const t1 = Date.now();
		diff(a, b);
		const t2 = Date.now();
		console.log(t2 - t1);
	}
}

testdiff();
*/

if(isNodeJs()) {
	const http = require('http');
	const sockjs = require('sockjs');

	const echo = sockjs.createServer({sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'});
	echo.on('connection', function(conn) {
		g_conns.push(conn);
		let thisconn = conn;
		conn.on('data', function(message) {
			handleInput(message);
		});
		conn.on('close', function() {
			console.log('close', g_conns.length);
			g_conns = g_conns.filter(item => item !== thisconn)
			console.log('close', g_conns.length);
		});
	});
	
	update();
	const server = http.createServer();
	echo.installHandlers(server, {prefix:'/amsterdam'});
	server.listen(9999, '0.0.0.0');
}
