'use strict';

// Firefox/Chrome both cache this script and do not even make a request to the server anymore, if this file is also added as a <script> it seems to work. Chrome also has an option in the developer menu to force reloading the worker script.

if (typeof window === 'undefined') {
  self.importScripts('require.js');
  self.importScripts('config.js');
  self.importScripts('functions.js');
  self.importScripts('server.js');

  const server = require('./server.js');

  self.onmessage = server.serverMessageFromWorker;
  server.serverWorkerOpen();
  server.worldStartup();
}
