'use strict';

var ngCtl = angular.module('TuumCtrl', [
  'ui.bootstrap',

  'TuumSrv',
]);


var seq = 0;

ngCtl.controller('EmptyCtrl', ['$scope', function ($scope) {
  $scope.id = seq++;
}]);


ngCtl.controller('DriveCtrl',
  ['$scope', '$interval', '$timeout', '$uibModal',
   'TuumInput', 'TuumAgent',
  function ($scope, $int, $tim, $mod, TInp, agent) {

    function bindAgent(ctx, agent)
    {

    }

    agent.when('ready', function() {
      /*
      agent.comm.getControlMode().then(function(data) {
        if(data.ctlm != 'MANUAL') $loc.path('/control-panel');
      });
      */
      console.log('[DriveCtrl] Tuum agent ready.');
    });

    $scope.TBot = agent;
    $scope.TInp = TInp;

    $scope.ballCount = 0;

    //TODO: get dia state
    $scope.diaState = false;

    $scope.doCharge = function() {
      agent.comm.doCharge();
    }

    $scope.doPitcherSA = function(speed, angle) {
      console.log("doPitcherSA()" + speed + " " + angle);
      //agent.comm.doPitcherSA(speed, angle);
    }

    $scope.doPitcherD = function(distance) {
      console.log("doPitcherD()" + distance);
      //agent.comm.doPitcherD(distance);
    }


    $scope.doDiaState = function(state) {
      console.log("doDiaState()" + state);

      if($scope.diaState != state){
        $scope.diaState = state;
        //agent.comm.doDiaState($scope.diaState);
      }

    }

    $scope.doKick = function() {
      agent.comm.doKick();
    }

    $scope.setDribbler = function(v) {
      agent.comm.setDribbler(v);
    }

    var last_packet = undefined;

    var V = 60, R_v = 90;

    function sendControlCmds(inp, force = false) {
      if(!inp) return;

      if(inp.lck == 0) {
        inp.spd = 0;
        inp.dir = 0;
        inp.rot = 0;
      }

      if(!_.isEqual(last_packet, inp) || force) {
        if(agent.isReady()) agent.comm.omniDrive(inp.spd * V, inp.dir, inp.rot * R_v);
        last_packet = $.extend({},inp);
      }
    }

    TInp.on('Change', function(data) {
      sendControlCmds(data);
    });

    $int(function() {
      if(TInp.controlMap.lck == 1)
        sendControlCmds(TInp.controlMap, true);
    }, 250);

    var canv = document.getElementById('fb-field');
    var rtexFFUI = new RtexFFUI(canv);

    var field_proc_run = true;

    function fieldUpdate() {
      if(!field_proc_run) return;

      /*
      agent.comm.EntityFilter.get(function(data) {
        $scope.ballCount = data.balls;
        rtexFFUI.updateEntities(data);
      });

      agent.comm.getMotionInfo(function(data) {
        $scope.motionData = data.motion;
      });*/
    }

    function vconf_refresh(data) {
      if(data.gpu_en) $scope.thresholdType = "GPU";
      else $scope.thresholdType = "CPU";
    }

    /*
    agent.comm.then(function() {
      agent.comm.vConfig({'thr_en': true}, function(data) {
        if(!data.hasOwnProperty("gpu_en")) {
          $scope.thresholdType = "None";
          return;
        }

        vconf_refresh(data);
      });

      $int(fieldUpdate, 1000);
      console.log(":DriveCtrl: 'TBot' ready.");
    });

    $scope.setGPUEnable = function(v) {
      if((v != true) && (v != false)) return;

      agent.comm.vConfig({'gpu_en': v}, function(data) {
        vconf_refresh(data);
      });
    }

    $scope.openSettings = function () {
      var modalInstance = $mod.open({
        animation: false,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: '/ui/v2/drive/settings.html',
        controller: 'DrvSetCtrl',
        controllerAs: '$ctrl',
        size: 'md',
        resolve: {

        }
      });

      modalInstance.result.then(function (v) {
        console.log(v);
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });
    };
    */

  }
]);



ngCtl.controller('ControlPanel',
  ['$scope', 'TuumInput',
  function ($scope, TInp) {
    console.log("load control panel");
    $scope.TInp = TInp;

    $scope.selected = 'None';
    $scope.items = [
        { name: 'John', otherProperty: 'Foo' },
        { name: 'Joe', otherProperty: 'Bar' }
    ];

    $scope.menuOptions = [
        ['Select', function ($itemScope, $event, modelValue, text, $li) {
            $scope.selected = $itemScope.item.name;
        }],
        null, // Dividier
        ['Remove', function ($itemScope, $event, modelValue, text, $li) {
            $scope.items.splice($itemScope.$index, 1);
        }]
    ];

  }
]);


ngCtl.controller('DrvSetCtrl',
  ['$uibModalInstance', '$scope', 'TuumInput',
  function ($Mod, $scope, TInp) {

    $scope.inputOptions = [
      {id: 'keyboard', name: "Keyboard" },
      {id: 'controller', name: "PS Controller"},
    ]

    $scope.data = {
      'inputSuccess': 0,
      'targetInput': TInp.getInputType(),
    }

    $scope.onInputChange = function(type) {
      $scope.inputSuccess = 0;

      if(type == "") {
        TInp.destroyInput();
        return;
      }

      if(TInp.resolveInput(type) >= 0) $scope.inputSuccess = 1;
      else $scope.inputSuccess = -1;
    }

    $scope.ok = function () {
      $Mod.close();
    };

    $scope.cancel = function () {
      $Mod.dismiss('cancel');
    };

  }
]);

