'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:UserForgotPasswordCtrl
 * @description
 * # UserForgotPasswordCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('UserForgotPasswordCtrl', function ($scope, $auth, _, emailHelpers) {

    $scope.submitted = false;
    $scope.password = {};
    $scope.tryingToSave = false;
    $scope.changedSuccessfully = false;

    $scope.hasClientValidationErrors = function () {
      if ($scope.submitted) {
        var returnVal = false;
        $scope.email_req = false;
        $scope.email_invalid = false;

        var requiredErrors = $scope.forgotPasswordForm.$error.required;

        if (requiredErrors) {
          if (_.find(requiredErrors, function(e) { return e.$name === 'email'; })) {
            $scope.email_req = true;
          }
          returnVal = true;
        }

        if ($scope.forgotPasswordForm.email.$viewValue &&
          !emailHelpers.regexp.test($scope.forgotPasswordForm.email.$viewValue)) {
          $scope.email_invalid = true;
          returnVal = true;
        }

        return returnVal;
      }

      return true;
    };

    $scope.submitForgotPassword = function() {
      $scope.submitted = true;

      if ($scope.hasClientValidationErrors()) {
        return;
      }

      $scope.tryingToSave = true;
      $auth.requestPasswordReset({
        email: $scope.password.email
      })
        .then(function() {
          $scope.tryingToSave = false;
          $scope.changedSuccessfully = true;
          // handle success response
        })
        .catch(function() {
          $scope.tryingToSave = false;
          // handle error response
        });
    };
  });
