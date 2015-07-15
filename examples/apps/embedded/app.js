var markdocs = require('./docsapp'),
  express = require('express');

var app = express();


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
  res.render('index', { title: 'Embedded with EJS' });
});

var docsapp = markdocs('/docs', app);

app.listen(3000);
