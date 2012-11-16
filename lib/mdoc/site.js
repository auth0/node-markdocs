
var nconf = require('nconf'),
  path = require('path'),
  express = require('express');
  util = require('util'),
  fs = require('fs'),
  events = require('events'),
  Doc = require('./doc');

function Site(sitePath){

  events.EventEmitter.call(this);

  var self = this;

  this._sitePath = sitePath || process.cwd();
  this._mdocPath = __dirname;

  //app
  this._app = express();

  //settings
  this._settings = nconf.argv().env()
    .file('site', path.resolve(this._sitePath, 'settings.json'))
    .file('default', path.resolve(this._mdocPath, 'default_settings.json'));

  //load theme
  this._themePath = path.resolve(this._sitePath, 'themes', nconf.get('theme'));
  this._theme = new (require(this._themePath))(this);

  //configure app
  this._app.configure(function(){
    self._app.set('port', process.env.PORT || 3000);
    self._app.set('views',  path.resolve(self._themePath, 'views'));
    self._app.set('view engine', 'jade');
    self._app.use(express.favicon());
    self._app.use(express.logger('dev'));
    self._app.use(express.bodyParser());
    self._app.use(express.methodOverride());
    self._app.use(self._app.router);
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
    self._app.get(doc.getUrl(), self.get.bind(self));
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
  var doc = this._docs[request.url];
  response.locals.meta = doc.getMeta();
  response.locals.sections = doc.getSections();
  this.emit('prerender', request, response, doc);
  response.render('doc', {});
};

module.exports = Site;