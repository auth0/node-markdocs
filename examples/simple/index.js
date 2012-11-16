var mdoc = require('../..');
var site = new mdoc.Site();

if (!module.parent) {
  site.start(3000);
  console.log('Site listening on port 3000');
} else {
	module.exports = site;
}