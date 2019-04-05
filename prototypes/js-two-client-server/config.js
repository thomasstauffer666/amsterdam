'use strict';

const Config = () => {
  return {
    serverPort: 55555,
    serverWebsocketURL: '/amsterdam',
  };
};

if (typeof module === 'object') {
  module.exports = Config();
}
