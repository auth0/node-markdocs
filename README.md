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

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
