(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('ModalsSponsorUserAgreementCtrl', ModalsSponsorUserAgreementCtrl);

ModalsSponsorUserAgreementCtrl.$inject = ['$http', 'jQuery', '$scope', '$rootScope', '$auth', 'userProperties', 'eventRecorder', '$timeout'];
function ModalsSponsorUserAgreementCtrl ($http, jQuery, $scope, $rootScope, $auth, userProperties, eventRecorder, $timeout) {
  var vm = this;

  vm.data = {};
  vm.view = {};

  vm.decline = decline;
  vm.accept = accept;
  vm.matchSponsor = matchSponsor;

  function matchSponsor (sponsor) {
    var user = userProperties.get();
    if (user.email) {
      if (userProperties.get().sponsor === sponsor) {
        return true;
      }
      return false;
    }
    return true;
  }

  function loginAndClose () {
    if (vm.data.userLoginInfo) {
      $auth.submitLogin({
        email: vm.data.userLoginInfo.email,
        password: vm.data.userLoginInfo.password
      });
    }
    $timeout(function () {
      jQuery('.modal .close-button').trigger('click');
    }, 100);
  }

  function decline () {
    eventRecorder.trackEvent({
      action: 'decline-user-agreement',
    });
    $http({
      method: 'PUT',
      url: '/api/users/user_agreement/declined',
    }).then(function successCallback (resp) {
      if (resp && resp.data && resp.data.user) {
        userProperties.set(resp.data.user);
      }
      loginAndClose();
    }, function errorCallback () {
      loginAndClose();
    });
  }

  function accept () {
    eventRecorder.trackEvent({
      action: 'accept-user-agreement',
    });
    $http({
      method: 'PUT',
      url: '/api/users/user_agreement/accepted',
    }).then(function successCallback (resp) {
      if (resp && resp.data && resp.data.user) {
        userProperties.set(resp.data.user);
      }
      loginAndClose();
    }, function errorCallback () {
      loginAndClose();
    });
  }

  var updateUserLoginInfoFunc = $rootScope.$on('update-user-login-info', function (event, userLoginInfo) {
    vm.data.userLoginInfo = userLoginInfo;
  });
  $scope.$on('destroy', function () {
    updateUserLoginInfoFunc();
  });

}
})();
