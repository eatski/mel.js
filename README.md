# Mel is Minimun Expression Language
- Mel has a **simple JavaScript-like** syntax.
- Mel can be run in **any language**.
- Mel is **strict** about the type.

## Install

```
$ npm install meljs
```

## Usage
```js
const {parse,evalExpression} = require("meljs");
const ast = parse("foo < (bar + 3) * 5");
console.log(evalExpression(ast,{foo:15,bar:1})); //true
console.log(evalExpression(ast,{foo:10,bar:-2})); //false
```

## CLI demo
```bash
npx mel
```

## Syntax
see [E2E Test Cases](./src/e2e.test.ts)




