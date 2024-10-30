import {pull} from "./index";

class Node {
	private readonly open?: string
	private readonly close?: string
	private readonly text?: string
	private children: Node[]
	private _parent?: Node

	constructor(data: string | [string, string] = '') {

		this.children = []

		if (Array.isArray(data)) {
			this.open = data[0]
			this.close = data[1]
		} else {
			this.text = data
		}
	}

	append(e: Node | string | [string, string]): void {
		if (!(e instanceof Node)) {
			e = new Node(e)
		}

		if (e._parent) {
			pull(e._parent.children, e)
		}

		e._parent = this
		this.children = this.children.concat(e)
	}

	render(): string {
		let text = ''

		if (this.open) {
			text += this.open
		}

		if (this.text) {
			text += this.text
		}

		for (let i = 0; i < this.children.length; i++) {
			text += this.children[i]?.render()
		}

		if (this.close) {
			text += this.close
		}

		return text
	}

	parent(): Node | undefined {
		return this._parent
	}
}

export default Node