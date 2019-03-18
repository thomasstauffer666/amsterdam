'use strict';

const server = (function() {
  const config = typeof configGlobal === 'undefined' ? require('./config.js') : configGlobal;

  // TODO remove this global
  const IS_NODE_RUNNING = typeof module === 'object';

  // Model
  const world = {
    map: undefined,
    players: {},
    connections: {},
  };

  // Server

  function serverSendMessageToAllClients(message) {
    const string = JSON.stringify(message);
    if (IS_NODE_RUNNING) {
      for (let connectionID in world.connections) {
        const connection = world.connections[connectionID];
        connection.write(string);
      }
    } else {
      self.postMessage(string);
    }
  }

  function serverSendMessageToOneClient(connectionID, message) {
    // TODO handle id
    const string = JSON.stringify(message);
    const length = string.length;
    if (length > 1000) {
      console.log(`server: warning message is ${length} bytes`);
    }

    if (IS_NODE_RUNNING) {
      serverSendMessageToAllClients(message);
    } else {
      self.postMessage(string);
    }
  }

  function serverMessageFromClient(connectionID, connection, event) {
    const message = JSON.parse(event);
    worldReceiveMessage(connectionID, message);
  }

  function serverMessageFromWorker(event) {
    serverMessageFromClient(undefined, undefined, event.data);
  }

  function serverSocketConnectionOpen(connectionID, connection) {
    world.connections[connectionID] = connection;
  }

  function serverSocketConnectionClose(connectionID, connection) {
    delete world.connections[connectionID];
  }

  function serverMessageFromSocket(connectionID, connection, event) {
    serverMessageFromClient(connectionID, connection, event);
  }

  // World

  /*
1024 x 1024 JSON.stringify -> ca. 11 MB
*/
  function mapCreate(width, height) {
    // TODO take Uint8/16/32Array, but this needs to be converted manually because JSON does not know about it
    const map = {
      width: width,
      height: height,
      blockSize: 16,
      blocks: new Array(width * height),
    };

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        let nr = config.blockNames.Air;
        if (random(6) > 1) {
          nr = config.blockNames.Wood;
        }
        if (y == Math.floor(height / 2) && x == Math.floor(width / 2)) {
          nr = config.blockNames.Fire;
        }
        map.blocks[index] = nr;
      }
    }

    return map;
  }

  function worldReceiveMessage(connectionID, message) {
    if (message.type === 'chat') {
      // TODO add name from player to text
      serverSendMessageToAllClients({type: 'chat', text: message.text});
    } else if (message.type === 'map-enter') {
      // TODO server should do that automatically because only the server knows where the player is located after he connects
      serverSendMessageToOneClient(connectionID, {type: 'map-state', map: world.map});
    } else {
      console.log('server: unknown message from client', message);
    }
  }

  function random(upperExclusive) {
    return Math.floor(Math.random() * upperExclusive);
  }

  function mapMergeBlocks(map, updates) {
    for (let i = 0; i < updates.length; i += 1) {
      const [index, nr] = updates[i];
      map.blocks[index] = nr;
    }
  }

  function worldTick() {
    //serverSendMessageToAllClients({type: 'debug', message: 'tick'});

    const map = world.map;
    const blocks = map.blocks;

    //const t1 = performance.now();

    let blockUpdates = [];
    for (let y = 1; y < map.height - 1; y += 1) {
      for (let x = 1; x < map.width - 1; x += 1) {
        const index = y * map.width + x;
        const indexL = y * map.width + x - 1;
        const indexR = y * map.width + x + 1;
        const indexT = (y - 1) * map.width + x;
        const indexB = (y + 1) * map.width + x;
        if (blocks[index] === config.blockNames.Wood) {
          if (blocks[indexL] === config.blockNames.Fire || blocks[indexR] === config.blockNames.Fire || blocks[indexT] === config.blockNames.Fire || blocks[indexB] === config.blockNames.Fire) {
            blockUpdates.push([index, config.blockNames.Fire]);
          }
        }
      }
    }

    //const t2 = performance.now();

    if (blockUpdates.length > 0) {
      serverSendMessageToAllClients({type: 'map-update', updates: blockUpdates});
    }
    mapMergeBlocks(world.map, blockUpdates);

    const timeoutMs = 1000;
    setTimeout(worldTick, timeoutMs);
  }

  function worldStartup() {
    const factor = 0.5;
    world.map = mapCreate(Math.floor(140 * factor), Math.floor(70 * factor));
    worldTick();
  }

  return {
    mapMergeBlocks: mapMergeBlocks,
    mapCreate: mapCreate,
    worldStartup: worldStartup,
    serverMessageFromWorker: serverMessageFromWorker,
    serverSocketConnectionOpen: serverSocketConnectionOpen,
    serverSocketConnectionClose: serverSocketConnectionClose,
    serverMessageFromSocket: serverMessageFromSocket,
  };
})();

const serverGlobal = server;
if (typeof module === 'object') {
  module.exports = server;
}
