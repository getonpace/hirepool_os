(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpAppHeader', hpAppHeader);

function hpAppHeader() {
  var directive = {
    templateUrl: 'views/directives/app_header.html',
    restrict: 'E',
    scope: {
    },
    link: linkFunc,
    controller: HpAppHeaderController,
    controllerAs: 'vm',
    bindToController: true
  };
  return directive;

  function linkFunc(/*scope, element, attrs*/) {
    /* */
  }
}

HpAppHeaderController.$inject = ['userProperties', '$rootScope', '$scope', '$location', '$auth', 'eventRecorder', 'jQuery'];
function HpAppHeaderController (userProperties, $rootScope, $scope, $location, $auth, eventRecorder, jQuery) {
  var vm = this;
  vm.view = {};
  vm.data = {};

  vm.data.user = userProperties.get();

  vm.showAddNew = showAddNew;
  vm.showBackToMyOpportunities = showBackToMyOpportunities;
  vm.userIsLoggedIn = userIsLoggedIn;
  vm.logout = logout;
  vm.userIsAdmin = userIsAdmin;
  vm.userIsHirepoolAdmin = userIsHirepoolAdmin;
  vm.hideNav = hideNav;
  vm.resetAddEventFodal = resetAddEventFodal;
  vm.showUploadOpportunities = showUploadOpportunities;
  vm.isActive = isActive;

  function isActive (testPath, searchContains) {
    var path = $location.path();
    if (searchContains) {
      if (path.indexOf(testPath) > -1) {
        return true;
      }
      return false;
    } else {
      return path === testPath;
    }
  }

  function showUploadOpportunities () {
    var path = $location.path();
    return path !== '/welcome';
  }

  function resetAddEventFodal () {
    $rootScope.$broadcast('reset-add-event-and-opportunity-fodal');
    window.openModal('add-event-and-opportunity-fodal');
  }

  function hideNav () {
    jQuery('[data-nav-toggle]').click();
  }

  function userIsHirepoolAdmin () {
    return (userIsAdmin() && vm.data.user.sponsor === 'hirepool');
  }

  function userIsAdmin () {
    return (vm.data.user && vm.data.user.is_admin);
  }

  function logout () {
    eventRecorder.trackEvent({action: 'logout'});
    $auth.signOut();
  }

  function userIsLoggedIn () {
    return vm.data.user && vm.data.user.id;
  }

  function showBackToMyOpportunities () {
    if (userIsLoggedIn()) {
      var path = $location.path();
      if (path !== '/' && path !== '/grid_view' && path !== '/welcome' && path !== '/choose_account') {
        return true;
      }
    }
    return false;
  }

  function showAddNew () {
    if (userIsLoggedIn()) {
      var path = $location.path();
      if (path === '/' || path === '/grid_view') {
        return true;
      }
    }
    return false;
  }

  var setUserPropertiesCleanupFunc = $rootScope.$on('setUserProperties', function () {
    vm.data.user = userProperties.get();
  });

  $scope.$on('$destroy', function() {
    setUserPropertiesCleanupFunc();
  });
}

})();
