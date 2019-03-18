'use strict';

importScripts('require.js');
importScripts('config.js');
importScripts('functions.js');
importScripts('server.js');

const server = require('./server.js');

self.onmessage = server.serverMessageFromWorker;
server.worldStartup();
