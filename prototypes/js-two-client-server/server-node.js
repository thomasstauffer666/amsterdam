'use strict';

const http = require('http');
const sockjs = require('sockjs');

const config = require('./config.js');
const server = require('./server.js');

(() => {
  let uniqueConnectionID = 0;

  const amsterdam = sockjs.createServer();
  amsterdam.on('connection', function(connection) {
    const connectionID = uniqueConnectionID;
    uniqueConnectionID += 1;
    server.serverOpen(connectionID, connection);
    connection.on('data', function(message) {
      server.serverMessageFromClient(connectionID, connection, message);
    });
    connection.on('close', function() {
      server.serverClose(connectionID, connection);
    });
  });

  server.worldStartup();

  const httpServer = http.createServer();
  amsterdam.installHandlers(httpServer, {prefix: config.serverWebsocketURL});
  httpServer.listen(config.serverPort, '0.0.0.0');
})();
