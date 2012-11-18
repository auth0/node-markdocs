
var Theme = function(docsapp) {
  this._docsapp = docsapp;
  this._docsapp.on('prerender', this.preRender.bind(this));
};

Theme.prototype.preRender = function(request, response, doc) {
  var settings = this._docsapp.getSettings();
  response.locals.site = response.locals.site || {};
  response.locals.site.title = settings['title'] || 'Default';
  response.locals.site.menus = settings['menus'] || {};
  response.locals.title = doc.getMeta()['title'] || 'Document';
};

module.exports = Theme;