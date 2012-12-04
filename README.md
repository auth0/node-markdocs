# node-markdocs

simple docs for apps with markdown

## Installation

    $ npm install markdocs -g


## Create a standalone docs app

    $ markdocs create

  Start the server:

  	$ node app

## Create an embedded docs app

    $ markdocs create docs -e

  Initialize the docs app from your express app:

```js
var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('Hello World');
});

var markdocs = require('markdocs');
var docsapp = markdocs.App('/docs', app);

app.listen(3000);
```
## License

MIT - qraftlabs - 2012