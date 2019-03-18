'use strict';

const require = (function() {
  const pathToObject = {
    './config.js': () => Config(),
    './server.js': () => Server(),
  };
  const cache = {};

  return path => {
    if (path in pathToObject) {
      if (!(path in cache)) {
        cache[path] = pathToObject[path]();
      }
      return cache[path];
    }

    throw `Module '${path}' Not Found`;
  };
})();
