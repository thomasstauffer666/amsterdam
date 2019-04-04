'use strict';

function Connection() {
  const my = () => null;

  return {
    my: my,
  };
}

if (typeof module === 'object') {
  module.exports = Connection();
}
