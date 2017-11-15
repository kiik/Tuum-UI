
const express = require('express');
const path = require('path');


function templatePath(fp)
{
  return path.join(__dirname, 'views', fp);
}

function routerFactory()
{
  var router = express.Router();

  router.get('/', function(req, res, next) {
    res.sendFile(templatePath('ui/base.html'));
  });

  router.get('/mapping.html', function(req, res, next) {
    res.sendFile(templatePath('ui/mapping.html'));
  });

  router.get('/drive.html', function(req, res, next) {
    res.sendFile(templatePath('ui/drive.html'));
  });

  router.get('/drive/settings.html', function(req, res, next) {
    res.sendFile(templatePath('ui/drive-settings.html'));
  });

  router.get('/devel.html', function(req, res, next) {
    res.sendFile(templatePath('ui/devel.html'));
  });

  router.get('/calibrate.html', function(req, res, next) {
    res.sendFile(templatePath('ui/calibrate.html'));
  });

  return router;
}



module.exports = {
  'register_router': function(target) {
      var router = routerFactory();
      target.use('/ui', router);
      return router;
    },
    setup: function setup(app) {
      return module.exports.register_router(app);
    },
}
