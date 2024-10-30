//@ts-nocheck
import {BlockFunctions, EmbedFunctions, InlineFunctions} from "./converters";
import defaultConverters from './converters'
import Node from './common/node'

interface Attributes {
	[key: string]: unknown;
}

type Operation = {
	insert?: string | Record<string, unknown>;
	delete?: number;
	retain?: number | Record<string, unknown>;
	attributes?: Attributes;
};

type ConverterFunctions = {
	embed: EmbedFunctions;
	inline: InlineFunctions;
	block: BlockFunctions;
};

export default function convertOpsToMarkdown(
	ops: Operation[],
	converters: ConverterFunctions = defaultConverters
): string {
	return convert(ops, converters).render().trimEnd() + '\n';
}

function convert(ops: Operation[], converters: ConverterFunctions): Node {
	let group: { el: Node; type: string; value: any; distance: number } | null = null;
	let line: Node;
	let el: Node;
	let activeInline: { [key: string]: any } = {};
	let beginningOfLine = false;
	const root = new Node();

	function newLine() {
		el = line = new Node(['', '\n']);
		root.append(line);
		activeInline = {};
	}
	newLine();

	for (let i = 0; i < ops.length; i++) {
		const op = ops[i];

		if (typeof op.insert === 'object') {
			for (const k in op.insert) {
				if (converters.embed[k]) {
					applyInlineAttributes(op.attributes);
					converters.embed[k].call(el, op.insert[k], op.attributes);
				}
			}
		} else {
			const lines = op.insert.split('\n');

			if (hasBlockLevelAttribute(op.attributes, converters)) {
				for (let j = 1; j < lines.length; j++) {
					for (const attr in op.attributes) {
						if (converters.block[attr]) {
							let fn = converters.block[attr];
							if (typeof fn === 'object') {
								if (group && group.type !== attr) {
									group = null;
								}
								if (!group && fn.group) {
									group = {
										el: fn.group(),
										type: attr,
										value: op.attributes![attr],
										distance: 0,
									};
									root.append(group.el);
								}

								if (group) {
									group.el.append(line);
									group.distance = 0;
								}
								fn = fn.line;
							}

							fn.call(line, op.attributes, group);
							newLine();
							break;
						}
					}
				}
				beginningOfLine = true;
			} else {
				for (let l = 0; l < lines.length; l++) {
					if ((l > 0 || beginningOfLine) && group && ++group.distance >= 2) {
						group = null;
					}
					applyInlineAttributes(op.attributes, ops[i + 1]?.attributes);
					el.append(lines[l]);
					if (l < lines.length - 1) {
						newLine();
					}
				}
				beginningOfLine = false;
			}
		}
	}

	return root;

	function applyInlineAttributes(attrs: { [key: string]: any } = {}, next?: { [key: string]: any }) {
		const first: string[] = [];
		const then: string[] = [];

		let tag = el;
		const seen: { [key: string]: boolean } = {};

		while (tag._format) {
			seen[tag._format] = true;
			if (!attrs[tag._format]) {
				for (const k in seen) {
					delete activeInline[k];
				}
				el = tag.parent();
			}

			tag = tag.parent();
		}

		for (const attr in attrs) {
			if (converters.inline[attr]) {
				if (activeInline[attr]) {
					if (activeInline[attr] === attrs[attr]) {
						continue;
					}
				}

				if (next && attrs[attr] === next[attr]) {
					first.push(attr);
				} else {
					then.push(attr);
				}
				activeInline[attr] = attrs[attr];
			}
		}

		first.forEach(apply);
		then.forEach(apply);

		function apply(fmt: string) {
			let newEl = converters.inline[fmt].call(null, attrs[fmt]);
			if (Array.isArray(newEl)) {
				newEl = new Node(newEl);
			}
			newEl._format = fmt;
			el.append(newEl);
			el = newEl;
		}
	}
}

function hasBlockLevelAttribute(attrs: { [key: string]: any } = {}, converters: ConverterFunctions): boolean {
	for (const k in attrs) {
		if (Object.keys(converters.block).includes(k)) {
			return true;
		}
	}
	return false;
}
