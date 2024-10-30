import Node from './common/node'
import {encodeLink} from "./common/url";

export declare type EmbedFunctions = {
	image: (src: string) => void;
	thematic_break: () => void;
};

export declare type InlineFunctions = {
	italic: () => [string, string];
	bold: () => [string, string];
	link: (url: string) => [string, string];
};

export declare type BlockFunctions = {
	header: (args: { header: number }) => void;
	blockquote: () => void;
	list: {
		group: () => Node;
		line: (attrs: { list: string }, group: { count?: number }) => void;
	};
};

const config = {
	embed: {
		image(src: string) {
			this.append('![](' + encodeLink(src) + ')');
		},
		thematic_break() {
			this.open = '\n---\n' + this.open;
		},
	} as EmbedFunctions,

	inline: {
		italic() {
			return ['_', '_'];
		},
		bold() {
			return ['**', '**'];
		},
		link(url: string) {
			return ['[', '](' + url + ')'];
		},
	} as InlineFunctions,

	block: {
		header({header}: { header: number; }) {
			this.open = '#'.repeat(header) + ' ' + this.open;
		},
		blockquote() {
			this.open = '> ' + this.open;
		},
		list: {
			group() {
				return new Node(['', '\n']);
			},
			line(attrs: { list: string; }, group: { count?: number; }) {
				if (attrs.list === 'bullet') {
					this.open = '- ' + this.open;
				} else if (attrs.list === "checked") {
					this.open = '- [x] ' + this.open;
				} else if (attrs.list === "unchecked") {
					this.open = '- [ ] ' + this.open;
				} else if (attrs.list === 'ordered') {
					group.count = group.count || 0;
					const count = ++group.count;
					this.open = count + '. ' + this.open;
				}
			},
		},
	}  as BlockFunctions,
};

export default config;
