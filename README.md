# fastify-autoload

Fastify plugin for creating dynamic routes based on valid JSON.

## Installation

```
npm i @pybot/fastify-autoload
```

## Example

```js
const fastify = require('fastify')
const autoload = require('@pybot/fastify-autoload')

const app = fastify({logger: true})

app.register(autoload, {
  dir: 'config'
})

app.listen({ port: 3000 })
```


Folder structure:

```
├── config
│   ├── api-server.json
│   ├── unsupported.txt
│   ├── trace.json
├── package.json
└── src
    └── index.js

```
