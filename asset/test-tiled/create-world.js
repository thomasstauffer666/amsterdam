
const fs = require('fs');

const tiles = JSON.parse(fs.readFileSync('Test.json'));
const map = JSON.parse(fs.readFileSync('32x32.json'));

// TODO assert tilewidth === tileheight

const worldTileSet = {
  tileSet: tiles.tiles.map(tile => {
    return tile.image;
  }),
  tileSize: tiles.tilewidth,
};

const worldData = {
  tiles: map.layers[0].data,
  width: map.layers[0].width,
  height: map.layers[0].height,
};

const jsonWorldData = JSON.stringify(worldData);
const jsWorldData = `'use strict';

const WorldData = () => (${jsonWorldData});

if (typeof module === 'object') {
  module.exports = WorldData();
}
`

const jsonWorldTileSet = JSON.stringify(worldTileSet);
const jsWorldTileSet = `'use strict';

const WorldTileSet = () => (${jsonWorldTileSet});

if (typeof module === 'object') {
  module.exports = WorldTileSet();
}
`

//fs.writeFileSync('world-data.json', jsonWorldData);
fs.writeFileSync('world-data.js', jsWorldData);

//fs.writeFileSync('world-data.json', jsonWorldTileSet);
fs.writeFileSync('world-tileset.js', jsWorldTileSet);
