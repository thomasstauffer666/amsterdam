'use strict';

function Template() {
  const my = () => null;

  return {
    my: my,
  };
}

if (typeof module === 'object') {
  module.exports = Template();
}
