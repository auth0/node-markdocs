
module.exports = [js, markdown];

var marked = require('marked');
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

/**
 * Process markdown
 *
 * @param {Context} context
 * @param {Text} text
 * @api private
 */

function markdown(context, text) {
  return marked(text);
};


var re = /(@{2})(.*?)(@{2})/;

/**
 * Execute Javascript enclosed by `@@var js = 'something'@@`
 *
 * @param {Context} context
 * @param {Text} text
 * @api private
 */

function js(context, text) {
  var result;
  while ((result = re.exec(text))) {
    var str = result[0];
    with (context) {
      try {
        var content = eval(result[2]);
        text = text.replace(str, content);
      } catch (e) {
        text = text.replace(str, '<span style="color:red;">ERROR: ' + e.message + '</span>');
      }
    }
  }
  return text;
};
