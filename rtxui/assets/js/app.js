'use strict';

var app = angular.module('TuumUI', [
  'ngRoute',
  'ngMaterial',

  'ui.ace',

  'TuumUICtrls',
]);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/drive', {
            templateUrl: '/ui/drive.html',
            controller: 'EmptyCtrl'
        }).
        when('/devel', {
            templateUrl: '/ui/devel.html',
            controller: 'DevelopCtrl'
        }).
        when('/calib', {
            templateUrl: '/ui/calibrate.html',
            controller: 'CalibCtrl'
        }).
        otherwise({
            redirectTo: '/drive'
        });
    }
]);
