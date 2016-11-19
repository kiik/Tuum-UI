
var TuumProtocol = function(TSrv) {
  var gSrv = TSrv;

  this.send = function(data, cb) {
    return gSrv.sendRequest(data, cb);
  }

  var initDriveProtocol = function(srv) {
    srv.omniDrive = function(spd, dir, rot) {
      var data = {
        uri: '/drv',
        c: 'drv',
        s: spd,
        d: dir * 1000,
        r: rot,
      };

      console.log(":DriveProtocol::omniDrive: Send - " + JSON.stringify(data));
      this.send(data, function(res) {
        console.log(":DriveProtocol::omniDrive: Response - " + JSON.parse(res));
      });
    }

    return srv;
  }

  var initVisionProtocol = function(srv) {
    srv.getFrame = function(cb) {
      this.send({
        'uri': '/vis',
        'c': 'getFrame',
        'dev': 'CAM0',
      }, cb);
    }

    srv.visionSetup = function(settings) {
      var cmd = {
        'uri': '/vis',
        'c': 'settings',
      };

      this.send($.extend(cmd, settings));
    }

    srv.PipelineConfig = function(settings) {
      var cmd = {
        'uri': '/vis',
        'c': 'pplcnf',
        'data': settings,
      };

      this.send(cmd);
    }

    return srv;
  }

  var initCoilProtocol = function(srv) {
    srv.doCharge = function() {
      this.send({'c': 'chrg'});
    }

    return srv;
  }

  var initFsProtocol = function(srv) {
    srv.ls = function(path = ".") {
      this.send({'c': 'ls', 'p': path});
    }

    return srv;
  }

  initDriveProtocol(this);
  initVisionProtocol(this);
  initCoilProtocol(this);
  initFsProtocol(this);

  return this;
}
