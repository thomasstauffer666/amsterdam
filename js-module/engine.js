'use strict';

/*

TODO Camera TopLeft or Centre?
TODO Sprite TopLeft or Centre?

- Blocks, ca. 4+ Layer
- Sprites, ca. 2+ Layer Foreground/Background Layer, Background Parallax Scrolling
- Lights?
- Physics?
- Collision?
- Camera X/Y
- onClick (x,y screen x,y virtuell, evtl. block x/y)
- Read Screenshot
- WebGL: texture2d array, sampler2darray, webgl2
- Audio/Music: Play/Stop/Loop ... https://stackoverflow.com/questions/38721501/how-to-play-audio-in-elm

Tags

a-engine camera-x camera-y

a-image nr src

a-layer-blocks blocksize width? height? nrs

a-layer-image nr x y width height

*/

class AEngine extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({
			mode: 'open'
		});
		const canvas = document.createElement('canvas');
		canvas.width = 640;
		canvas.height = 480;

		const ctx = canvas.getContext('2d');

		// TODO only use and add if debug attribute is set
		const p = document.createElement('p');

		this.shadowRoot.appendChild(canvas);
		this.shadowRoot.appendChild(p);

		this.debug = false;
		this.canvas = canvas;
		this.p = p;
		this.ctx = ctx;
		this.images = {};
		this.frameCount = 0;
		this.layers = [];

		this.clear();
	}

	clear() {
		const ctx = this.ctx;
		const canvas = this.canvas;

		ctx.beginPath();
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#fef';
		ctx.fill();
	}

	drawLayerBlocks(cameraX, cameraY, blockSize, width, height, nrs) {
		const ctx = this.ctx;
		for (let y = 0; y < height; y += 1) {
			for (let x = 0; x < width; x += 1) {
				const index = (y * width) + x;
				const nr = nrs[index];
				const image = this.images[nr];
				ctx.drawImage(image, (x * blockSize) - cameraX, (y * blockSize) - cameraY);
			}
		}
	}

	drawLayerImage(cameraX, cameraY, x, y, nr) {
		const ctx = this.ctx;
		const image = this.images[nr];
		ctx.drawImage(image, x - cameraX, y - cameraY);
	}

	// ca. 60ms for 1000 x 1000
	static convertNrs(string) {
		return string.split(' ').map(x => parseInt(x)).filter(x => !isNaN(x));
	}

	draw() {
		const cameraX = parseInt(this.getAttribute('camera-x'));
		const cameraY = parseInt(this.getAttribute('camera-y'));
		
		for (let i = 0; i < this.layers.length; i += 1) {
			const node = this.layers[i];
			if (node.tagName === 'A-LAYER-BLOCKS') {
				const blockSize = parseInt(node.getAttribute('blocksize'));
				const width = parseInt(node.getAttribute('width'));
				const height = parseInt(node.getAttribute('height'));
				const nrs = AEngine.convertNrs(node.getAttribute('nrs'));
				this.drawLayerBlocks(cameraX, cameraY, blockSize, width, height, nrs);
			} else if (node.tagName === 'A-LAYER-IMAGE') {
				const x = parseInt(node.getAttribute('x'));
				const y = parseInt(node.getAttribute('y'));
				const nr = parseInt(node.getAttribute('nr'));
				this.drawLayerImage(cameraX, cameraY, x, y, nr);
			}
		};
	}

	loop() {
		const t0 = performance.now();
		const t1 = performance.now();

		this.frameCount += 1;
		this.p.innerHTML = 'Frames:' + this.frameCount + ' DT[ms]:' + (t1 - t0);
		this.clear(); // TODO remove if everything is overdrawn
		this.draw();
		window.requestAnimationFrame(this.loop.bind(this));
	}

	async connectedCallback() {
		function imageLoad(fileName) {
			return new Promise((resolve, reject) => {
				const image = new Image();
				image.onload = () => resolve(image);
				image.onerror = () => reject(`Cannot Load '${fileName}'`);
				image.src = fileName;
			});
		}

		const ctx = this.ctx;

		//console.log(this.hasAttribute('debug'));
		// Array.prototype.slice.call(this.children).forEach
		
		// TODO loading bar?

		for (let i = 0; i < this.children.length; i += 1) {
			const node = this.children[i];
			if (node.tagName === 'A-IMAGE') {
				const nr = node.getAttribute('nr');
				const src = node.getAttribute('src');
				const image = await imageLoad(src);
				this.images[nr] = image;
			}
		};
		
		for (let i = 0; i < this.children.length; i += 1) {
			const node = this.children[i];
			if ((node.tagName === 'A-LAYER-BLOCKS') || (node.tagName === 'A-LAYER-IMAGE')) {
				this.layers.push(node);
			}
		};

		this.loop();
	}
}

window.customElements.define('a-engine', AEngine);
