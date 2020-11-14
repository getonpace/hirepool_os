(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('PrivacyForHumansCtrl', PrivacyForHumansCtrl);

PrivacyForHumansCtrl.$inject = ['eventRecorder'];
function PrivacyForHumansCtrl (eventRecorder) {

  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'privacy_for_humans',
  });

}
})();
