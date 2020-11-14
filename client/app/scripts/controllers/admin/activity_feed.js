(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AdminActivityFeedCtrl', AdminActivityFeedCtrl);

AdminActivityFeedCtrl.$inject = ['userProperties', 'eventRecorder'];
function AdminActivityFeedCtrl (userProperties, eventRecorder) {
  var vm = this;

  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'admin-activity-feed'
  });

  vm.data = {};
  vm.view = {};

  vm.userIsAdmin = userIsAdmin;


  function userIsAdmin () {
    return userProperties.isAdmin();
  }

}

})();