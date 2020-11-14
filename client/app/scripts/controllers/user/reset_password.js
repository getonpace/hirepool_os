'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:UserResetPasswordCtrl
 * @description
 * # UserResetPasswordCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('UserResetPasswordCtrl', function ($scope, $auth, _, passwordValidationHelper) {

    $scope.reset = function () {
      $scope.password = {};
      $scope.changedSuccessfully = false;
      $scope.tryingToSubmit = false;
      $scope.submitted = false;
      $scope.passwordErrors = {};
      $scope.equals_current_pass = false;
      $scope.other_error = false;
    };

    $scope.reset();

    $scope.hasPwErrors = function () {
      $scope.passwordErrors = passwordValidationHelper.validatePassword($scope.password.password);
      var errorsPresent = !_.reduce($scope.passwordErrors, function (memo, errorItem) {
        return memo && errorItem;
      }, true);
      return errorsPresent && $scope.submitted;
    };

    $scope.submitResetPassword = function () {
      $scope.submitted = true;

      if ($scope.changedSuccessfully || $scope.hasPwErrors()) {
        return;
      }

      $scope.password.password_confirmation = $scope.password.password;

      $scope.tryingToSubmit = true;
      $auth.updatePassword({
        password: $scope.password.password,
        password_confirmation: $scope.password.password_confirmation,
        allow: true
      })
        .then(function() {
          $scope.tryingToSubmit = false;
          $scope.changedSuccessfully = true;
          $auth.signOut();
        })
        .catch(function(response) {
          $scope.tryingToSubmit = false;
          if (response.data.errors.password && response.data.errors.password.includes("CANNOT_EQUAL_TO_CURRENT_PASSWORD")) {
            $scope.equals_current_pass = true;
          } else {
            $scope.other_error = true;
          }
        });
    };
  });
