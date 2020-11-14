(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('ModalsEventNotesCtrl', ModalsEventNotesCtrl);

ModalsEventNotesCtrl.$inject = ['$scope', '$rootScope', '_', 'currentlySelectedEvent', 'selectedCardData', 'opportunityDetails', 'moment'];
function ModalsEventNotesCtrl ($scope, $rootScope, _, currentlySelectedEvent, selectedCardData, opportunityDetails, moment) {
  var vm = this;
  vm.data = {};
  vm.view = {};
  var changedEvent;

  vm.fullModalReset = fullModalReset;
  vm.getEventStyle = getEventStyle;
  vm.getEventDate = getEventDate;

  fullModalReset();

  function resetView () {
  }
  function resetData () {
    vm.data.event = null;
    vm.data.interviewers = null;
    vm.data.interviewersHash = null;
    changedEvent = false;
  }
  function fullModalReset () {
    if (changedEvent) {
      var notes = {
        event: vm.data.event,
        interviewersHash: vm.data.interviewersHash,
      };
      $rootScope.$broadcast('aggregatedEventNotesChanged', notes);
    }
    resetData();
    resetView();
  }

  function getEventDate (date) {
    return moment(date).format('MMM D');
  }

  function getEventStyle (style, substyle) {
    if (style) {
      var str = style.toLowerCase();
      if (substyle) {
        str = substyle.toLowerCase() + ' ' + str;
      }
      return str;
    }
  }

  function updateInterviewer (interviewer) {
    var id = interviewer.interviewer.id;
    if (vm.data.interviewersHash[id]) {
      if (interviewer.is_poc) {
        vm.data.interviewersHash[id].is_poc = true;
      }
    } else {
      vm.data.interviewersHash[id] = interviewer.interviewer;
      vm.data.interviewersHash[id].is_poc = interviewer.is_poc;
      vm.data.interviewers.push(vm.data.interviewersHash[id]);
    }
  }

  var eventCleanupFunc = $rootScope.$on('settingCurrentlySelectedEvent', function () {
    var event = currentlySelectedEvent.get();
    vm.data.event = event;
    vm.data.interviewers = [];
    vm.data.interviewersHash = {};
    _.each(event.interviewers, function (interviewer) {
      updateInterviewer(interviewer);
    });
    _.each(event.interactions, function (interaction) {
      _.each(interaction.interviewers, function (interviewer) {
        updateInterviewer(interviewer);
      });
    });
  });

  var eventNotesCleanupFunc = $rootScope.$on('eventNotesChanged', function () {
    changedEvent = true;
  });

  var cardCleanupFunc = $rootScope.$on('updatingCard', function () {
    vm.data.opportunity = selectedCardData.get();
  });
  var oppCleanupFunc = $rootScope.$on('currentOpportunityUpdatedBySystem', function () {
    vm.data.opportunity = opportunityDetails.get();
  });

  $scope.$on('$destroy', function() {
    eventCleanupFunc();
    eventNotesCleanupFunc();
    oppCleanupFunc();
    cardCleanupFunc();
  });

}
})();
