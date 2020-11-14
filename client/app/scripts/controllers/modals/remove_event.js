'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:ModalsRemoveEventCtrl
 * @description
 * # ModalsRemoveEventCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('ModalsRemoveEventCtrl', function ($scope, currentlySelectedEvent, $rootScope, $http, jQuery, $timeout, eventRecorder) {

    $scope.close = function () {
      $timeout(function() {
        jQuery('.modal .close-button').click();
      });
    };

    $scope.event = {};
    var eventCleanupFunc = $rootScope.$on('settingCurrentlySelectedEvent', function () {
      $scope.event = currentlySelectedEvent.get();
    });

    $scope.remove = function () {
      $http({
        method: 'DELETE',
        url: '/api/events/' + $scope.event.id,
      }).then(function successCallback(response) {
        if (response.data.success) {
          eventRecorder.trackEvent({
            action: 'deleted-event',
            modal: 'remove-event',
            interviews: [$scope.event.interview_id],
          });
          $rootScope.$broadcast('deletedInterview', $scope.event.id, $scope.event.interview_id);
          $scope.close();
        }
      }, function errorCallback() {
      });
    };

    $scope.$on('$destroy', function() {
      eventCleanupFunc();
    });

  });
