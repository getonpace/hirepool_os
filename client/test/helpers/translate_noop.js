'use strict';

// Fix for ng-translate not working in unit tests and being hard (impossible?) to mock
// https://github.com/angular-translate/angular-translate/issues/42#issuecomment-38054311
angular.module('translateNoop', [])
  .factory('$translateStaticFilesLoader', function ($q) {
    return function () {
      var deferred = $q.defer();
      deferred.resolve({});
      return deferred.promise;
    };
  });
