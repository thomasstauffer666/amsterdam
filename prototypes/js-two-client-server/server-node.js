'use strict';

const http = require('http');
const sockjs = require('sockjs');

const config = require('./config.js');
const functions = require('./server.js'); // TODO rename to server

// TODO error if not started by Node? or use this script also for the webworker?

// TODO move into its own scope

let uniqueConnectionID = 0;

const amsterdam = sockjs.createServer();
amsterdam.on('connection', function(connection) {
  const connectionID = uniqueConnectionID;
  uniqueConnectionID += 1;
  functions.serverOpen(connectionID, connection);
  connection.on('data', function(message) {
    functions.serverMessageFromClient(connectionID, connection, message);
  });
  connection.on('close', function() {
    functions.serverSocketConnectionClose(connectionID, connection);
  });
});

functions.worldStartup();

const httpServer = http.createServer();
amsterdam.installHandlers(httpServer, {prefix: config.serverWebsocketURL});
httpServer.listen(config.serverPort, '0.0.0.0');
