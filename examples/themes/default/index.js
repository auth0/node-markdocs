
var Theme = function(docsapp) {
  this._docsapp = docsapp;
  docsapp.addPreRender(this._preRender.bind(this));
};

Theme.prototype._preRender = function(request, response, next) {
  var settings = this._docsapp.getSettings();
  response.locals.site = response.locals.site || {};
  response.locals.site.title = settings['title'] || 'Default';
  response.locals.site.menus = settings['menus'] || {};
  response.locals.title = response.doc.getMeta()['title'] || 'Document';
  next();
};

module.exports = Theme;