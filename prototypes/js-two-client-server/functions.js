'use strict';

const Functions = () => {
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

  const imageLoad = url => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(`Cannot Load '${url}'`);
      image.src = url;
    });
  };

  // TODO replace with fetch or remove
  const fileLoad = url => {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState == XMLHttpRequest.DONE && request.status === 200) {
          resolve(request.response);
        }
      };
      const asynch = true;
      request.open('GET', url, true);
      request.send();
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
    fileLoad: fileLoad,
    clamp: clamp,
    random: random,
    Timer: Timer,
  };
};

if (typeof module === 'object') {
  module.exports = Functions();
}
