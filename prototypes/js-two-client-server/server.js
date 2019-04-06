'use strict';

const Server = () => {
  const config = require('./config.js');
  const sector = require('./sector.js');
  const functions = require('./functions.js');
  const worldTiles = require('../../asset/test-tiled/world-data.js');

  const IS_NODE_RUNNING = typeof module === 'object';

  // Model

  const state = {
    sector: undefined,
    players: {},
    connections: {},
  };

  // Server

  const serverMessageToAllClients = message => {
    // TODO at the moment only send a message to logged in players, maybe there are some server messages for everyone
    const string = JSON.stringify(message);
    for (let connectionID in state.connections) {
      const connection = state.connections[connectionID].connection;
      if (state.connections[connectionID].player !== null) {
        if (IS_NODE_RUNNING) {
          connection.write(string);
        } else {
          self.postMessage(string);
        }
      }
    }
  };

  const serverMessageToOneClient = (connectionID, message) => {
    const string = JSON.stringify(message);
    const length = string.length;
    if (length > 1000) {
      console.log(`server: warning message is ${length} bytes`);
    }

    if (IS_NODE_RUNNING) {
      const connection = state.connections[connectionID].connection;
      connection.write(string);
    } else {
      self.postMessage(string);
    }
  };

  const serverMessageFromClient = (connectionID, connection, event) => {
    const message = JSON.parse(event);
    worldReceiveMessage(connectionID, message);
  };

  const serverOpen = (connectionID, connection) => {
    state.connections[connectionID] = {
      connectionID: connectionID,
      connection: connection,
      player: null,
    };
  };

  const serverClose = (connectionID, connection) => {
    delete state.connections[connectionID];
  };

  // World

  const playerCreate = (name, password) => {
    const player = {
      name: name,
      password: password,
      avatar: {
        x: 100,
        y: 100,
        state: '',
      },
      tileUpdates: [],
    };
    return player;
  };

  const worldReceiveMessage = (connectionID, messages) => {
    const connection = state.connections[connectionID];

    // TODO maybe it is better to not send messages here and just queue messages and handle them in the tick and send everyone just one message?

    for (let i = 0; i < messages.length; i += 1) {
      const message = messages[i];

      if (message.type === 'chat') {
        serverMessageToAllClients([{type: 'chat', text: connection.player.name + ' ' + Date.now() + ': ' + message.text}]);
      } else if (message.type === 'register') {
        const name = message.name;
        const password = message.password;
        if (name.length > 1 && password.length > 1 && !(name in state.players)) {
          state.players[name] = playerCreate(name, password);
        } else {
          // TODO from a security standpoint is it better to not give an answer at all?
          serverMessageToOneClient(connectionID, [{type: 'error', text: 'Already Registered'}]);
        }
      } else if (message.type === 'login') {
        const name = message.name;
        if (name in state.players && state.players[name].password === message.password) {
          connection.player = state.players[name];
          serverMessageToOneClient(connectionID, [{type: 'sector-state', sector: state.sector}]);
        } else {
          serverMessageToOneClient(connectionID, [{type: 'error', text: 'Invalid Credentials'}]);
        }
      } else if (message.type === 'action-start') {
        if (message.action === 'use') {
          const index = Math.floor((state.sector.width * state.sector.height) / 2 + state.sector.width / 2);
          connection.player.tileUpdates.push([index, sector.TILE_NAMES.Fire]);
        } else if (message.action === 'left') {
          connection.player.state = 'left'; // TODO walk left?
        } else if (message.action === 'right') {
          connection.player.state = 'right';
        } else if (message.action === 'jump') {
          connection.player.state = 'jump';
        }
      } else if (message.type === 'action-stop') {
        connection.player.state = '';
      } else if (message.type === 'tile-set') {
        const index = state.sector.width * message.y + message.x;
        connection.player.tileUpdates.push([index, message.id]);
      } else {
        console.log('server: unknown message from client', message);
      }
    }
  };

  const validConnections = () => {
    return Object.keys(state.connections)
      .map(connectionID => {
        return state.connections[connectionID];
      })
      .filter(connection => connection.player !== null);
  };

  const worldTick = () => {
    const timer = new functions.Timer();

    const connections = validConnections();

    const tilePlayerUpdates = [];
    // TODO only go through active players
    for (const playerName in state.players) {
      tilePlayerUpdates.push(...state.players[playerName].tileUpdates);
      state.players[playerName].tileUpdates = [];
    }

    connections.forEach(connection => {
      if (connection.player.state === 'left') {
        connection.player.avatar.x -= 10;
      } else if (connection.player.state === 'right') {
        connection.player.avatar.x += 10;
      } else if (connection.player.state === 'jump') {
        connection.player.avatar.y -= 10;
      }
    });

    const tileWorldUpdates = sector.simulationStep(state.sector);
    const tileUpdates = tilePlayerUpdates.concat(tileWorldUpdates);

    sector.mergeBlocks(state.sector, tileUpdates);

    const deltaTimeMilliseconds = timer.elapsedMilliseconds();

    // TODO only send if updated
    connections.forEach(connection => {
      serverMessageToOneClient(connection.connectionID, [{type: 'avatar', avatar: connection.player.avatar}]);
    });

    if (tileUpdates.length > 0) {
      serverMessageToAllClients([{type: 'sector-update', updates: tileUpdates}]);
    }

    const tickMs = 500;
    setTimeout(worldTick, tickMs);
  };

  const worldStartup = () => {
    state.sector = sector.load(worldTiles);
    worldTick();
  };

  return {
    worldStartup: worldStartup,
    serverOpen: serverOpen,
    serverMessageFromClient: serverMessageFromClient,
    serverClose: serverClose,
  };
};

if (typeof module === 'object') {
  module.exports = Server();
}
