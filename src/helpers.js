
var fs   = require('fs'),
    path = require('path'),
    util = require('util');


module.exports = {
  'load_routes': function(target, dirname) {
    fs.readdirSync(dirname).forEach(function(file) {
      try {
        var mod = require(path.join(dirname, file));
        if(mod.hasOwnProperty('register_router')) {
          console.log('Registering \'' + file + '\'...');
          mod.register_router(target);
        }
      } catch(e) {

      }
    });
  },
  'load_assets': function(target, dirname) {
    var dir = path.join(dirname, 'assets/lib');
    var assets = [];

    fs.readdirSync(dir).forEach(function(file) {
      var assetlib = path.join(dir, file);
      var assetmod = path.join(assetlib, 'asset.json');
      if(fs.existsSync(assetmod)) {
        var data = {
          css: [],
          js: [],
        };

        data = util._extend(data, JSON.parse(fs.readFileSync(assetmod, 'utf8')));
        assets.push(data);
      }
    });

    console.log('#TODO: Load assets...');
    console.log(assets);
  }
}
