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

## Document Processors
Markdocs allows you to customize the processors that are used to transform your documents into HTML. By default Markdocs ships with two processors: Javascript and Markdown. However you can choose to replace these with your own processors or add additional processors. Note that the order of processors applied does matter.

### Using cusotm processors

```js

var options = {
  basePath: '/docs',
  useDefaultProcessors: false
};
var docsapp = markdocs.App(options, app);

// Add a custom processor
docsapp.addDocumentProcessor(function(context, text) {
  // Do your processing
  text = text.replace('!something', '<span>This is a wierd shortcut.</span>');
  return text;
});

// Add back the default processors after our first one
docsapp.addDocumentProcessor(markdocs.Processors.js);
docsapp.addDocumentProcessor(markdows.Processors.markdown);
```



## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
