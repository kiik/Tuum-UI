
var TuumProtocol = function(TSrv) {
  var gSrv = TSrv;

  this.send = function(data) {
    return gSrv.sendRequest(data);
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
  initCoilProtocol(this);
  initFsProtocol(this);

  return this;
}