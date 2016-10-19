
var TuumProtocol = function(TSrv) {
  var gSrv = TSrv;

  this.send = function(data) {
    return gSrv.sendRequest(data);
  }

  var initDriveProtocol = function(srv) {
    srv.omniDrive = function(spd, dir, rot) {
      var data = {
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

  initDriveProtocol(this);

  return this;
}
