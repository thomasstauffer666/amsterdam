'use strict';

importScripts('config.js');
importScripts('functions.js');
importScripts('server.js');

self.onmessage = server.serverMessageFromWorker;
server.worldStartup();
