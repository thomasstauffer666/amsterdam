'use strict';

const http = require('http');
const sockjs = require('sockjs');

const config = require('./config.js');
const functions = require('./server.js');

// TODO error if not started by Node? or use this script also for the webworker?

let uniqueConnectionID = 0;

const amsterdam = sockjs.createServer();
amsterdam.on('connection', function(connection) {
  const connectionID = uniqueConnectionID;
  uniqueConnectionID += 1;
  functions.serverSocketConnectionOpen(connectionID, connection);
  connection.on('data', function(message) {
    functions.serverMessageFromSocket(connectionID, connection, message);
  });
  connection.on('close', function() {
    functions.serverSocketConnectionClose(connectionID, connection);
  });
});

functions.worldStartup();

const server = http.createServer();
amsterdam.installHandlers(server, {prefix: config.serverWebsocketURL});
server.listen(config.serverPort, '0.0.0.0');
