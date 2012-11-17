var mdoc = require('../..'),
  express = require('express');

var app = express();


app.configure(function(){
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');
});

app.get('/', function(req, res) {
  res.render('index', { title: 'Embedded with EJS' });
});

var site = new mdoc.Site(__dirname + '/docsite', '/docs', app);

app.listen(3000);