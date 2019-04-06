'use strict';

const Sector = () => {
  const config = require('./config.js');
  const functions = require('./functions.js');
  const worldTileset = require('../../asset/test-tiled/world-tileset.js');

  // TODO read this names from json file
  const TILE_NAMES = {
    Air: 0,
    Wood: 11,
    Fire: 3,
  };

  const load = worldTiles => {
    const sector = create(worldTiles.width, worldTiles.height);
    sector.tiles = worldTiles.ids;
    return sector;

    //const sizeFactor = 0.5;
    //state.sector = sector.create(Math.floor(140 * sizeFactor), Math.floor(70 * sizeFactor));

    //const sector = create(32, 32);
    //createRandom(sector);
    //return sector;
  };

  // 1024 x 1024 JSON.stringify -> ca. 11 MB
  const create = (width, height) => {
    const sector = {
      width: width,
      height: height,
      // Uint8/16/32Array maybe is faster for tiles, but needs to be converted manually when transfered with JSON
      tiles: new Array(width * height),
    };
    //sector.tiles.fill(0);
    return sector;
  };

  const createRandom = (seed, width, height) => {
    // TODO js PRNG does not have a seed?

    const sector = create(width, height);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        let nr = TILE_NAMES.Air;
        if (functions.random(6) > 1) {
          nr = TILE_NAMES.Wood;
        }
        if (y == 2 && x == 2) {
          nr = TILE_NAMES.Fire;
        }
        sector.tiles[index] = nr;
      }
    }
  };

  const mergeBlocks = (sector, updates) => {
    for (let i = 0; i < updates.length; i += 1) {
      const [index, nr] = updates[i];
      sector.tiles[index] = nr;
    }
  };

  const simulationStep = sector => {
    const tileWorldUpdates = [];
    const tiles = sector.tiles;

    for (let y = 1; y < sector.height - 1; y += 1) {
      for (let x = 1; x < sector.width - 1; x += 1) {
        const index = y * sector.width + x;
        // Left/Right/Top/Bottom
        const indexL = y * sector.width + x - 1;
        const indexR = y * sector.width + x + 1;
        const indexT = (y - 1) * sector.width + x;
        const indexB = (y + 1) * sector.width + x;
        if (tiles[index] === TILE_NAMES.Wood) {
          if (tiles[indexL] === TILE_NAMES.Fire || tiles[indexR] === TILE_NAMES.Fire || tiles[indexT] === TILE_NAMES.Fire || tiles[indexB] === TILE_NAMES.Fire) {
            tileWorldUpdates.push([index, TILE_NAMES.Fire]);
          }
        }
      }
    }

    return tileWorldUpdates;
  };

  return {
    load: load,
    create: create,
    mergeBlocks: mergeBlocks,
    simulationStep: simulationStep,
  };
};

if (typeof module === 'object') {
  module.exports = Sector();
}
