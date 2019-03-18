'use strict';

function Config() {
  const BLOCKS_PATH = '../../asset/block-16x16/';
  const BLOCKS = [BLOCKS_PATH + 'air.png', BLOCKS_PATH + 'cave.png', BLOCKS_PATH + 'dirt.png', BLOCKS_PATH + 'grass.png', BLOCKS_PATH + 'light.png', BLOCKS_PATH + 'night.png', BLOCKS_PATH + 'steel.png', BLOCKS_PATH + 'wall.png', BLOCKS_PATH + 'wood.png', BLOCKS_PATH + 'gas.png', BLOCKS_PATH + 'fire.png', BLOCKS_PATH + 'water.png'];

  const BLOCK_NAMES = {
    Air: 0,
    Wood: 8,
    Fire: 10,
  };

  return {
    serverPort: 55555,
    serverWebsocketURL: '/amsterdam',
    blockFileNames: BLOCKS,
    blockNames: BLOCK_NAMES,
  };
}

if (typeof module === 'object') {
  module.exports = Config();
}
