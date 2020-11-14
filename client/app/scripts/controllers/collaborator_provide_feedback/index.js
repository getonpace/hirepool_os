'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:CollaboratorProvideFeedbackIndexCtrl
 * @description
 * # CollaboratorProvideFeedbackIndexCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('CollaboratorProvideFeedbackIndexCtrl', function ($scope, $routeParams, $http, $location, _, eventRecorder) {

    $scope.feedback = {};
    $scope.collab_interview = {};
    $scope.user_name = {};
    $scope.collab_name = {};
    $scope.submitted = false;
    $scope.sendingFeedback = false;
    $scope.feedbackSent = false;

    $scope.resetValidations = function () {
      $scope.comp_rating_req = false;
      $scope.feedback_req = false;
    };

    $scope.resetValidations();

    $scope.$on('thumbRatingChanged', function () {
      $scope.hasClientValidationErrors();
    });

    $scope.hasClientValidationErrors = function () {
      if ($scope.submitted) {
        var returnVal = false;
        $scope.resetValidations();

        var requiredErrors = $scope.addFeedbackForm.$error.required;
        if (requiredErrors) {
          if (_.find(requiredErrors, function(e) { return e.$name === 'feedback_feedback'; })) {
            $scope.feedback_req = true;
          }
          returnVal = true;
        }
        if (!$scope.feedback.rating) {
          $scope.comp_rating_req = true;
          returnVal = true;
        }

        return returnVal;
      }
      return true;
    };

    $http({
      method: 'GET',
      url: '/api/provide_feedback/' + $routeParams.id,
      params: {id: $routeParams.id, token: $routeParams.token}
    }).then(function successCallback(response) {
      $scope.collab_interview = response.data.collab_interview;
      var userNameArray = response.data.user_name ? response.data.user_name.split(' ') : 'your friend';
      $scope.user_name = userNameArray[0];
      $scope.collab_name = response.data.collab_name;
      $scope.opportunityText = 'Hi ' + $scope.collab_name + '. ' +  'What do you think about an opportunity' + ($scope.collab_interview.role ? ' in ' + $scope.collab_interview.role : '') + ' at ' + $scope.collab_interview.company.name + '?';
    }, function errorCallback(response) {
      window.alert('Error: ' + response.data.error);
    });

    $scope.submitFeedback = function () {
      $scope.submitted = true;

      if ($scope.hasClientValidationErrors()) {
        return false;
      }

      $scope.sendingFeedback = true;
      $http({
        method: 'PUT',
        url: '/api/provide_feedback/' + $routeParams.id,
        data: {
          token: {
            token: $routeParams.token
          },
          collaborator_feedback: {
            rating: $scope.feedback.rating,
            feedback: $scope.feedback.feedback
          }
        }
      }).then(function successCallback() {
        eventRecorder.trackEvent({
          action: 'collaborator-replied',
          page: 'collaborator-provide-feedback',
          interviews: [$scope.collab_interview.id]
        });
        $scope.sendingFeedback = false;
        $scope.feedbackSent = true;
        $location.url('/provide_feedback/complete');
      }, function errorCallback(response) {
        $scope.sendingFeedback = false;
        window.alert('Error: ' + response);
      });
    };
  });
