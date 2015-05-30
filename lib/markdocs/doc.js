/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var marked = require('marked');
var matter = require('gray-matter');

/**
 * Parse metadata from `Document` content
 *
 * ---
 * title: Title
 * url: /
 * ---
 *
 * #Title
 * More content
*/

/**
 * Expose `Doc`
 */

module.exports = Doc;

/**
 * Compile a `Document` from `filename` for `app`
 * Resolve `metadata` and some other perls
 *
 * @param {Markdocs} app
 * @param {String} filename
 */

function Doc(app, filename){
  var self = this;

  var data = matter(fs.readFileSync(path.resolve(app.getDocsPath(), filename), 'utf8'));

  this._app = app;
  this._filename = path.normalize(filename);

  this._meta = data.data || {};
  var content = data.content || '';

  if (!this._meta.url) {
    this._meta.url = '/' + this._filename.replace(/\.[\w]+$/, '');
  }

  if (this._meta.template) {
    var template = fs.readFileSync(path.resolve(app.getDocsPath(), this._meta.template + '.mdt'), 'utf8');
    content = this._processTemplate(template, content);
  }

  //TODO: implement section files
  this._sections = { 'content': content };

}

/**
 * Get `Document` url from `_meta`
 *
 * @return {String}
 * @api public
 */

Doc.prototype.getUrl = function() {
  return this._meta.url;
};

/**
 * Falsey if `Document` is not `public`
 *
 * @return {Boolean}
 * @api public
 */

Doc.prototype.isPublic = function() {
  return this._meta.public !== false;
};

/**
 * Get current `Metadata`
 *
 * @return {Object}
 * @api public
 */

Doc.prototype.getMeta = function() {
  return this._meta;
};

/**
 * Get `Document`'s `filename`
 *
 * @return {String}
 * @api public
 */

Doc.prototype.getFilename = function() {
  return this._filename;
};

/**
 * Get `Document`'s `sections`
 *
 * @return {Object}
 * @api public
 */

Doc.prototype.getSections = function() {
  return this._sections;
};

/**
 * Process `sections` from `context`
 *
 * @param {Context} context
 * @return {Object}
 * @api public
 */

Doc.prototype.processSections = function(context) {
  var sections = {};
  var processors = this._app.getDocumentProcessors().slice(0);

  for(var sname in this._sections) {
    var text = this._sections[sname];
    for (var p in processors) {
      if (typeof processors[p] === 'function') {
        text = processors[p](context, text);
      }
    }
    sections[sname] = text;
  }
  return sections;
};

Doc.prototype._processTemplate = function(template, content) {
    var parts = content.split('@@endblock@@');
    var re = /@@block:(.*)@@([^]*)/;
    for (var i = 0; i < parts.length; i++) {
      var matches = re.exec(parts[i]);
      if (matches) {
       var name = matches[1];
       var data = matches[2].trim();
       template = template.replace('@@block(\'' + name + '\')@@', data);
      }
    }

    // Clean up any remaining blocks (all blocks are optional)
    template = template.replace(/@@block\('.*'\)@@/, '');

    return template;
};
