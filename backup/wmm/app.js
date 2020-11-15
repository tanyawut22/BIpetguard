var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cons = require('consolidate');

var index = require('./routes/index');
var matask = require('./routes/matask/matask');
var uilib = require('./routes/uilib/uilib');
var login = require('./routes/login');
var logout = require('./routes/logout');
var reauthen = require('./routes/reauthen');
var auto = require('./routes/automate/automate');
var upload = require('./routes/upload');
var report = require('./routes/report/report');
var webhook = require('./routes/bot/bot');

var app = express();

app.locals.env = process.env;

//app.engine('html', cons.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('port', 3000);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/matask', matask);
app.use('/uilib', uilib);
app.use('/uploadimg', upload);
app.use('/reauthen', reauthen);
app.use('/login', login);
app.use('/logout', logout);
app.use('/automate', auto);
app.use('/report', report);
app.use('/webhook', webhook);

// app.post('/webhook', (req, res) => res.sendStatus(200))

// var staticMiddlewarePrivate = express['static'](__dirname + '/private');

// app.get('/private/*', function (req, res, next) {
//   console.log('get picture ' + __dirname + '/private');
//   console.log(staticMiddlewarePrivate);
//   staticMiddlewarePrivate(req, res, next);
// });

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
