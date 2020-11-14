'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:UserSessionsCtrl
 * @description
 * # UserSessionsCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('UserSignInCtrl', ['$rootScope', '$scope', '$auth', '_', 'emailHelpers', 'eventRecorder', function ($rootScope, $scope, $auth, _, emailHelpers, eventRecorder) {
    var credsInvalidErrorMessage = 'Invalid login credentials. Please try again.';
  	$scope.submitted = false;
    $scope.tryingToSubmit = false;
  	$scope.signIn = {};

  	$scope.hasClientValidationErrors = function () {
      if ($scope.submitted) {
        var returnVal = false;
        $scope.creds_invalid = false;
        $scope.email_req = false;
	    	$scope.email_invalid = false;
	    	$scope.password_req = false;

        var requiredErrors = $scope.signInForm.$error.required;

        if (requiredErrors) {
          if (_.find(requiredErrors, function(e) { return e.$name === 'password'; })) {
            $scope.password_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'email'; })) {
            $scope.email_req = true;
          }
          returnVal = true;
        }

        if ($scope.signInForm.email.$viewValue &&
        	!emailHelpers.regexp.test($scope.signInForm.email.$viewValue)) {
          $scope.email_invalid = true;
          returnVal = true;
        }

        return returnVal;
      }

      return true;
    };

    $scope.submitSignIn = function () {
    	$scope.submitted = true;

      if ($scope.hasClientValidationErrors()) {
        return;
      }

      $scope.tryingToSubmit = true;
    	$auth.submitLogin($scope.signIn)
				.then(function successCallback () {
          eventRecorder.trackEvent({
            action: 'login',
            page: 'signin'
          });
          $scope.tryingToSubmit = false;
        });
    };

    $rootScope.$on('auth:login-error', function (context, response) {
      if (response && response.errors && response.errors[0]) {
        var errorMessage = response.errors[0];
        if (errorMessage === credsInvalidErrorMessage) {
          $scope.tryingToSubmit = false;
          $scope.creds_invalid = true;
        }
      }
    });
  }]);
