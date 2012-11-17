
var fs = require('fs'),
  path = require('path'),
  markdown = require('markdown').markdown;

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

function Doc(site, filename){
  var self = this;
  var data = DOC_RE.exec(fs.readFileSync(path.resolve(site.getDocsPath(), filename), 'utf8'));

  //TODO: use yaml
  this._meta = {};
  if (data[1] && (ms = data[1].match(META_RE))) {
      ms.forEach(function(m){
        m = META_ITEM_RE.exec(m);
        self._meta[m[1]] = m[2];
      });
  }
  if (!this._meta.url) {
    this._meta.url = '/' + filename.replace(/\.[\w]+$/, '');
  }

  //TODO: implement section files
  this._sections = { 'content': data[2] || '' };

}

Doc.prototype.getUrl = function() {
  return this._meta.url;
};

Doc.prototype.getMeta = function() {
  return this._meta;
};

Doc.prototype.getSections = function() {
  return this._sections;
};

Doc.prototype.processSections = function(context) {
  var sections = {};
  for(var sname in this._sections) {
    sections[sname] = markdown.toHTML(this._sections[sname],
      'Gruber', {preprocessTreeNode: markdownPreprocessTreeNode(context)});
  }
  return sections;
};

module.exports = Doc;

//extended markdown
markdown.Markdown.dialects.Gruber.inline["@{"] = function(text) {
  var m = text.match( /(@\{)(([\s\S]*)\})/ );
  if (m && m[2])
    return [m[1].length + m[2].length, ["js", m[3]]];
  else {
    return [1, "@{"];
  }
};
markdown.Markdown.buildInlinePatterns(markdown.Markdown.dialects.Gruber.inline);
var markdownPreprocessTreeNode = function(context) {
  return function(jsonml, references) {
    if (jsonml[0] == 'js') {
      with (context) {
        return eval(jsonml[1]) || '';
      }
    }
    return jsonml;
  };
};