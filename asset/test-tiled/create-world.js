
const fs = require('fs');

const tiles = JSON.parse(fs.readFileSync('Test.json'));
const map = JSON.parse(fs.readFileSync('32x32.json'));

// TODO assert tilewidth === tileheight

// TODO rename to urls and size
const worldTileset = {
  urls: tiles.tiles.map(tile => tile.image),
  size: tiles.tilewidth,
};

// TODO rename to worldTiles, tiles to ids?
const worldTiles = {
  ids: map.layers[0].data.map(id => id - 1),
  width: map.layers[0].width,
  height: map.layers[0].height,
};

const jsonWorldData = JSON.stringify(worldTiles);
const jsWorldData = `'use strict';

const WorldData = () => (${jsonWorldData});

if (typeof module === 'object') {
  module.exports = WorldData();
}
`

const jsonWorldTileset = JSON.stringify(worldTileset);
const jsWorldTileset = `'use strict';

const WorldTileset = () => (${jsonWorldTileset});

if (typeof module === 'object') {
  module.exports = WorldTileset();
}
`

//fs.writeFileSync('world-data.json', jsonWorldData);
fs.writeFileSync('world-data.js', jsWorldData);

//fs.writeFileSync('world-data.json', jsonWorldTileset);
fs.writeFileSync('world-tileset.js', jsWorldTileset);
