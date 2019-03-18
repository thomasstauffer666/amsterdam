'use strict';

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
    serverSendMessageToServer(message);
  }
}

function receive(message) {
  console.log('from server', message);
}

async function main() {
  await serverConnect('', receive);
  serverSendMessageToServer({type: 'chat', message: 'Hello World'});
  serverSendMessageToServer({type: 'sector-enter', sector: 0});

  document.addEventListener('keydown', input);
  document.addEventListener('keyup', input);
}

window.onload = main;
