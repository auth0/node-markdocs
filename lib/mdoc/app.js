var fspath = require('path'),
  express = require('express');
  util = require('util'),
  fs = require('fs'),
  events = require('events'),
  Doc = require('./doc');

function App(basePath, baseUrl, app){

  events.EventEmitter.call(this);

  var self = this;

  this._embedded = !!app;
  this._baseUrl = baseUrl || '';
  this._basePath = basePath || process.cwd();
  this._mdocPath = __dirname;

  //app
  this._app = app || express();

  var merge = function (target, source) {
    for(var attr in source) {
      target[attr] = source[attr];
    }
    return target;
  };

  var defaultSettings = require(fspath.resolve(this._mdocPath, 'default_settings.json'));
  var appSettings = require(fspath.resolve(this._basePath, 'settings.json'));

  //load theme
  this._themePath = fspath.resolve(this._basePath, 'themes', appSettings.theme || defaultSettings.theme || 'default');
  this._theme = new (require(this._themePath))(this);

  var themeSettings = require(fspath.resolve(this._themePath, 'settings.json'));
  this._settings = merge(appSettings, merge(themeSettings, defaultSettings));

  //configure app
  this._app.configure(function(){
    if (!self._embedded) {
      self._app.set('port', process.env.PORT || 3000);
      self._app.set('views',  fspath.resolve(self._themePath, 'views'));
      self._app.set('view engine', 'jade');
      self._app.use(express.favicon());
      self._app.use(express.logger('dev'));
      self._app.use(express.bodyParser());
      self._app.use(express.methodOverride());
      self._app.use(self._app.router);
    }
    self._app.use(express.static(fspath.resolve(self._basePath, 'public')));
    self._app.use(express.static(fspath.resolve(self._themePath, 'public')));
  });


  //load docs
  this._docsPath = fspath.resolve(basePath, 'docs');
  this._docs = {};
  fs.readdirSync(this._docsPath).forEach(function(filename) {
    if (!/\.md$/.test(filename)) return;
    var doc = new Doc(self, filename);
    self._docs[doc.getUrl()] = doc;
    var url = self._baseUrl + doc.getUrl();
    if (doc.getUrl() == '/' && self._baseUrl) {
      url = self._baseUrl;
    }
    self._app.get(url, self.get.bind(self));
  });
  
}
util.inherits(App, events.EventEmitter);

App.prototype.getSettings = function() {
  return this._settings;
};

App.prototype.getApp = function() {
  return this._app;
};

App.prototype.getDocsPath = function() {
  return this._docsPath;
};

App.prototype.start = function(port) {
  this._app.listen(port);
};

App.prototype.get = function(request, response) {
  var self = this;
  var url = request.url.substr(this._baseUrl.length) || '/';
  var doc = this._docs[url];
  var view = (doc.getMeta().latout || 'doc') + '.jade';
  response.locals.furl = function(rurl) {
    if (self._baseUrl && rurl.indexOf('/') === 0) {
      if (rurl == '/')
        return self._baseUrl;
      else
        return self._baseUrl + rurl;
    }
    return rurl;
  };
  response.locals.url = url;
  response.locals.meta = doc.getMeta();
  response.locals.site = {};
  this.emit('prerender', request, response, doc);
  response.locals.sections = doc.processSections(response.locals);
  response.render(fspath.resolve(this._themePath, 'views', view), {});
};

module.exports = App;