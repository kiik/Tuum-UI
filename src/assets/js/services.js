
angular.module('TuumUI').factory('TuumSrv',
  ['$q', '$rootScope', '$location', '$timeout',
  function($q, $rootScope, $loc, $tim) {
    var Service = {};
    var callbacks = {};
    var currentCallbackId = 0;

    var ws;
    var onopen_cbs = [];

    var host = "172.19.29.41"; // TuumBot1
    //var host = "172.19.27.28"; // TuumBot2
    //var host = "localhost";

    function init() {
      ws = new WebSocket("ws://" + host + ":8080/", "ws-json");

      ws.onopen = function() {
        console.log("WS connection established.");

        onopen_cbs.forEach(function(cb) {cb(Service)});
        onopen_cbs = [];
      };

      ws.onclose = function(){
        $tim(function(){init()}, 3000);
      };

      ws.onmessage = function(message) {
        Service.listener(message);
      };

    }

    Service.isReady = function() { return ws.readyState == 1; }

    Service.sendRequest = function(req, cb) {
      if(!this.isReady()) return false;

      var defer = $q.defer();
      var callbackId = this.getCallbackId();
      req._ = callbackId;

      callbacks[callbackId] = {
        time: new Date(),
        cb: cb,
      };

      var dat = JSON.stringify(req);
      ws.send(dat);
      return true;
    }

    Service.listener = function(dat) {
      var res = JSON.parse(dat.data);

      var cId = res._;
      if(!cId) return;

      if(callbacks.hasOwnProperty(cId)) {
        var cb = callbacks[cId].cb;

        if(cb) {
          $rootScope.$apply(cb(res));
          delete callbacks[cId];
        }
      }
    }

    Service.getCallbackId = function() {
      currentCallbackId += 1;
      if(currentCallbackId > 1000000) {
        currentCallbackId = 0;
      }
      return currentCallbackId;
    }

    Service.then = function(cb) {
      if(!this.isReady()) onopen_cbs.push(cb);
      else cb(Service);
    }

    Service.ondata = function(data) {

    }

    init();

    var TSrv = new TuumProtocol(Service);
    TSrv.then = Service.then;
    TSrv.isReady = Service.isReady;
    TSrv.host = host;

    return TSrv;
}]);


angular.module('TuumUI').factory('TuumBot',
  ['$location', '$timeout', 'TuumSrv',
  function($loc, $tim, TSrv) {
    console.log(":load: TuumUI::TBot");

    function zArray(n) { return Array.apply(null, Array(n)).map(Number.prototype.valueOf,0); }

    var Model = TSrv;

    Model.lastUpdate = Date.now();

    var running = true;

    function syncProcess() {
      if(!running) return;

      //TODO

      Model.lastUpdate = Date.now();

      if(Model.isReady())
        $tim(syncProcess, 1000);
      else
        Model.then(syncProcess);
    }

    Model.host = TSrv.host;

    syncProcess();

    return Model;
  }
]);
