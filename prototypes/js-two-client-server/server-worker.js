'use strict';

// Firefox/Chrome cache it only this script and do not even make a request to the server anymore, if the script is also added as a <script> it seems to work

if (typeof window === 'undefined') {
  importScripts('require.js');
  importScripts('config.js');
  importScripts('functions.js');
  importScripts('server.js');

  const server = require('./server.js');

  self.onmessage = server.serverMessageFromWorker;
  server.serverWorkerOpen();
  server.worldStartup();
}
