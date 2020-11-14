(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('ModalsSurveyReminderCtrl', ModalsSurveyReminderCtrl);

ModalsSurveyReminderCtrl.$inject = ['ConstantsFactory', '$scope', '$rootScope', '$timeout', 'jQuery', 'userProperties'];
function ModalsSurveyReminderCtrl (ConstantsFactory, $scope, $rootScope, $timeout, jQuery, userProperties) {
  var vm = this;

  vm.message = {};
  vm.cancel = cancel;

  function cancel (whenToRemind) {
    if (whenToRemind === 'later') {
      // set survey reminder timer
      userProperties.setSurveyReminderDate();
    } else if (whenToRemind === 'never') {
      // set never remind
      userProperties.setSurveyReminderDate('never');
    }

    // close the modal
    $timeout(function() {
      jQuery('.modal .close-button').click();
    });
  }

  var setSurveyReminderTextCleanupFunc = $rootScope.$on('setSurveyReminderText', function (ev, surveyReminderText) {
    vm.message.title = surveyReminderText.title;
    vm.message.reminderText = surveyReminderText.reminderText;
  });
  $scope.$on('$destroy', function() {
    setSurveyReminderTextCleanupFunc();
  });

}
})();
