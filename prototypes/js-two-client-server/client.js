'use strict';

(function() {
  const config = require('./config.js');
  const functions = require('./functions.js');
  const sector = require('./sector.js');

  const state = {
    serverRunsInClient: false,
    worker: undefined,
    socket: undefined,
    frameCount: 0,
    sector: undefined,
  };

  const serverConnect = async (url, handler) => {
    state.serverRunsInClient = url === '';
    if (state.serverRunsInClient) {
      state.worker = new Worker('server-worker.js');
      state.worker.onmessage = event => handler(JSON.parse(event.data));
    } else {
      state.socket = new SockJS('http://' + url + ':' + config.serverPort + config.serverWebsocketURL);
      const promise = new Promise((resolve, reject) => {
        state.socket.onopen = () => resolve();
        // TODO Handle Error
      });
      state.socket.onmessage = function(event) {
        handler(JSON.parse(event.data));
      };
      // TODO Timeout
      await promise;
    }
  };

  const serverSendMessage = message => {
    if (state.serverRunsInClient) {
      state.worker.postMessage(JSON.stringify(message));
    } else {
      state.socket.send(JSON.stringify(message));
    }
  };

  const blocksLoad = async () => {
    return await Promise.all(
      config.blockFileNames.map(fileName => {
        return functions.imageLoad(fileName);
      })
    );
  };

  const drawBlocks = (ctx, blocks, sector) => {
    for (let y = 0; y < sector.height; y += 1) {
      for (let x = 0; x < sector.width; x += 1) {
        const index = y * sector.width + x;
        ctx.drawImage(blocks[sector.blocks[index]], x * sector.blockSize, y * sector.blockSize);
      }
    }
  };

  const clear = ctx => {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#eee';
    ctx.fill();
  };

  const uiMessage = event => {
    const text = document.getElementById('control-message-text').value;
    const message = JSON.parse(text);
    serverSendMessage(message);
  };

  const input = event => {
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
  };

  const receive = messages => {
    const chatNode = document.getElementById('chat');
    messages.forEach(message => {
      if (message.type === 'debug') {
        console.log(message.message);
      } else if (message.type === 'chat') {
        while (chatNode.children.length >= 10) {
          chatNode.removeChild(chatNode.firstChild);
        }
        const p = document.createElement('p');
        p.textContent = message.text;
        chatNode.appendChild(p);
      } else if (message.type === 'sector-state') {
        state.sector = message.sector;
      } else if (message.type === 'sector-update') {
        sector.mergeBlocks(state.sector, message.updates);
      } else if (message.type === 'error') {
        console.log('error: ' + message.text);
      } else {
        console.log('client: unknown message from server', message);
      }
    });
  };

  const main = async () => {
    state.frameCount = 0;
    state.sector = sector.create(0, 0);
    const canvas = document.getElementById('canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    const ctx = canvas.getContext('2d');
    clear(ctx);
    const debugRenderNode = document.getElementById('debug-render');
    const blocks = await blocksLoad();
    await serverConnect(true ? '127.0.0.1' : '', receive);
    serverSendMessage([{type: 'register', name: 'Tom', password: '42'}]);
    serverSendMessage([{type: 'login', name: 'Tom', password: '42'}]);
    serverSendMessage([{type: 'chat', text: 'Hello World'}]);
    document.addEventListener('keydown', input);
    document.addEventListener('keyup', input);
    document.getElementById('control-message-send').addEventListener('click', uiMessage);

    const loop = () => {
      const timer = new functions.Timer();
      clear(ctx); // not necessary later if sector is already as big as the screen and/or there is/are background images
      drawBlocks(ctx, blocks, state.sector);
      const deltaTimeMilliseconds = timer.elapsedMilliseconds();

      state.frameCount += 1;
      debugRenderNode.innerHTML = 'Frames:' + state.frameCount + ' DT[ms]:' + Math.floor(deltaTimeMilliseconds);
      window.requestAnimationFrame(loop);
    };

    loop();
  };

  window.onload = main;
})();
