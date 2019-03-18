'use strict';

const http = require('http');
const sockjs = require('sockjs');

const functions = require('./functions.js');

// TODO error if not started by Node? or use this script also for the webworker?

const echo = sockjs.createServer();
echo.on('connection', function(connection) {
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
echo.installHandlers(server, {prefix: functions.SERVER_WEBSOCKET_URL});
server.listen(functions.SERVER_PORT, '0.0.0.0');
