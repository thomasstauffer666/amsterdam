'use strict';

// TODO wrap into function

const clientState = {
  serverInClient: false,
  worker: undefined,
  socket: undefined,
};

async function serverConnect(url, handler) {
  const config = require('./config.js');

  clientState.serverInClient = url === '';
  if (clientState.serverInClient) {
    clientState.worker = new Worker('server-worker.js');
    clientState.worker.onmessage = event => handler(JSON.parse(event.data));
  } else {
    clientState.socket = new SockJS('http://' + url + ':' + config.serverPort + config.serverWebsocketURL);
    const promise = new Promise((resolve, reject) => {
      clientState.socket.onopen = () => resolve();
      // TODO Handle Error
    });
    clientState.socket.onmessage = function(event) {
      handler(JSON.parse(event.data));
    };
    // TODO Timeout
    await promise;
  }
}

function serverSendMessage(message) {
  if (clientState.serverInClient) {
    clientState.worker.postMessage(JSON.stringify(message));
  } else {
    clientState.socket.send(JSON.stringify(message));
  }
}

function imageLoad(fileName) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(`Cannot Load '${fileName}'`);
    image.src = fileName;
  });
}

async function blocksLoad() {
  const config = require('./config.js');

  // TODO possible BLOCKS.map await/async Promise All?
  let blocks = new Array(config.blockFileNames.length);
  for (let i = 0; i < config.blockFileNames.length; i += 1) {
    blocks[i] = await imageLoad(config.blockFileNames[i]);
  }
  return blocks;
}

async function main() {
  let frameCount = 0;
  const canvas = document.getElementById('canvas');
  
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  const ctx = canvas.getContext('2d');
  clear();
  const debugRender = document.getElementById('debug-render');
  const blocks = await blocksLoad();
  const server = require('./server.js');
  let map = server.mapCreate(0, 0);
  await serverConnect('', receive);
  serverSendMessage({type: 'register', name: 'Tom', password: '42'});
  serverSendMessage({type: 'login', name: 'Tom', password: '42'});
  serverSendMessage({type: 'chat', text: 'Hello World'});
  document.addEventListener('keydown', input);
  document.addEventListener('keyup', input);
  document.getElementById('control-message-send').addEventListener('click', uiMessage); 

  function clear() {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#eee';
    ctx.fill();
  }
  
  function uiMessage(event) {
    const text = document.getElementById('control-message-text').value;
    const message = JSON.parse(text);
    serverSendMessage(message);
  }

  function drawBlocks() {
    for (let y = 0; y < map.height; y += 1) {
      for (let x = 0; x < map.width; x += 1) {
        const index = y * map.width + x;
        ctx.drawImage(blocks[map.blocks[index]], x * map.blockSize, y * map.blockSize);
      }
    }
  }

  function draw() {
    clear(); // TODO not necessary later if map is already as big as the screen and/or there is/are background images
    drawBlocks();
  }

  function loop() {
    const t1 = performance.now();
    draw();
    const t2 = performance.now();

    frameCount += 1;
    debugRender.innerHTML = 'Frames:' + frameCount + ' DT[ms]:' + Math.floor(t2 - t1);
    window.requestAnimationFrame(loop);
  }

  function input(event) {
    // TODO Handle Repeat

    const keyToAction = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      a: 'left',
      d: 'right',
      e: 'use',
      ' ': 'jump',
    };

    if (event.key in keyToAction) {
      const message = {
        type: 'action-' + (event.type === 'keydown' ? 'start' : 'stop'),
        action: keyToAction[event.key],
      };
      serverSendMessage(message);
    }
  }

  function receive(message) {
    if (message.type === 'debug') {
      console.log(message.message);
    } else if (message.type === 'chat') {
      console.log('chat: ' + message.text);
    } else if (message.type === 'map-state') {
      map = message.map;
    } else if (message.type === 'map-update') {
      server.mapMergeBlocks(map, message.updates);
    } else if (message.type === 'error') {
      console.log('error: ' + message.text);
    } else {
      console.log('client: unknown message from server', message);
    }
  }

  loop();
}

window.onload = main;
