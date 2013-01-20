//copy from showdown/table, removed styles
var table = function(context) {
  return function(converter) {
    var tables = {}, filter; 
    tables.th = function(header){
      if (header.trim() === "") { return "";}
      var id = header.trim().replace(/ /g, '_').toLowerCase();
      return '<th id="' + id + '">' + header + '</th>';
    };
    tables.td = function(cell) {
      return '<td>' + converter.makeHtml(cell) + '</td>';
    };
    tables.ths = function(){
      var out = "", i = 0, hs = [].slice.apply(arguments);
      for (i;i<hs.length;i+=1) {
        out += tables.th(hs[i]) + '\n';
      }
      return out;
    };
    tables.tds = function(){
      var out = "", i = 0, ds = [].slice.apply(arguments);
      for (i;i<ds.length;i+=1) {
        out += tables.td(ds[i]) + '\n';
      }
      return out;
    };
    tables.thead = function() {
      var out, i = 0, hs = [].slice.apply(arguments);
      out = "<thead>\n";
      out += "<tr>\n";
      out += tables.ths.apply(this, hs);
      out += "</tr>\n";
      out += "</thead>\n";
      return out;
    };
    tables.tr = function() {
      var out, i = 0, cs = [].slice.apply(arguments);
      out = "<tr>\n";
      out += tables.tds.apply(this, cs);
      out += "</tr>\n";
      return out;
    };
    filter = function(text) { 
      var i=0, lines = text.split('\n'), tbl = [], line, hs, rows, out = [];
      for(i; i<lines.length;i+=1) {
        line = lines[i];
        // looks like a table heading
        if (line.trim().match(/^[|]{1}.*[|]{1}$/)) {
          line = line.trim();
          tbl.push('<table>');
          hs = line.substring(1, line.length -1).split('|');
          tbl.push(tables.thead.apply(this, hs));
          line = lines[++i];
          if (!line.trim().match(/^[|]{1}[\-=| ]+[|]{1}$/)) {
            // not a table rolling back
            line = lines[--i];
          }
          else {
            line = lines[++i];
            tbl.push('<tbody>');
            while (line.trim().match(/^[|]{1}.*[|]{1}$/)) {
              line = line.trim();
              tbl.push(tables.tr.apply(this, line.substring(1, line.length -1).split('|')));
              line = lines[++i];
            }
            tbl.push('</tbody>');
            tbl.push('</table>');
            // we are done with this table and we move along
            out.push(tbl.join('\n'));
            tbl = [];
            continue;
          }
        }
        out.push(line);
      }             
      return out.join('\n');
    };
    return [
    { 
      type: 'lang', 
      filter: filter
    }
    ];
  };
};

var js = function(context) {
    return function(converter) {
      return [
          {
            type    : 'lang',
            regex   : '(@{2})(.*?)(@{2})',
            replace : function(match, prefix, content, suffix) {
              with(context) {
                try {
                  return eval(content);
                } catch (e) {
                  return '<span style="color:red;">ERROR: ' + e.message + '</span>';
                }
              }
            }
          }
      ];
    };
};

module.exports = [table, js];