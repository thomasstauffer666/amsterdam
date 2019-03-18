'use strict';

const IS_NODE_RUNNING = typeof require === 'function';
const IS_WEBWORKER_RUNNONG = typeof importScripts === 'function';

const SERVER_PORT = 55555;
const SERVER_WEBSOCKET_URL = '/amsterdam';

const state = {
  serverInClient: false,
  socket: undefined,
  worker: undefined,
  connections: [],
  //players: [],
};

// Server

function serverSendMessageToClients(message) {
  const string = JSON.stringify(message);
  if (IS_NODE_RUNNING) {
    for (let i = 0; i < state.connections.length; i += 1) {
      const connection = state.connections[i];
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
  state.connections.push(connection);
}

function serverSocketConnectionClose(connection) {
  state.connections = state.connections.filter(item => item !== connection);
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

if (IS_NODE_RUNNING) {
  exports.IS_NODE_RUNNING = IS_NODE_RUNNING;
  exports.SERVER_WEBSOCKET_URL = SERVER_WEBSOCKET_URL;
  exports.SERVER_PORT = SERVER_PORT;
  exports.worldStartup = worldStartup;
  exports.serverSocketConnectionOpen = serverSocketConnectionOpen;
  exports.serverSocketConnectionClose = serverSocketConnectionClose;
  exports.serverMessageFromSocket = serverMessageFromSocket;
}
