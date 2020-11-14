'use strict';

var app = angular.module('RouteData', []);

app.provider('RouteData', function () {
  var settings = {};
  var hookToRootScope = false;

  this.applyConfig = function(newSettings) {
    settings = newSettings;
  };

  this.hookToRootScope = function(enableRootScopeHook) {
    hookToRootScope = enableRootScopeHook;
  };

  function RouteData() {

    this.set = function(index, value) {
      settings[index] = value;
    };

    this.get = function(index) {
      if(settings.hasOwnProperty(index)) {
        return settings[index];
      } else {
        console.log('RouteData: Attempt to access a propery that has not been set');
      }
    };

    this.isHookedToRootSope = function() {
      return hookToRootScope;
    };
  }

  this.$get = function() {
    return new RouteData();
  };
}).

run(['$location', '$rootScope', 'RouteData', function($location, $rootScope, RouteData) {
  if(RouteData.isHookedToRootSope()) {
    $rootScope.RouteData = RouteData;
  }

  $rootScope.$on('$routeChangeStart', function(event, current) {
    var route = current.$$route;
    if(typeof(route) !== 'undefined' && typeof(route.RouteData) !== 'undefined') {
      var data = route.RouteData;
      for(var index in data) {
        RouteData.set(index, data[index]);
      }
    } 
  });
}]);