(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('PrivacyPolicyCtrl', PrivacyPolicyCtrl);

PrivacyPolicyCtrl.$inject = ['userProperties'];
function PrivacyPolicyCtrl (userProperties) {
  var vm = this;

  vm.data = {};
  vm.view = {};

  vm.showDataSharing = showDataSharing;

  function showDataSharing (sponsor) {
    var user = userProperties.get();
    if (user.sponsor === sponsor && (user.user_agreement_status === 'accepted' || user.user_agreement_status === 'auto-accepted')) {
      return true;
    }
    return false;
  }

}
})();
