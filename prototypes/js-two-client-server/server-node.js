'use strict';

const http = require('http');
const sockjs = require('sockjs');

const config = require('./config.js');
const functions = require('./server.js');

// TODO error if not started by Node? or use this script also for the webworker?

const amsterdam = sockjs.createServer();
amsterdam.on('connection', function(connection) {
  functions.serverSocketConnectionOpen(connection);
  connection.on('data', function(message) {
    functions.serverMessageFromSocket(connection, message);
  });
  connection.on('close', function() {
    functions.serverSocketConnectionClose(connection);
  });
});

functions.worldStartup();

const server = http.createServer();
amsterdam.installHandlers(server, {prefix: config.CONFIG.serverWebsocketURL});
server.listen(config.CONFIG.serverPort, '0.0.0.0');
