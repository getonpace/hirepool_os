(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('UserRegistrationsCtrl', UserRegistrationsCtrl);

UserRegistrationsCtrl.$inject = ['$scope', '$location', '$auth', '$http', '_', '$routeParams', 'emailHelpers', 'eventRecorder', '$rootScope', 'translateHelper', 'passwordValidationHelper'];
function UserRegistrationsCtrl ($scope, $location, $auth, $http, _, $routeParams, emailHelpers, eventRecorder, $rootScope, translateHelper, passwordValidationHelper) {
  var vm = this;

  vm.view = {};
  vm.view.submitted = false;
  vm.view.tryingToSubmit = false;
  vm.view.errors = {};
  vm.view.passwordErrors = {};

  vm.data = {};
  vm.data.registration = {};

  var errorsMessages = {};
  translateHelper.translate({ translateKey: 'pw-reset-flow.error.password-too-short', containerObject: errorsMessages, keyToGetResponse: 'pass_too_short' });
  translateHelper.translate({ translateKey: 'pw-reset-flow.error.password-too-simple', containerObject: errorsMessages, keyToGetResponse: 'pass_too_simple' });

  var accessKey = $routeParams.key || '';

  var abTestExperience = $routeParams.ab_test_experience || '';
  abTestExperience = abTestExperience || getRandomAbTestExperience();

  eventRecorder.trackPublicEvent({
    action: 'load-page',
    page: 'signup_' + abTestExperience,
  });

  vm.hasPwErrors = hasPwErrors;
  vm.hasClientValidationErrors = hasClientValidationErrors;
  vm.submitRegistration = submitRegistration;
  vm.showOneColumn = showOneColumn;
  vm.showTwoColumn = showTwoColumn;
  vm.showProfessionalLogin = showProfessionalLogin;
  vm.showSocialLogin = showSocialLogin;
  vm.doOauth = doOauth;

  function doOauth (provider) {
    var userParams = {};
    if (accessKey) {
      userParams.access_key = accessKey;
    }
    eventRecorder.trackPublicEvent({
      action: 'create_account_' + provider,
      page: 'signup_' + abTestExperience,
    });
    $auth.authenticate(provider, {params: userParams});
  }

  function showSocialLogin () {
    if (abTestExperience === 'social_oauth') {
      return true;
    }
    return false;
  }

  function showProfessionalLogin () {
    if (abTestExperience === 'professional_oauth') {
      return true;
    }
    return false;
  }

  function showTwoColumn () {
    if (abTestExperience && abTestExperience !== 'email_only') {
      return true;
    }
    return false;
  }

  function showOneColumn () {
    if (abTestExperience === 'email_only') {
      return true;
    }
    return false;
  }

  function hasPwErrors () {
    vm.view.passwordErrors = passwordValidationHelper.validatePassword(vm.data.registration.password);
    var errorsPresent = !_.reduce(vm.view.passwordErrors, function (memo, errorItem) {
      return memo && errorItem;
    }, true);
    return errorsPresent && vm.view.submitted;
  }

  function hasClientValidationErrors () {
    if (vm.view.submitted) {
      var returnVal = false;
      vm.view.errors.name_req = false;
      vm.view.errors.email_req = false;
      vm.view.errors.password_req = false;
      vm.view.errors.email_invalid = false;
      vm.view.errors.email_taken = false;
      vm.view.errors.password_too_short = false;
      vm.view.errors.password_too_simple = false;
      vm.view.errors.failed_submit_registration = false;
      var regForm = $scope.reg_form_one_column;
      if (showTwoColumn()) {
        regForm = $scope.reg_form_two_column;
      }
      var requiredErrors = regForm.$error.required;
      if (requiredErrors) {
        if (_.find(requiredErrors, function(e) { return e.$name === 'name'; })) {
          vm.view.errors.name_req = true;
        }
        if (_.find(requiredErrors, function(e) { return e.$name === 'email'; })) {
          vm.view.errors.email_req = true;
        }
        if (_.find(requiredErrors, function(e) { return e.$name === 'password'; })) {
          vm.view.errors.password_req = true;
        }
        returnVal = true;
      }
      if (regForm.email.$viewValue && !emailHelpers.regexp.test(regForm.email.$viewValue)) {
        vm.view.errors.email_invalid = true;
        returnVal = true;
      }
      return returnVal;
    }
    return true;
  }

  function submitRegistration () {
    vm.view.submitted = true;
    if (hasClientValidationErrors() || hasPwErrors()) {
      return;
    }
    vm.view.tryingToSubmit = true;
    if (accessKey) {
      vm.data.registration.access_key = accessKey;
    }
    authSubmitRegistration();
  }

  function authSubmitRegistration () {
    vm.data.registration.confirm_password = vm.data.registration.password;
    $auth.submitRegistration(vm.data.registration)
      .then(function successCallback () {
        eventRecorder.trackPublicEvent({
          action: 'create_account_email',
          page: 'signup_' + abTestExperience,
        });
        eventRecorder.trackEvent({
          action: 'create-account',
          page: 'signup'
        });
        $location.url('/confirm_email');
      }, function errorCallback (response) {
        vm.view.tryingToSubmit = false;
        if (response && response.data && response.data.errors) {
          if (response.data.errors.email) {
            vm.view.errors.email_taken = true;
          } else if (response.data.errors.full_messages) {
            if (response.data.errors.full_messages[0] === errorsMessages.pass_too_short) {
              vm.view.errors.password_too_short = true;
            } else if (response.data.errors.full_messages[0] === errorsMessages.pass_too_simple) {
              vm.view.errors.password_too_simple = true;
            }
          }
        } else {
          vm.view.errors.failed_submit_registration = true;
        }
      });
  }

  function getRandomAbTestExperience () {
    // get a random integer 0 to 3
    var rando = Math.floor(Math.random() * 4);
    if (rando === 0) {
      return 'email_only';
    }
    if (rando === 1) {
      return 'gmail_oauth_only';
    }
    if (rando === 2) {
      return 'professional_oauth';
    }
    return 'social_oauth';
  }

}
})();
