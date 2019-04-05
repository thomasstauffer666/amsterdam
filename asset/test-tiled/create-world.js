
const fs = require('fs');

const tiles = JSON.parse(fs.readFileSync('Test.json'));
const map = JSON.parse(fs.readFileSync('32x32.json'));

// TODO assert tilewidth === tileheight

const world = {
  tileSet: tiles.tiles.map(tile => {
    return tile.image;
  }),
  tileSize: tiles.tilewidth,
  tiles: map.layers[0].data,
  width: map.layers[0].width,
  height: map.layers[0].height,
};

const json = JSON.stringify(world);
const js = `'use strict';

const WorldData = () => (${json});

if (typeof module === 'object') {
  module.exports = WorldData();
}
`

//fs.writeFileSync('world-data.json', json);
fs.writeFileSync('world-data.js', js);
