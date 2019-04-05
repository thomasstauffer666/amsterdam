'use strict';

const Sector = () => {
  const config = require('./config.js');
  const functions = require('./functions.js');

  // 1024 x 1024 JSON.stringify -> ca. 11 MB
  const create = (width, height) => {
    const sector = {
      width: width,
      height: height,
      blockSize: 16,
      // Uint8/16/32Array maybe is faster for blocks, but needs to be converted manually when transfered with JSON
      blocks: new Array(width * height),
    };

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        let nr = config.blockNames.Air;
        if (functions.random(6) > 1) {
          nr = config.blockNames.Wood;
        }
        if (y == 2 && x == 2) {
          nr = config.blockNames.Fire;
        }
        sector.blocks[index] = nr;
      }
    }

    return sector;
  };

  const mergeBlocks = (sector, updates) => {
    for (let i = 0; i < updates.length; i += 1) {
      const [index, nr] = updates[i];
      sector.blocks[index] = nr;
    }
  };

  return {
    create: create,
    mergeBlocks: mergeBlocks,
  };
};

if (typeof module === 'object') {
  module.exports = Sector();
}
