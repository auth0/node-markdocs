
var nconf = require('nconf'),
  path = require('path'),
  express = require('express');
  util = require('util'),
  fs = require('fs'),
  events = require('events'),
  Doc = require('./doc');

function Site(sitePath, siteUrl, app){

  events.EventEmitter.call(this);

  var self = this;

  this._embedded = !!app;
  this._siteUrl = siteUrl || '';
  this._sitePath = sitePath || process.cwd();
  this._mdocPath = __dirname;

  //app
  this._app = app || express();

  //settings
  this._settings = nconf.argv().env()
    .file('site', path.resolve(this._sitePath, 'settings.json'))
    .file('default', path.resolve(this._mdocPath, 'default_settings.json'));

  //load theme
  this._themePath = path.resolve(this._sitePath, 'themes', nconf.get('theme'));
  this._theme = new (require(this._themePath))(this);

  //configure app
  this._app.configure(function(){
    if (!self._embedded) {
      self._app.set('port', process.env.PORT || 3000);
      self._app.set('views',  path.resolve(self._themePath, 'views'));
      self._app.set('view engine', 'jade');
      self._app.use(express.favicon());
      self._app.use(express.logger('dev'));
      self._app.use(express.bodyParser());
      self._app.use(express.methodOverride());
      self._app.use(self._app.router);
    }
    self._app.use(express.static(path.resolve(self._sitePath, 'public')));
    self._app.use(express.static(path.resolve(self._themePath, 'public')));
  });


  //load docs
  this._docsPath = path.resolve(sitePath, 'docs');
  this._docs = {};
  fs.readdirSync(this._docsPath).forEach(function(filename) {
    if (!/\.md$/.test(filename)) return;
    var doc = new Doc(self, filename);
    self._docs[doc.getUrl()] = doc;
    var url = self._siteUrl + doc.getUrl();
    if (doc.getUrl() == '/' && self._siteUrl) {
      url = self._siteUrl;
    }
    self._app.get(url, self.get.bind(self));
  });
  
}
util.inherits(Site, events.EventEmitter);

Site.prototype.getSettings = function() {
  return this._settings;
};

Site.prototype.getApp = function() {
  return this._app;
};

Site.prototype.getDocsPath = function() {
  return this._docsPath;
};

Site.prototype.start = function(port) {
  this._app.listen(port);
};

Site.prototype.get = function(request, response) {
  var self = this;
  var url = request.url.substr(this._siteUrl.length) || '/';
  var doc = this._docs[url];
  var view = (doc.getMeta().latout || 'doc') + '.jade';
  response.locals.furl = function(rurl) {
    if (self._siteUrl && rurl.indexOf('/') === 0) {
      if (rurl == '/')
        return self._siteUrl;
      else
        return self._siteUrl + rurl;
    }
    return rurl;
  };
  response.locals.url = url;
  response.locals.meta = doc.getMeta();
  response.locals.sections = doc.getSections();
  response.locals.site = {};
  this.emit('prerender', request, response, doc);
  response.render(path.resolve(this._themePath, 'views', view), {});
};

module.exports = Site;