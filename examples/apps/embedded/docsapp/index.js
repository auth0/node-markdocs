var mdoc = require('../../../..');

module.exports = function (baseUrl, app) {
  return new mdoc.App(__dirname, baseUrl, app);
};