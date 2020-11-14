(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('OpportunityDetailsInteractionCtrl', OpportunityDetailsInteractionCtrl);

OpportunityDetailsInteractionCtrl.$inject = ['$scope', '$rootScope', 'jQuery', 'currentlySelectedEvent', '_', 'moment'];
function OpportunityDetailsInteractionCtrl ($scope, $rootScope, jQuery, currentlySelectedEvent, _, moment) {
  var vm = this;
  vm.view = {};
  vm.data = {};

  vm.data.interaction = $scope.interaction;
  vm.data.index = $scope.$index;
  vm.data.event = $scope.event;
  vm.parentView = $scope.$parent.vm.view;

  vm.openAccordionModal = openAccordionModal;
  vm.openRemoveParticipantModal = openRemoveParticipantModal;
  vm.needsFeedback = needsFeedback;
  vm.showFeedback = showFeedback;
  vm.feedbackChanged = feedbackChanged;

  function feedbackChanged () {
    vm.parentView.addingFeedback = true;
  }

  function showFeedback () {
    if (eventIsInPast()) {
      return true;
    }
    return false;
  }

  function setDataForModal () {
    currentlySelectedEvent.set(vm.data.event);
    currentlySelectedEvent.setInteraction(vm.data.interaction);
    $rootScope.$broadcast('settingCurrentlySelectedEvent');
    $rootScope.$broadcast('settingCurrentlySelectedInteraction');
  }

  function openAccordionModal ($event) {
    $event.stopPropagation();
    setDataForModal();
    window.openModal(jQuery($event.currentTarget).data('modal'));
  }

  function openRemoveParticipantModal ($event, participant) {
    currentlySelectedEvent.setParticipant(participant);
    $rootScope.$broadcast('settingCurrentlySelectedParticipant');
    openAccordionModal($event);
  }

  function needsFeedback () {
    return eventIsInPast() && interactionNeedsFeedback();
  }

  function interactionNeedsFeedback () {
    var hasFeedback = false;
    if (vm.data.interaction.one_word || vm.data.interaction.culture_val) {
      hasFeedback = true;
    } else {
      _.each(vm.data.interaction.interviewers, function (participant) {
        if (participant.excited) {
          hasFeedback = true;
        }
      });
    }
    return !hasFeedback;
  }

  function eventIsInPast () {
    return moment().isAfter(vm.data.event.date);
  }

  $scope.$on('colorRatingChanged', function () {
    feedbackChanged();
  });

}
})();
