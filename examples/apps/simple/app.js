var mdoc = require('../../..');
var docsapp = new mdoc.App();

if (!module.parent) {
  docsapp.start(3000);
  console.log('Site listening on port 3000');
} else {
  module.exports = docsapp;
}