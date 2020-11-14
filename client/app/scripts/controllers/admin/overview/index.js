(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AdminOverviewIndexCtrl', AdminOverviewIndexCtrl);

AdminOverviewIndexCtrl.$inject = ['userProperties', '$rootScope', 'eventRecorder'];
function AdminOverviewIndexCtrl (userProperties, $rootScope, eventRecorder) {
  var vm = this;

  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'admin-overview'
  });

  vm.data = {};
  vm.view = {};
  vm.view.tab = 'users';
  vm.view.graph = 'big';
  $rootScope.$broadcast('admin-overview-show-tab-users');

  vm.userIsAdmin = userIsAdmin;
  vm.showTab = showTab;
  vm.toggleGraph = toggleGraph;
  vm.userIsHirepoolAdmin = userIsHirepoolAdmin;

  function toggleGraph () {
    if (vm.view.graph === 'big') {
      vm.view.graph = 'small';
    } else {
      vm.view.graph = 'big';
    }
  }

  function userIsAdmin () {
    return userProperties.isAdmin();
  }

  function userIsHirepoolAdmin () {
    return userProperties.isHirepoolAdmin();
  }

  function showTab (tab) {
    if (tab && vm.view.tab !== tab) {
      vm.view.tab = tab;
      $rootScope.$broadcast('admin-overview-show-tab-' + tab);

      eventRecorder.trackEvent({
        action: 'show-tab-' + tab,
        page: 'admin-overview'
      });
    }
  }

}

})();
