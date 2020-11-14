(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('ConfirmEmailCtrl', ConfirmEmailCtrl);

ConfirmEmailCtrl.$inject = ['$http', 'eventRecorder', '$scope', 'emailHelpers', '_', '$location'];
function ConfirmEmailCtrl ($http, eventRecorder, $scope, emailHelpers, _, $location) {
  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'welcome-screen'
  });

  var vm = this;
  vm.data = {};
  vm.data.name = '';
  vm.view = {};
  vm.view.submitted = false;
  vm.view.showResendForm = false;
  vm.view.errors = {};

  var urlParams = $location.search();
  if (urlParams.name) {
    vm.data.name = ' ' + urlParams.name;
  }
  if (urlParams.already_confirmed) {
    vm.view.userAlreadyConfirmed = true;
  } else if (urlParams.confirmation_expired) {
    vm.view.confirmationExpired = true;
  } else {
    vm.view.welcomeAndResend = true;
  }

  vm.hasClientValidationErrors = hasClientValidationErrors;
  vm.resendConfirmationEmail = resendConfirmationEmail;
  vm.showResendForm = showResendForm;
  vm.goToSignIn = goToSignIn;

  function goToSignIn () {
    $location.path('/#/sign_in');
  }

  function showResendForm () {
    vm.view.showResendForm = true;
  }

  function resendConfirmationEmail () {
    vm.view.submitted = true;
    if (hasClientValidationErrors()) {
      return;
    } else {
      $http({
        method: 'GET',
        url: '/api/auth/confirmation/new/?email=' + vm.data.email,
      }).then(function successCallback () {
        vm.view.showSuccessMessage = true;
      }, function errorCallback (err) {
        if (err && err.data && err.data.error === 'account_not_found') {
          vm.view.errors.email_account_not_found = true;
        } else {
          vm.view.errors.email_error = true;
        }
      });
    }
  }

  function hasClientValidationErrors () {
    if (vm.view.submitted) {
      var returnVal = false;
      vm.view.errors.email_req = false;
      vm.view.errors.email_invalid = false;
      vm.view.errors.email_account_not_found = false;
      vm.view.errors.email_error = false;
      var requiredErrors = $scope.resendConfirmationEmailForm.$error.required;
      if (requiredErrors) {
        if (_.find(requiredErrors, function(e) { return e.$name === 'email'; })) {
          vm.view.errors.email_req = true;
        }
        returnVal = true;
      }
      if ($scope.resendConfirmationEmailForm.email.$viewValue && !emailHelpers.regexp.test($scope.resendConfirmationEmailForm.email.$viewValue)) {
        vm.view.errors.email_invalid = true;
        returnVal = true;
      }
      return returnVal;
    }
    return true;
  }

}
})();
