
var Theme = function(site) {
	this._site = site;
	site.on('prerender', this.preRender.bind(this));
};

Theme.prototype.preRender = function(request, response, doc) {
	var settings = this._site.getSettings();
	response.locals.site = response.locals.site || {};
	response.locals.site.title = settings.get('title') || 'Default';
	response.locals.site.menus = settings.get('menus') || {};
	response.locals.title = doc.getMeta()['title'] || 'Document';

};

module.exports = Theme;