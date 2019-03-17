'use strict';

class MyP extends HTMLElement {
	constructor() {
		super();
		this.rootNode = this.attachShadow({
			mode: 'open'
		});
	}

	view() {
		this.rootNode.innerHTML = '<p>' + this.getAttribute('text') + '</p>';
	}

	connectedCallback() {
		this.view();
	}

	static get observedAttributes() {
		return ['text'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		//console.log('attributeChangedCallback');
		this.view();
	}
}

window.customElements.define('my-p', MyP);
