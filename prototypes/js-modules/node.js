
/*
$ node --version
v11.13.0

$ node --experimental-modules module.js 
(node:10938) ExperimentalWarning: The ESM module loader is experimental.
/home/tom/Sandbox/amsterdam/prototypes/js-modules/module.js:2
export function print(message) {
^^^^^^

*/

import * as my from './module.js';

my.print('Hello From Webworker');
