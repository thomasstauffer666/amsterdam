'use strict';

// Firefox/Chrome both cache this script and do not even make a request to the server anymore, if this file is also added as a <script> it seems to work. Chrome also has an option in the developer menu to force reloading the worker script.

if (typeof window === 'undefined') {
  self.importScripts('require.js');
  self.importScripts('config.js');
  self.importScripts('functions.js');
  self.importScripts('server.js');
  self.importScripts('sector.js');

  const server = require('./server.js');

  self.onmessage = event => server.serverMessageFromClient(0, undefined, event.data);
  server.serverOpen(0, undefined);
  server.worldStartup();
}
