'use strict';

var tuiCtrls = angular.module('TuumUICtrls', [
  'ui.bootstrap',
]);


var seq = 0;

tuiCtrls.controller('EmptyCtrl', ['$scope', function ($scope) {
  $scope.id = seq++;
}]);


tuiCtrls.controller('DriveCtrl',
  ['$scope', '$interval', '$uibModal',
   'TuumInput', 'TuumBot',
  function ($scope, $int, $mod, TInp, TBot) {
    $scope.TBot = TBot;
    $scope.TInp = TInp;

    var last_packet = undefined;

    var V = 100, R_v = 30;

    function sendControlCmds(inp, force = false) {
      if(!inp) return;

      if(inp.lck == 0) {
        inp.spd = 0;
        inp.dir = 0;
        inp.rot = 0;
      }

      if(!_.isEqual(last_packet, inp) || force) {
        TBot.omniDrive(inp.spd * V, inp.dir, inp.rot * R_v);
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


    TBot.then(function() {
      console.log(":DriveCtrl: 'TBot' ready.");
    });

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

  }
]);



tuiCtrls.controller('ControlPanel',
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


tuiCtrls.controller('DrvSetCtrl',
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



tuiCtrls.controller('DevelopCtrl',
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
