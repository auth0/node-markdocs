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

### External Consumption of Content
Markdocs supports the consumption of HTML content outside of the main side (for example embedding on a second site or using them in a SPA). You must set the options yourself from your host application as shown.

**To return just the article HTML**

Use embedded view: `response.locals.embedded = true`;

You must also provide a `doc.embedded.jade` template view in your theme. Typically this view looks like the following, but you may want to customize it.

```jade
!= sections.content
```
**TO return the article data as JSON/JSONP**

You must still provide the embedded view as shown above. In addition you can set the following.

`response.locals.json = true` or `response.locals.jsonp = true`.

Finally, in the JSON responses you can optionally include metadata by specifiying: `response.locals.include_metadata = true`;

The easiest way to use all of these in your app is to add a prerender middleware to your markdocs app as follows.

```js
var embedded = function (req, res, next) {
  res.locals.embedded = false;
  res.locals.include_metadata = false;

  if (req.query.e || req.query.callback) {
    res.locals.embedded = true;
  }

  if (req.query.m) {
    res.locals.include_metadata = true;
  }

  if (req.query.callback) {
    res.locals.jsonp = true;
  } else if (!req.accepts('html') && req.accepts('application/json')) {
    res.locals.json = true;
  }

  next();
};

docsapp.addPreRender(embedded);

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
