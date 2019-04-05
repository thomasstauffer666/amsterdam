'use strict';

const Server = () => {
  const config = require('./config.js');
  const sector = require('./sector.js');
  const functions = require('./functions.js');
  const worldData = require('../../asset/test-tiled/world-data.js');

  const IS_NODE_RUNNING = typeof module === 'object';

  // Model

  const world = {
    sector: undefined,
    players: {},
    connections: {},
  };

  // Server

  const serverMessageToAllClients = message => {
    const string = JSON.stringify(message);
    if (IS_NODE_RUNNING) {
      for (let connectionID in world.connections) {
        const connection = world.connections[connectionID].connection;
        connection.write(string);
      }
    } else {
      self.postMessage(string);
    }
  };

  const serverMessageToOneClient = (connectionID, message) => {
    const string = JSON.stringify(message);
    const length = string.length;
    if (length > 1000) {
      console.log(`server: warning message is ${length} bytes`);
    }

    if (IS_NODE_RUNNING) {
      const connection = world.connections[connectionID].connection;
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
    world.connections[connectionID] = {
      connection: connection,
      playerName: undefined,
    };
  };

  const serverClose = (connectionID, connection) => {
    delete world.connections[connectionID];
  };

  // World

  const playerRegister = (name, password) => {
    const player = {
      name: name,
      password: password,
      x: 100,
      y: 100,
      state: '',
      tileUpdates: [],
    };
    return player;
  };

  const worldReceiveMessage = (connectionID, messages) => {
    const connection = world.connections[connectionID];
    const playerName = connection.playerName;
    const player = world.players[playerName];

    for (let i = 0; i < messages.length; i += 1) {
      const message = messages[i];
      // TODO maybe it is better to not send messages here and just store them for later?

      if (message.type === 'chat') {
        serverMessageToAllClients([{type: 'chat', text: playerName + ' ' + Date.now() + ': ' + message.text}]);
      } else if (message.type === 'register') {
        const name = message.name;
        const password = message.password;
        if (name.length > 1 && password.length > 1 && !(name in world.players)) {
          world.players[name] = playerRegister(name, password);
        } else {
          // TODO from a security standpoint is it better to not give an answer at all?
          serverMessageToOneClient(connectionID, [{type: 'error', text: 'Already Registered'}]);
        }
      } else if (message.type === 'login') {
        const name = message.name;
        if (name in world.players && world.players[name].password === message.password) {
          world.connections[connectionID].playerName = name;
          serverMessageToOneClient(connectionID, [{type: 'sector-state', sector: world.sector}]);
        } else {
          serverMessageToOneClient(connectionID, [{type: 'error', text: 'Invalid Credentials'}]);
        }
      } else if (message.type === 'action-start') {
        if (message.action === 'use') {
          const index = Math.floor((world.sector.width * world.sector.height) / 2);
          world.players[playerName].tileUpdates.push([index, config.tileNames.Fire]);
        } else if (message.action === 'left') {
          // TODO
        } else if (message.action === 'right') {
          // TODO
        } else if (message.action === 'jump') {
          // TODO
        }
      } else if (message.type === 'action-stop') {
        // TODO
      } else if (message.type === 'tile-set') {
        const index = Math.floor((world.sector.width * world.sector.height) / 2);
        world.players[playerName].tileUpdates.push([index, config.tileNames.Fire]);
      } else {
        console.log('server: unknown message from client', message);
      }
    }
  };

  const worldTick = () => {
    //serverMessageToAllClients({type: 'debug', message: 'tick'});

    const timer = new functions.Timer();

    const tilePlayerUpdates = [];
    // TODO only go through active players
    for (const playerName in world.players) {
      tilePlayerUpdates.push(...world.players[playerName].tileUpdates);
      world.players[playerName].tileUpdates = [];
    }

    //const connection = world.connections[connectionID];
    //const playerName = connection.playerName;
    //const player = world.players[playerName];

    const tileWorldUpdates = sector.simulationStep(world.sector);

    const tileUpdates = tilePlayerUpdates.concat(tileWorldUpdates);

    const deltaTimeMilliseconds = timer.elapsedMilliseconds();

    sector.mergeBlocks(world.sector, tileUpdates);
    if (tileUpdates.length > 0) {
      serverMessageToAllClients([{type: 'sector-update', updates: tileUpdates}]);
    }

    const tickMs = 500;
    setTimeout(worldTick, tickMs);
  };

  const worldStartup = () => {
    //const sizeFactor = 0.5;
    //world.sector = sector.create(Math.floor(140 * sizeFactor), Math.floor(70 * sizeFactor));
    world.sector = sector.load(worldData);
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
