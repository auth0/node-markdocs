var markdocs = require('../../..');
var docsapp = new markdocs.App();

if (!module.parent) {
  docsapp.start(3000);
  console.log('Site listening on port 3000');
} else {
  module.exports = docsapp;
}