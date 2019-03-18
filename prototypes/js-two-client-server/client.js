'use strict';

const clientState = {
  serverInClient: false,
  worker: undefined,
};

async function serverConnect(url, handler) {
  clientState.serverInClient = url === '';
  if (clientState.serverInClient) {
    clientState.worker = new Worker('server-worker.js');
    clientState.worker.onmessage = function(event) {
      handler(JSON.parse(event.data));
    };
  } else {
    clientState.socket = new SockJS('http://' + url + ':' + CONFIG.serverPort + CONFIG.serverWebsocketURL);
    const promise = new Promise(resolve => {
      clientState.socket.onopen = () => resolve();
    });
    clientState.socket.onmessage = function(event) {
      handler(JSON.parse(event.data));
    };
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
  await serverConnect('localhost', receive);
  serverSendMessage({type: 'chat', message: 'Hello World'});
  serverSendMessage({type: 'sector-enter', sector: 0});

  document.addEventListener('keydown', input);
  document.addEventListener('keyup', input);
}

window.onload = main;
