const fs = require("fs");

const tiles = JSON.parse(fs.readFileSync("Test.json"));
const map = JSON.parse(fs.readFileSync("32x32.json"));

console.assert(tiles.tilewidth === tiles.tileheight);

const tilesetUrls = () => {
  // tiled seems to create two different kind of files, depending on its version?
  if (Array.isArray(tiles.tiles)) {
    return tiles.tiles.map(tile => tile.image);
  } else {
    return Object.keys(tiles.tiles).map(id => tiles.tiles[id].image);
  }
};

const worldTileset = {
  urls: tilesetUrls(),
  size: tiles.tilewidth
};

const worldTiles = {
  ids: map.layers[0].data.map(id => id - 1),
  width: map.layers[0].width,
  height: map.layers[0].height
};

const jsonWorldData = JSON.stringify(worldTiles);
const jsWorldData = `'use strict';

const WorldData = () => (${jsonWorldData});

if (typeof module === 'object') {
  module.exports = WorldData();
}
`;

const jsonWorldTileset = JSON.stringify(worldTileset);
const jsWorldTileset = `'use strict';

const WorldTileset = () => (${jsonWorldTileset});

if (typeof module === 'object') {
  module.exports = WorldTileset();
}
`;

//fs.writeFileSync('world-data.json', jsonWorldData);
fs.writeFileSync("world-data.js", jsWorldData);

//fs.writeFileSync('world-data.json', jsonWorldTileset);
fs.writeFileSync("world-tileset.js", jsWorldTileset);
