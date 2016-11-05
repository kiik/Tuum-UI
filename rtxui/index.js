
var path = require('path');
var logger = require('morgan');

var express = require('express');
var _io = require('socket.io');


function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}

module.exports = {
  'create_app': function(env) {
    var helpers = env.helpers,
        factory = env.factory;

    var app = factory.create_app(__dirname);

    app.sio = _io;

    app.register_sio = function(server) {
      var io = _io.listen(server);

      io.sockets.on('connection', function (socket) {
        console.log('New socket.io connection!');

        socket.on('error', function(data) {
          console.log(data);
        });
      });
    }

    helpers.load_routes(app, __dirname);
    helpers.load_assets(app, __dirname);

    // Catch 404 and forward to error handler
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });


    if (app.get('env') === 'development') {
      app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err
        });
      });
    }

    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    });

    return app;
  }
}
