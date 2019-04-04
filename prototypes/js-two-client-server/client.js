'use strict';

(function() {
  const config = require('./config.js');
  const functions = require('./functions.js');
  const sectorfunctions = require('./sector.js'); // TODO rename

  const clientState = {
    serverInClient: false,
    worker: undefined,
    socket: undefined,
  };

  async function serverConnect(url, handler) {
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

  async function blocksLoad() {
    return await Promise.all(
      config.blockFileNames.map(fileName => {
        return functions.imageLoad(fileName);
      })
    );
  }

  function drawBlocks(ctx, blocks, sector) {
    for (let y = 0; y < sector.height; y += 1) {
      for (let x = 0; x < sector.width; x += 1) {
        const index = y * sector.width + x;
        ctx.drawImage(blocks[sector.blocks[index]], x * sector.blockSize, y * sector.blockSize);
      }
    }
  }

  function clear(ctx) {
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
      serverSendMessage([message]);
    }
  }

  async function main() {
    // TODO move most functions out of main and put state into state object

    let frameCount = 0;
    const canvas = document.getElementById('canvas');

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    const ctx = canvas.getContext('2d');
    clear(ctx);
    const debugRenderNode = document.getElementById('debug-render');
    const chatNode = document.getElementById('chat');
    const blocks = await blocksLoad();
    let sector = sectorfunctions.create(0, 0);

    await serverConnect(false ? '127.0.0.1' : '', receive);
    serverSendMessage([{type: 'register', name: 'Tom', password: '42'}]);
    serverSendMessage([{type: 'login', name: 'Tom', password: '42'}]);
    serverSendMessage([{type: 'chat', text: 'Hello World'}]);
    document.addEventListener('keydown', input);
    document.addEventListener('keyup', input);
    document.getElementById('control-message-send').addEventListener('click', uiMessage);

    function loop() {
      const timer = new functions.Timer();
      clear(ctx); // not necessary later if sector is already as big as the screen and/or there is/are background images
      drawBlocks(ctx, blocks, sector);
      const deltaTimeMilliseconds = timer.elapsedMilliseconds();

      frameCount += 1;
      debugRenderNode.innerHTML = 'Frames:' + frameCount + ' DT[ms]:' + Math.floor(deltaTimeMilliseconds);
      window.requestAnimationFrame(loop);
    }

    function receive(messages) {
      for (let i = 0; i < messages.length; i += 1) {
        const message = messages[i]; // TODO each
        if (message.type === 'debug') {
          console.log(message.message);
        } else if (message.type === 'chat') {
          // TODO use append child, and remove old children if more than X messages
          chat.innerHTML += '<p>' + message.text + '</p>';
        } else if (message.type === 'sector-state') {
          sector = message.sector;
        } else if (message.type === 'sector-update') {
          sectorfunctions.mergeBlocks(sector, message.updates);
        } else if (message.type === 'error') {
          console.log('error: ' + message.text);
        } else {
          console.log('client: unknown message from server', message);
        }
      }
    }

    loop();
  }

  window.onload = main;
})();
