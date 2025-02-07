'use strict';

(() => {
  const config = require('./config.js');
  const functions = require('./functions.js');
  const sector = require('./sector.js');
  const worldTileset = require('../../asset/test-tiled/world-tileset.js');

  // Model

  const state = {
    serverRunsInClient: false,
    worker: null,
    socket: null,
    frameCount: 0,
    sector: null,
    avatar: null, // TODO instead of just position the full player state from server?
    camera: {
      // normally is where the avatar is, but maybe can be moved around otherwise?
      x: 0,
      y: 0,
    },
  };

  // TODO nameing: control: receive/send messages & update state, view: show state

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

  const drawSector = (canvas, ctx, camera, tileset, sector) => {
    /*
    screen 1920 x 1080
    tile size 16
    -> maximum tiles to draw = 121 * 68 = 92928
    */

    const yMin = Math.max(Math.floor(camera.y / tileset.size), 0);
    const yMax = Math.min(Math.floor((camera.y + canvas.height) / tileset.size) + 1, sector.height);
    const xMin = Math.max(Math.floor(camera.x / tileset.size), 0);
    const xMax = Math.min(Math.floor((camera.x + canvas.width) / tileset.size) + 1, sector.width);

    let count = 0; // only statistics
    for (let y = yMin; y < yMax; y += 1) {
      for (let x = xMin; x < xMax; x += 1) {
        const index = y * sector.width + x;
        ctx.drawImage(tileset.images[sector.tiles[index]], x * tileset.size - camera.x, y * tileset.size - camera.y);
        count += 1;
      }
    }
    // console.info(count);
  };

  const drawSprites = (canvas, ctx, camera, sprites, position) => {
    sprites.forEach(sprite => {
      const isVisible = true; // TODO only visible ones
      if(isVisible) {
        ctx.drawImage(sprite.image, position.x - camera.x, position.y - camera.y);
      }
    });
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

  const inputListener = event => {
    const keyToAction = {
      //ArrowLeft: 'left',
      //ArrowRight: 'right',
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
        p.textContent = message.millisecondsSinceStart + 'ms ' + message.name + ': ' + message.text;
        chatNode.appendChild(p);
      } else if (message.type === 'sector-state') {
        state.sector = message.sector;
      } else if (message.type === 'sector-update') {
        sector.mergeBlocks(state.sector, message.updates);
      } else if (message.type === 'avatar') {
        state.avatar = message.avatar;
      } else if (message.type === 'error') {
        console.log('error: ' + message.text);
      } else {
        console.log('client: unknown message from server', message);
      }
    });
  };

  const main = async () => {
    state.frameCount = 0;
    const canvas = document.getElementById('canvas');
    const resize = () => {
      canvas.width = document.body.clientWidth;
      canvas.height = document.body.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d');
    clear(ctx);
    const tileset = await sector.tilesetLoad();
    const spriteAvatar = {
      image: await functions.imageLoad('../../asset/test-tiled/avatar.png'),
      width: 48,
      height: 48,
    };
    await serverConnect(false ? '127.0.0.1' : '', receive);
    serverSendMessage([{type: 'register', name: 'Tom', password: '42'}]);
    serverSendMessage([{type: 'login', name: 'Tom', password: '42'}]);
    serverSendMessage([{type: 'chat', text: 'Hello World'}]);
    const input = new functions.Input();
    //document.addEventListener('keydown', input);
    //document.addEventListener('keyup', input);
    input.setEventListener(inputListener);
    document.getElementById('control-message-send').addEventListener('click', uiMessage);

    const loop = () => {
      // TODO create a FPS, delta time class

      const debugRenderNode = document.getElementById('debug-render');
      const timer = new functions.Timer();

      // TODO should depend on delta time
      const cameraSpeed = 11;
      if (input.isPressed('ArrowLeft')) {
        state.camera.x -= cameraSpeed;
      }
      if (input.isPressed('ArrowRight')) {
        state.camera.x += cameraSpeed;
      }
      if (input.isPressed('ArrowUp')) {
        state.camera.y -= cameraSpeed;
      }
      if (input.isPressed('ArrowDown')) {
        state.camera.y += cameraSpeed;
      }

      if (state.frameCount % 1 == 0) {
        if (state.sector !== null && state.avatar !== null) {
          clear(ctx); // not necessary anymore sector/sprites are big enough to overdraw anything
          drawSector(canvas, ctx, state.camera, tileset, state.sector);
          drawSprites(canvas, ctx, state.camera, [spriteAvatar], state.avatar);
        }
      }

      const deltaTimeMilliseconds = timer.elapsedMilliseconds();
      state.frameCount += 1;
      debugRenderNode.textContent = 'Frames:' + state.frameCount + ' DT[ms]:' + Math.floor(deltaTimeMilliseconds);
      window.requestAnimationFrame(loop);
    };

    loop();
  };

  window.onload = main;
})();
