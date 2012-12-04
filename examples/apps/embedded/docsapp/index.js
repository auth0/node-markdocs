var markdocs = require('../../../..');

module.exports = function (baseUrl, app) {
  return new markdocs.App(__dirname, baseUrl, app);
};