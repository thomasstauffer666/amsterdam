import * as my from './module.js';

const main = () => {
	my.print('Hello From Browser');
	const worker = new Worker('webworker-bundle.js', {type: 'module'});
}

window.onload = main;
