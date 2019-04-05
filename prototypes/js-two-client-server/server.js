'use strict';

const Server = () => {
  const config = require('./config.js');
  const sector = require('./sector.js');
  const functions = require('./functions.js');

  const IS_NODE_RUNNING = typeof module === 'object';

  // Model

  const world = {
    sector: undefined,
    players: {},
    connections: {},
  };

  // Server

  const serverSendMessageToAllClients = message => {
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

  const serverSendMessageToOneClient = (connectionID, message) => {
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

  const serverSocketConnectionClose = (connectionID, connection) => {
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
      blockUpdates: [],
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
        serverSendMessageToAllClients([{type: 'chat', text: playerName + ' ' + Date.now() + ': ' + message.text}]);
      } else if (message.type === 'register') {
        const name = message.name;
        const password = message.password;
        if (name.length > 1 && password.length > 1 && !(name in world.players)) {
          world.players[name] = playerRegister(name, password);
        } else {
          // TODO from a security standpoint is it better to not give an answer at all?
          serverSendMessageToOneClient(connectionID, [{type: 'error', text: 'Already Registered'}]);
        }
      } else if (message.type === 'login') {
        const name = message.name;
        if (name in world.players && world.players[name].password === message.password) {
          world.connections[connectionID].playerName = name;
          serverSendMessageToOneClient(connectionID, [{type: 'sector-state', sector: world.sector}]);
        } else {
          serverSendMessageToOneClient(connectionID, [{type: 'error', text: 'Invalid Credentials'}]);
        }
      } else if (message.type === 'action-start') {
        if (message.action === 'use') {
          const index = Math.floor((world.sector.width * world.sector.height) / 2);
          world.players[playerName].blockUpdates.push([index, config.blockNames.Fire]);
        } else if (message.action === 'left') {
          // TODO
        } else if (message.action === 'right') {
          // TODO
        } else if (message.action === 'jump') {
          // TODO
        }
      } else if (message.type === 'action-stop') {
        // TODO
      } else if (message.type === 'block-set') {
        const index = Math.floor((world.sector.width * world.sector.height) / 2);
        world.players[playerName].blockUpdates.push([index, config.blockNames.Fire]);
      } else {
        console.log('server: unknown message from client', message);
      }
    }
  };

  const worldTick = () => {
    //serverSendMessageToAllClients({type: 'debug', message: 'tick'});

    const blocks = world.sector.blocks;

    const timer = new functions.Timer();

    const blockUpdates = [];
    // TODO only go through active players
    for (const playerName in world.players) {
      blockUpdates.push(...world.players[playerName].blockUpdates);
      world.players[playerName].blockUpdates = [];
    }

    //const connection = world.connections[connectionID];
    //const playerName = connection.playerName;
    //const player = world.players[playerName];

    for (let y = 1; y < world.sector.height - 1; y += 1) {
      for (let x = 1; x < world.sector.width - 1; x += 1) {
        const index = y * world.sector.width + x;
        // Left/Right/Top/Bottom
        const indexL = y * world.sector.width + x - 1;
        const indexR = y * world.sector.width + x + 1;
        const indexT = (y - 1) * world.sector.width + x;
        const indexB = (y + 1) * world.sector.width + x;
        if (blocks[index] === config.blockNames.Wood) {
          if (blocks[indexL] === config.blockNames.Fire || blocks[indexR] === config.blockNames.Fire || blocks[indexT] === config.blockNames.Fire || blocks[indexB] === config.blockNames.Fire) {
            blockUpdates.push([index, config.blockNames.Fire]);
          }
        }
      }
    }

    const deltaTimeMilliseconds = timer.elapsedMilliseconds();

    sector.mergeBlocks(world.sector, blockUpdates);
    if (blockUpdates.length > 0) {
      serverSendMessageToAllClients([{type: 'sector-update', updates: blockUpdates}]);
    }

    const tickMs = 500;
    setTimeout(worldTick, tickMs);
  };

  const worldStartup = () => {
    const sizeFactor = 0.5;
    world.sector = sector.create(Math.floor(140 * sizeFactor), Math.floor(70 * sizeFactor));
    worldTick();
  };

  return {
    worldStartup: worldStartup,
    serverOpen: serverOpen,
    serverMessageFromClient: serverMessageFromClient,
    serverSocketConnectionClose: serverSocketConnectionClose,
  };
};

if (typeof module === 'object') {
  module.exports = Server();
}
