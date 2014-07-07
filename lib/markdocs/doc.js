
var fs = require('fs'),
  path = require('path'),
  showdown = require('showdown');

/**
  ---
  title: Title
  url: /
  ---

  #Title
  More content
*/

var DOC_RE = /^(?:[\s\n\r]*---\s*(?:[\n\r]+((?:.|[\r\n])*))?[\n\r]+---\s*(?:[\n\r]+|$))?((?:.|[\r\n])*)?$/;
var META_RE = /^\s*([\w]+)\s*:\s*(.*)\s*$/mg;
var META_ITEM_RE = /^\s*([\w]+)\s*:\s*(.*)\s*$/;

function Doc(app, filename){
  var self = this;
  var data = DOC_RE.exec(fs.readFileSync(path.resolve(app.getDocsPath(), filename), 'utf8'));

  this._app = app;
  this._filename = path.normalize(filename);

  this._meta = {};
  if (data[1] && (ms = data[1].match(META_RE))) {
      ms.forEach(function(m){
        m = META_ITEM_RE.exec(m);
        self._meta[m[1]] = m[2];
      });
  }
  if (!this._meta.url) {
    this._meta.url = '/' + this._filename.replace(/\.[\w]+$/, '');
  }

  //TODO: implement section files
  this._sections = { 'content': data[2] || '' };

}

Doc.prototype.getUrl = function() {
  return this._meta.url;
};

Doc.prototype.isPublic = function() {
  return this._meta.public !== 'false';
};

Doc.prototype.getMeta = function() {
  return this._meta;
};

Doc.prototype.getFilename = function() {
  return this._filename;
};

Doc.prototype.getSections = function() {
  return this._sections;
};

Doc.prototype.processSections = function(context) {
  var sections = {};
  var extensions = this._app.getExtensions().slice(0);
  for(var i in extensions) {
    if (typeof extensions[i] === 'function') {
      extensions[i] = extensions[i](context);
    }
  }
  var converter = new showdown.converter({ extensions: extensions });
  for(var sname in this._sections) {
    sections[sname] = converter.makeHtml(this._sections[sname]);
  }
  return sections;
};

module.exports = Doc;
