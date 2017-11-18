
const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');

const libtuumui = require('libtuumui-njs');

const factory = libtuumui.factory;
const help = libtuumui.help;

const config = require('../config');

module.exports = {
  'create_app': function() {
    var app = factory.app_factory(config);

    app.use(favicon(path.join(__dirname, 'assets', 'img', 'favicon.ico')));

    var assetLibs = help.load_assets(app, __dirname);
    var assets = [
      'js/CanvasInput.js',
      'js/TuumInput.js',

      'js/TuumOverlay.js',
      'js/TuumProtocol.js',
      'js/TuumVision.js',

      'js/ng/srv.js',
      'js/ng/ctl.js',
      'js/ng/app.js',
    ];

    assetLibs.forEach(function(lib) {
      function libPathFormat(input) {
        return path.join('lib/', lib.name, input);
      }

      lib.css.forEach(function(elm) {
        assets.push(libPathFormat(elm));
      });

      lib.js.forEach(function(elm) {
        assets.push(libPathFormat(elm));
      });
    });

    libtuumui.config.setupAssets(config, {
      assetBasePath: __dirname,
      assetDir: path.join(__dirname, './assets'),
      assets: assets,
    });

    app.use(config.assets.urlPrefix, express.static(config.assets.assetDir));

    console.log({assetDir:config.assets.assetDir});
    console.log(config.assets.get());

    app.set('views', path.join(__dirname, './views'));
    app.set('view engine', 'pug');

    require('./ui').setup(app);

    app.get('/', function(req, res, next) {
      res.redirect('/ui');
    });

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
