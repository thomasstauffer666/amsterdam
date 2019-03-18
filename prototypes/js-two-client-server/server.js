'use strict';

const IS_NODE_RUNNING = typeof require === 'function';
const IS_WEBWORKER_RUNNING = typeof importScripts === 'function';

const serverState = {
  socket: undefined,
  connections: [],
  //players: [],
};

// Server

function serverSendMessageToClients(message) {
  const string = JSON.stringify(message);
  if (IS_NODE_RUNNING) {
    for (let i = 0; i < serverState.connections.length; i += 1) {
      const connection = serverState.connections[i];
      connection.write(string);
    }
  } else {
    self.postMessage(string);
  }
}

function serverMessageFromClient(event) {
  const message = JSON.parse(event);
  console.log('from client', message);
  worldReceiveMessage(message);
}

function serverMessageFromWorker(event) {
  serverMessageFromClient(event.data);
}

function serverSocketConnectionOpen(connection) {
  serverState.connections.push(connection);
}

function serverSocketConnectionClose(connection) {
  serverState.connections = serverState.connections.filter(item => item !== connection);
}

function serverMessageFromSocket(connection, event) {
  serverMessageFromClient(event);
}

// World

function worldReceiveMessage(message) {}

function worldTick() {
  serverSendMessageToClients({type: 'debug', message: 'tick'});
  const timeoutMs = IS_NODE_RUNNING ? 1000 : 5000;
  setTimeout(worldTick, timeoutMs);
}

function worldStartup() {
  worldTick();
}

if (typeof exports !== 'undefined') {
  exports.worldStartup = worldStartup;
  exports.serverSocketConnectionOpen = serverSocketConnectionOpen;
  exports.serverSocketConnectionClose = serverSocketConnectionClose;
  exports.serverMessageFromSocket = serverMessageFromSocket;
}
