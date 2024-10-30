## Quill delta to Markdown converter
Converter from the [Delta](https://quilljs.com/docs/delta/) document format used by the [Quill](https://quilljs.com/)
text editor to Markdown.

## Usage

```typescript
import toMarkdown from 'quill-delta-to-markdown'

const markdown = toMarkdown(deltaFromElseWhere)
```


## Test

```shell
yarn install

yarn jest
```

## About

This library is a fork of [frysztak](https://github.com/frysztak/quill-delta-to-markdown). Use pure typescript, zero peer dependencies