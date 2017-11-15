
var express = require('express');
var path = require('path');

var router = express.Router();


router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/templates/ui/base.html'));
});

router.get('/mapping.html', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/templates/ui/mapping.html'));
});

router.get('/drive.html', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/templates/ui/drive.html'));
});

router.get('/drive/settings.html', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/templates/ui/drive-settings.html'));
});

router.get('/devel.html', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/templates/ui/devel.html'));
});

router.get('/calibrate.html', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/templates/ui/calibrate.html'));
});

module.exports = {
  'register_router': function(target) {
    target.use('/ui', router);
  }
}
