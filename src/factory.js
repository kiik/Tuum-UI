
var path = require('path'),
    logger = require('morgan');

var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');


module.exports = {
  'create_app': function(dirname) {
    var app = express();

    console.log(path.join(dirname, 'assets'));
    app.use('/assets', express.static(path.join(dirname, 'assets')));
    app.set('views', path.join(dirname, 'templates'));
    app.set('view engine', 'jade');

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    return app;
  }
}
