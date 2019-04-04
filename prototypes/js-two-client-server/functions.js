'use strict';

function Functions() {
  const IS_NODE_RUNNING = typeof module === 'object';

  const clamp = (value, min, max) => {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    } else {
      return value;
    }
  };

  const random = upperExclusive => {
    return Math.floor(Math.random() * upperExclusive);
  };

  const imageLoad = fileName => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(`Cannot Load '${fileName}'`);
      image.src = fileName;
    });
  };

  class Timer {
    constructor() {
      this.timeStarted = undefined;
      this.start();
    }

    static _time() {
      return IS_NODE_RUNNING ? Date.now() : performance.now();
    }

    start() {
      this.timeStarted = Timer._time();
    }

    elapsedMilliseconds() {
      return Math.floor(Timer._time() - this.timeStarted);
    }
  }

  return {
    imageLoad: imageLoad,
    clamp: clamp,
    random: random,
    Timer: Timer,
  };
}

if (typeof module === 'object') {
  module.exports = Functions();
}
