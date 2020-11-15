var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var cons = require('consolidate');

var index = require('./routes/index');
var login = require('./routes/login');
var table = require('./routes/table');

var app = express();

app.locals.env = process.env;

app.engine('html', mustacheExpress());
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'html');
app.set('port', 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));

app.use('/', index);
app.use('/login', login);
app.use('/table', table);

app.use(function (req, res, next) {
  res.type('txt').send('Not found');
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(app.get('port'));
module.exports = app;