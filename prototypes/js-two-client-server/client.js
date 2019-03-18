'use strict';

async function serverConnect(url, handler) {
  state.serverInClient = url === '';
  if (state.serverInClient) {
    state.worker = new Worker('client-worker.js');
    state.worker.onmessage = function(event) {
      handler(JSON.parse(event.data));
    };
  } else {
    state.socket = new SockJS('http://' + url + ':' + SERVER_PORT + SERVER_WEBSOCKET_URL);
    const promise = new Promise(resolve => {
      state.socket.onopen = () => resolve();
    });
    state.socket.onmessage = function(event) {
      handler(JSON.parse(event.data));
    };
    await promise;
  }
}

function serverSendMessage(message) {
  if (state.serverInClient) {
    state.worker.postMessage(JSON.stringify(message));
  } else {
    state.socket.send(JSON.stringify(message));
  }
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
      type: 'action',
      action: keyToAction[event.key],
      startstop: event.type === 'keydown' ? 'start' : 'stop',
    };
    serverSendMessage(message);
  }
}

function receive(message) {
  console.log('from server', message);
}

async function main() {
  await serverConnect('', receive);
  serverSendMessage({type: 'chat', message: 'Hello World'});
  serverSendMessage({type: 'sector-enter', sector: 0});

  document.addEventListener('keydown', input);
  document.addEventListener('keyup', input);
}

window.onload = main;
