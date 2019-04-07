'use strict';

const Functions = () => {
  const IS_NODE_RUNNING = typeof module === 'object';
  
  const perf = IS_NODE_RUNNING ? require('perf_hooks').performance : performance

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
    
    // TODO is there a documented way in JS how to define private methods?

    static _time() {
      return perf.now();
    }

    start() {
      this.timeStarted = Timer._time();
    }

    elapsedMilliseconds() {
      return Math.floor(Timer._time() - this.timeStarted);
    }
  }

  class Input {
    constructor() {
      const self = this;

      this.pressed = {};
      this.listener = {};

      document.addEventListener('keydown', event => self._listener(event));
      document.addEventListener('keyup', event => self._listener(event));
      document.addEventListener('blur', event => self._listener(event));
    }

    _fire(event) {
      if (this.listener !== null) {
        this.listener(event);
      }
    }

    _listener(event) {
      if (event.type === 'blur') {
        // release all keys, called when browser/tab goes into the background
        Object.keys(this.pressed).forEach(key => {
          this._fire({type: 'keyup', key});
        });
        this.pressed = {};
      } else if (event.type === 'keydown') {
        if (!this.isPressed(event.key)) {
          this._fire({type: 'keydown', key: event.key});
        }
        this.pressed[event.key] = true;
      } else if (event.type === 'keyup') {
        if (this.isPressed(event.key)) {
          this._fire({type: 'keyup', key: event.key});
        }
        this.pressed[event.key] = false;
      } else {
        throw `Unhandled Event '${event.type}'`;
      }
    }

    isPressed(key) {
      return this.pressed[key] || false;
    }

    // TODO maybe change to addEventListener if there is a need for it?
    setEventListener(listener) {
      this.listener = listener;
    }
  }

  return {
    imageLoad: imageLoad,
    fileLoad: fileLoad,
    clamp: clamp,
    random: random,
    Timer: Timer,
    Input: Input,
  };
};

if (typeof module === 'object') {
  module.exports = Functions();
}
