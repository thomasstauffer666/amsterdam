
/*
$ node --version
v11.13.0

$ node --experimental-modules module.js 
(node:10938) ExperimentalWarning: The ESM module loader is experimental.
/home/tom/Sandbox/amsterdam/prototypes/js-modules/module.js:2
export function print(message) {
^^^^^^


if node.js is renamed to node.mjs and module.js to module.mjs then it seems to work at least in node

*/

import * as my from './module.js';

my.print('Hello From Webworker');
