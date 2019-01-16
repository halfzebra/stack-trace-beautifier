# stack-trace-beautifier

[![Greenkeeper badge](https://badges.greenkeeper.io/halfzebra/stack-trace-beautifier.svg)](https://greenkeeper.io/)

A library for beautifying [stacktracejs/error-stack-parser](https://github.com/stacktracejs/error-stack-parser) stack-traces from minified client-side JavaScript using source-maps on the back-end.

Heavily inspired by [stacktracejs/stacktrace-gps](https://github.com/stacktracejs/stacktrace-gps)

## Usage

### Node.js

```js
const { createStackTraceBeautifier, stackTraceToString } = require('stack-trace-beautifier');

const stackTraceBeautifierInstance = createStackTraceBeautifier({
  sourceMapsPath: './maps',
  publicPath: '/',
  cache: new Map()
});

stackTraceBeautifierInstance.beautifyStackTrace(stackFrames)
      .then(stackTraceToString)
```
