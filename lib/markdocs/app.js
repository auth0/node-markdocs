var fspath = require('path');
var express = require('express');
var util = require('util');
var fs = require('fs');
var events = require('events');
var url = require('url');
var extensions = require('./extensions');
var Doc = require('./doc');
var jade = require('jade');
var xtend = require('xtend');
var converter = require('rel-to-abs');
var lsr = require('lsr');

/**
 * Expose `App`
 */

module.exports = App;

/**
 * Creat `Markdocs` application
 *
 * @param {String} basePath
 * @param {String} baseUrl
 * @param {Express} app
 */

function App(options, app){
  // Keep compat with the old signature
  // function App(basePath, baseUrl, app)
  if (typeof options === 'string' && typeof baseUrl === 'string') {
    options = {
      basePath: options,
      baseUrl: app,
    };
    app = arguments[2];
  }

  events.EventEmitter.call(this);

  var self = this;

  this._embedded = !!app;
  this._baseUrl = options.baseUrl || '';
  this._basePath = options.basePath || process.cwd();
  this._markdocsPath = __dirname;
  this._preRenders = [];
  this._extensions = extensions.slice(0);

  //app
  this._app = app || express();

  var merge = function (target, source) {
    for(var attr in source) {
      target[attr] = source[attr];
    }
    return target;
  };

  var defaultSettings = require(fspath.resolve(this._markdocsPath, 'default_settings.json'));
  var appSettings = require(fspath.resolve(this._basePath, 'settings.json'));

  //load theme
  this._themePath = fspath.resolve(this._basePath, 'themes', appSettings.theme || defaultSettings.theme || 'default');
  this._theme = new (require(this._themePath))(this);

  var themeSettings = require(fspath.resolve(this._themePath, 'settings.json'));
  this._settings = merge(defaultSettings, merge(themeSettings, appSettings));

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
    self._app.use(self._baseUrl, express.static(fspath.resolve(self._basePath, 'public')));
    self._app.use(self._baseUrl, express.static(fspath.resolve(self._themePath, 'public')));
  });

  //load docs
  this._docsPath = options.docsPath || fspath.resolve(this._basePath, 'docs');
  this._docsByUrl = {};
  this._docsByFilename = {};

  var middlewares = []
    .concat(self._get.bind(self))
    .concat(self._preRender.bind(self))
    .concat(self._render.bind(self));

  lsr
  .sync(this._docsPath)
  .forEach(function(fileStat) {
    var filename = fileStat.path;
    if (!/\.md$/.test(filename)) return;

    var doc = new Doc(self, filename);
    self._docsByUrl[doc.getUrl()] = doc;
    self._docsByFilename[doc.getFilename()] = doc;

    if (doc.isPublic()) {
      var url = self._baseUrl + doc.getUrl();
      if (doc.getUrl() == '/' && self._baseUrl) {
        url = self._baseUrl;
      }
      self._app.get(url, middlewares);
    }

  });
}

/**
 * Inherit from EventEmitter
 */

util.inherits(App, events.EventEmitter);

/**
 * Get current settings
 *
 * @api public
 */

App.prototype.getSettings = function() {
  return this._settings;
};

/**
 * Get current `express` app
 *
 * @api public
 */

App.prototype.getApp = function() {
  return this._app;
};

/**
 * Get current `docsPath`
 *
 * @api public
 */

App.prototype.getDocsPath = function() {
  return this._docsPath;
};

/**
 * Start `express` app listening at `port`
 *
 * @param {Number} port
 * @api public
 */

App.prototype.start = function(port) {
  this._app.listen(port);
};

/**
 * `GET` middleware for `express` app
 *
 * @param {Request} request
 * @param {Response} response
 * @param {Function} next
 * @api private
 */

App.prototype._get = function(request, response, next) {
  var self = this;
  var pathname = url.parse(request.url).pathname;
  if (this._baseUrl) {
    pathname = pathname.substr(url.parse(this._baseUrl).pathname.length) || '/';
  }
  var doc = this._docsByUrl[pathname];

  response.locals.include = function(file, section) {
    section = section || "content";
    var idoc = self._docsByFilename[file + '.md'];
    if (idoc) {
      //TODO: async
      var sections = idoc.processSections(response.locals);
      return sections[section];
    } else {
      return file;
    }
  };
  response.locals.furl = function(rurl) {
    if (self._baseUrl && rurl.indexOf('/') === 0) {
      if (rurl == '/')
        return self._baseUrl;
      else
        return self._baseUrl + rurl;
    }
    return rurl;
  };

  response.locals.url = pathname;
  response.locals.meta = doc.getMeta();
  response.locals.site = {};
  response.doc = doc;

  next();
};

/**
 * Execute `prerender` middleware
 *
 * @param {Request} request
 * @param {Response} response
 * @param {Function} next
 * @api private
 */

App.prototype._preRender = function(request, response, next) {
  var self = this;
  var i = 0;
  var fnext = function() {
    if (self._preRenders[i]) {
      i++;
      self._preRenders[i-1](request, response, fnext);
    } else {
      next();
    }
  };
  fnext();
};

/**
 * Render `Doc` section
 *
 * @param {Request} request
 * @param {Response} response
 * @api private
 */

App.prototype._render = function(request, response) {
  response.locals.sections = response.doc.processSections(response.locals);
  var viewname = (response.doc.getMeta().layout || 'doc') + '.jade';
  if (response.locals.jsonp) {
    viewname = (response.doc.getMeta().layout || 'doc.embedded') + '.jade';
    var options = {};
    Object.keys(response.locals).forEach(function(key) {
      options[key] = response.locals[key];
    });
    options.doc = response.doc;
    jade.renderFile(fspath.resolve(this._themePath, 'views', viewname), options, function(err, html){
      var converted = converter.convert(html, response.locals.base_url);
      response.jsonp({ html: converted });
    });
  } else if (response.locals.embedded) {
    viewname = (response.doc.getMeta().layout || 'doc.embedded') + '.jade';
    response.render(fspath.resolve(this._themePath, 'views', viewname), {});
  } else {
    response.render(fspath.resolve(this._themePath, 'views', viewname), {});
  }
};

/**
 * Add `prerender` middleware to `_preRenders` list
 *
 * @param {Function} callback
 * @api public
 */

App.prototype.addPreRender = function(callback) {
  this._preRenders.push(callback);
};

/**
 * Remove `prerender` middleware from `_preRenders` list
 *
 * @param {Function} callback
 * @api public
 */

App.prototype.removePreRender = function(callback) {
  for(var i in this._preRenders) {
    if(this._preRenders[i] === callback) {
      this._preRenders.splice(i, 1);
    }
  }
};

/**
 * Get current `_extensions`
 *
 * @api public
 */

App.prototype.getExtensions = function() {
  return this._extensions;
};

/**
 * Add `extension` to `_extensions`
 *
 * @param {Function} extension
 * @api public
 */

App.prototype.addExtension = function(extension) {
  this._extensions.push(extension);
};

/**
 * Remove `extension` from `_extensions`
 *
 * @param {Function} extension
 * @api public
 */

App.prototype.removeExtension = function(extension) {
  for(var i in this._extensions) {
    if(this._extensions[i] === extension) {
      this._extensions.splice(i, 1);
    }
  }
};

/**
 * Test if `.md` file and return `true`
 *
 * @param {String} file
 * @api private
 */

function filterMarkdown (filename) {
  return /\.md$/.test(filename);
}
