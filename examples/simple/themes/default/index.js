
var Theme = function(site) {
	this._site = site;

	site.on('prerender', function(request, response, doc){
		response.locals.title = doc.getMeta()['title'] || 'Simple';
	});
	
};

module.exports = Theme;