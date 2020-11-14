(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AccountsMergedMessageCtrl', AccountsMergedMessageCtrl);

AccountsMergedMessageCtrl.$inject = ['$rootScope', '$scope', 'userProperties'];
function AccountsMergedMessageCtrl ($rootScope, $scope, userProperties) {
  var vm = this;
  vm.data = {};
  vm.view = {};

  vm.fullModalReset = fullModalReset;

  fullModalReset();

  function resetView () {
  }
  function resetData () {
  }
  function fullModalReset () {
    resetData();
    resetView();
  }

  function setAvailableProviders () {
    if (vm.data.user && vm.data.user.available_authentication_providers && vm.data.user.available_authentication_providers.length) {
      var authenticationProviders = vm.data.user.available_authentication_providers;
      var i = 1;
      var providers = authenticationProviders[0];
      if (authenticationProviders.length > 2) {
        for (i = 1; i < authenticationProviders.length - 1; i++) {
          providers = providers + ', ' + authenticationProviders[i];
        }
      }
      if (authenticationProviders.length > 1) {
        providers = providers + ' and ' + authenticationProviders[i] + '.';
      }
      vm.data.availableProviders = providers;
    }
  }

  function setFirstName () {
    if (vm.data.user && vm.data.user.name) {
      vm.data.firstName = vm.data.user.name.split(' ')[0];
    }
  }

  var setUserPropertiesCleanupFunc = $rootScope.$on('setUserProperties', function () {
    vm.data.user = userProperties.get();
    setFirstName();
    setAvailableProviders();
  });

  $scope.$on('$destroy', function() {
    setUserPropertiesCleanupFunc();
  });

}
})();
