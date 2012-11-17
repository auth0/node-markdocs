# node-mdoc

simple docs for apps with markdown

## Installation

    $ npm install node-mdoc -g


## Create a standalone docs app

    $ node-mdoc create

  Start the server:

  	$ node app

## Create an embedded docs app

    $ node-mdoc create docs -e

  Initialize the docs app from your express app:

```js
var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('Hello World');
});

var mdoc = require('./docs');
var docsapp = mdoc('/docs', app);

app.listen(3000);
```
## License

MIT - qraftlabs - 2012