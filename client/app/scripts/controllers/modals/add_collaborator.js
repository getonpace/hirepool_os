'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:ModalsAddCollaboratorCtrl
 * @description
 * # ModalsAddCollaboratorCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('ModalsAddCollaboratorCtrl', function ($scope, $timeout, $routeParams, $http, _, jQuery, $rootScope, emailHelpers, selectedCardData, eventRecorder) {

    $scope.id = selectedCardData.get().id;

    $scope.resetData = function () {
      $scope.collaborator = {};
      $scope.changed_successfully = false;
      $scope.trying_to_send = false;
      $scope.submitted = false;
      $scope.resetValidations();
    };

    $scope.fullModalReset = function () {
      $scope.resetData();
    };

    $scope.resetValidations = function () {
      $scope.collab_name_req = false;
      $scope.collab_email_req = false;
      $scope.collab_email_invalid = false;
    };

    $scope.fullModalReset();

    $scope.hasClientValidationErrors = function () {
      if ($scope.submitted) {
        var returnVal = false;
        $scope.resetValidations();

        var requiredErrors = $scope.addCollaboratorForm.$error.required;

        if (requiredErrors) {
          if (_.find(requiredErrors, function(e) { return e.$name === 'collaborator-name'; })) {
            $scope.collab_name_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'collaborator-email'; })) {
            $scope.collab_email_req = true;
          }

          returnVal = true;
        }

        if ($scope.addCollaboratorForm['collaborator-email'].$viewValue &&
          !emailHelpers.regexp.test($scope.addCollaboratorForm['collaborator-email'].$viewValue)) {
          $scope.collab_email_invalid = true;
          returnVal = true;
        }

        return returnVal;
      }

      return true;
    };

    $scope.submitCollaborator = function () {
      $scope.submitted = true;

      if ($scope.hasClientValidationErrors() || $scope.changed_successfully) {
        return;
      }

      $scope.trying_to_send = true;
      $http({
        method: 'POST',
        url: '/api/collaborator_feedback/',
        data: {
          interview: {
            id: $routeParams.id ? $routeParams.id : $scope.id
          },
          collaborator: {
            name: $scope.collaborator.name,
            email: $scope.collaborator.email
          },
        }
      }).then(function successCallback(resp) {
        eventRecorder.trackEvent({
          action: 'emailed-collaborator',
          modal: 'add-collaborator',
          interviews: [$routeParams.id ? $routeParams.id : $scope.id]
        });
        $scope.changed_successfully = true;
        $scope.trying_to_send = false;
        $rootScope.$broadcast('newCollabFeedback', resp.data.collaborator_feedback, $routeParams.id ? $routeParams.id : $scope.id);
        $timeout(function() {
          eventRecorder.trackEvent('added-collaborator');
          jQuery('.modal .close-button').click();
        });
      }, function errorCallback() {
      });
    };

    var cardCleanupFunc = $rootScope.$on('updatingCard', function () {
      var card = selectedCardData.get();
      $scope.id = card.id;
    });

    $scope.$on('$destroy', function() {
      cardCleanupFunc();
    });


  });
