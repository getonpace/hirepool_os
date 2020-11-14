'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:OpportunityDetailsFirstCollaboratorCtrl
 * @description
 * # OpportunityDetailsFirstCollaboratorCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('OpportunityDetailsFirstCollaboratorCtrl', function ($scope, $timeout, $routeParams, $http, _, jQuery, $rootScope, emailHelpers, eventRecorder) {

    $scope.resetData = function () {
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

        var requiredErrors = $scope.firstCollaboratorForm.$error.required;

        if (requiredErrors) {
          if (_.find(requiredErrors, function(e) { return e.$name === 'collaborator-name'; })) {
            $scope.collab_name_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'collaborator-email'; })) {
            $scope.collab_email_req = true;
          }

          returnVal = true;
        }

        if ($scope.firstCollaboratorForm['collaborator-email'].$viewValue &&
          !emailHelpers.regexp.test($scope.firstCollaboratorForm['collaborator-email'].$viewValue)) {
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
            id: $routeParams.id
          },
          collaborator: {
            name: $scope.collaborator.name,
            email: $scope.collaborator.email
          },
        }
      }).then(function successCallback(resp) {
        eventRecorder.trackEvent({
          action: 'emailed-collaborator',
          page: 'opportunity-details',
          interviews: [$routeParams.id]
        });
        $scope.changed_successfully = true;
        $scope.trying_to_send = false;
        $rootScope.$broadcast('newCollabFeedback', resp.data.collaborator_feedback, $routeParams.id);
        $timeout(function() {
          eventRecorder.trackEvent('added-collaborator');
          jQuery('.modal .close-button').click();
        }, 50);
      }, function errorCallback() {
      });
    };
  });