ngCtl.controller('CalibCtrl',
  ['$scope', 'TuumAgent',
  function ($scope, agent) {
    var W = 1080, H = 720;

    agent.comm.vConfig({'thr_en': false});

    var baseCanv = document.getElementById('calib-canvas'),
        canv = document.getElementById('calib-overlay');

    var ctx = canv.getContext('2d');

    $scope.vFilter = null;
    $scope.selRanges = [];

    var VisionFilterUI = function() {
      this.selectClass(0);
    }

    VisionFilterUI.prototype.findEntry = function(id) {
      if($scope.vFilter == null) return null;

      for(var e in $scope.vFilter.classes) {
        if($scope.vFilter.classes[e].id == id) return $scope.vFilter.classes[e];
      }
      return null;
    }

    VisionFilterUI.prototype.selectClass = function(id) {
      this.clsId = 0;
      this.selInfo = null;

      var f = this.findEntry(id);
      if(f == null) return;

      this.clsId = f.id;
      this.selInfo = { 'id': f.id, 'name': f.name};
    }

    VisionFilterUI.prototype.onUpdate = function() {
      if(this.clsId == 0) return;
      if($scope.selRange == null) return;

      var that = this;
      var data = {
          'id': this.clsId,
          'range': TuumVision.rangeUnion(this.findEntry(this.clsId).range, $scope.selRange),
      }

      agent.comm.VisionFilter.set(data, function(res) {
        that.reload();
      });
    }

    VisionFilterUI.prototype.onSet = function() {
      if(this.clsId == 0) return;
      if($scope.selRange == null) $scope.selRange = [0, 0, 0, 0, 0, 0];

      var that = this;
      var data = {
          'id': this.clsId,
          'range': $scope.selRange,
      }

      agent.comm.VisionFilter.set(data, function(res) {
        that.reload();
      });
    }

    VisionFilterUI.prototype.onClear = function() {
      $scope.selRanges = [];
      $scope.selRange = null;
      this.onSet();
    }

    VisionFilterUI.prototype.reload = function() {
      agent.comm.VisionFilter.get(function(data) {
        $scope.vFilter = { 'classes': data.classes };
      });
    }

    $scope.vFilterUI = new VisionFilterUI();



    baseCanv.width = W, baseCanv.height = H;
    canv.width = baseCanv.width, canv.height = baseCanv.height;

    var gOverlay = new TuumOverlay(canv);
    var gVision = new TuumVision(baseCanv);

    gOverlay.getInput().on('mousemove', function(pos) {
      $scope.$apply(function() {
        $scope.mousePos = pos;
      });
    });

    $scope.selectedShades = [];

    var t = gOverlay.findTool(VectorPicker);
    if(t != null) {
      t.onVector(function(p0, p1, v, l) {
        if(l < 5) return;

        gVision.debugLine(ctx, p0, p1);

        var pxs = gVision.getPixelsOnLine(p0, p1);
        if(pxs.length <= 0) return;

        //$scope.selectedShades = $scope.selectedShades.concat(gVision.PixelUVFilterPack(pxs)); //gVision.calcColorShades(pxs);
        $scope.selRange = gVision.calcRange(pxs);
        $scope.selRanges.push($scope.selRange);
      });
    }

    $scope.grabFrame = function() {
      agent.comm.getFrame(function(dat) {
        gVision.renderFrame(dat.frame);
      })
    }

    $scope.updateVisionConfig = function() {
      agent.comm.vConfig($scope.vConfig);
    }

    agent.comm.then(function() {
      $scope.vFilterUI.reload();
    });

  }
]);



ngCtl.controller('DevelopCtrl',
  ['$scope',
  function ($scope) {
    var f_id_seq = 1;

    var editor;

    function loadDefaultFile() {
      var data = {
        id: f_id_seq++,
        name: 'Unnamed',
        content: '#include <chaiscript/chaiscript.hpp> \n\
\n\
std::string helloWorld(const std::string &t_name) { \n\
  return "Hello " + t_name + "!"; \n\
} \n\
\n\
int main() { \n\
  chaiscript::ChaiScript chai; \n\
  chai.add(chaiscript::fun(&helloWorld), "helloWorld"); \n\
\n\
  chai.eval(R"( \n\
    puts(helloWorld("Bob")); \n\
  )"); \n\
}',
        flags: {
          saved: false,
        },
      }

      return data;
    }

    $scope.data = {
      content: ""
    }

    var FileManager = {
      fileId: 0,
      file: undefined,
      files: {},
    };

    FileManager.selectFile = function(id) {
      if(!(id in this.files)) return -1;

      if(this.fileId > 0) {
        this.file.content = $scope.data.content;
      }

      this.fileId = id;
      this.file = this.files[id];

      $scope.data.content = this.file.content;
      return 1;
    }

    FileManager.open = function(fn) {
      var file;

      if(fn == undefined) file = loadDefaultFile();
      //TODO: Load 'fn'

      if(!file) return -1;
      this.files[file.id] = file;
      this.selectFile(file.id);
      return 1;
    }

    function loadEnv() {
      $scope.fman = FileManager;
      $scope.fman.open();
      $scope.fman.open();
    }


    $scope.aceLoaded = function(_editor) {
      // Editor part
      var _session = _editor.getSession();
      var _renderer = _editor.renderer;

      // Options
      _session.setUndoManager(new ace.UndoManager());
      _session.setMode("ace/mode/c_cpp");
      _renderer.setShowGutter(true);

      // Events
      _editor.on("changeSession", function(){  });
      _session.on("change", function(){  });

      editor = _editor;
      editor.$blockScrolling = Infinity;
      loadEnv();

      editor.commands.addCommand({
        name: 'save',
        bindKey: {win: 'Ctrl-S',},
        exec: function(editor) {
            console.log("Exec save");
          },
          readOnly: false // false if this command should not apply in readOnly mode
      });
    };

  }
]);
