(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpOpportunityActionsCell', hpOpportunityActionsCell);

function hpOpportunityActionsCell() {
  var directive = {
    templateUrl: 'views/directives/opportunity_actions_cell.html',
    restrict: 'EA',
    scope: {
      opportunity: '='
    },
    link: linkFunc,
    controller: HpOpportunityActionsCellController,
    controllerAs: 'vm',
    bindToController: true
  };
  return directive;

  function linkFunc(/*scope, element, attrs*/) {
    /* */
  }
}

HpOpportunityActionsCellController.$inject = ['companyCompare', 'selectedCardData', '$rootScope', 'eventRecorder', 'opportunitiesData', '$http'];
function HpOpportunityActionsCellController (companyCompare, selectedCardData, $rootScope, eventRecorder, opportunitiesData, $http) {
  var vm = this;
  vm.data = {};

  vm.setSelected = setSelected;
  vm.compareCompanyDisabled = compareCompanyDisabled;
  vm.broadcastCurrentOpportunity = broadcastCurrentOpportunity;
  vm.toggleArchived = toggleArchived;
  vm.togglePinned = togglePinned;
  vm.openGuideModal = openGuideModal;
  vm.openAddEventFodal = openAddEventFodal;

  function openAddEventFodal () {
    broadcastCurrentOpportunity();
    window.openModal('add-event-and-opportunity-fodal');
  }

  function openGuideModal () {
    broadcastCurrentOpportunity();
    $rootScope.$broadcast('openGuide', 'selectedCardData');
    eventRecorder.trackEvent('open-guide-modal');
  }

  function togglePinned (pinned) {
    var oldPinned = vm.opportunity.pinned;
    vm.opportunity.pinned = pinned;

    // TODO when we fix notes in opportunity details, remove the
    // need to GET /api/interviews/notes/
    $http({
      method: 'GET',
      url: '/api/interviews/notes/' + vm.opportunity.id
    }).then(function successCallback (response) {
      vm.opportunity.notes = response.data.notes;
      $http({
        method: 'PUT',
        url: '/api/interviews/' + vm.opportunity.id,
        data: vm.opportunity,
      }).then(function successCallback () {
        vm.opportunity.loading = false;
        $rootScope.$broadcast('updatingPinned', vm.opportunity.id, vm.opportunity.pinned);
      }, function errorCallback () {
        vm.opportunity.loading = false;
        vm.opportunity.pinned = oldPinned;
      });
    }, function errorCallback () {
    });
  }
  function toggleArchived (archived) {
    var oldArchived = vm.opportunity.archived;
    vm.opportunity.archived = archived;

    // TODO when we fix notes in opportunity details, remove the
    // need to GET /api/interviews/notes/
    $http({
      method: 'GET',
      url: '/api/interviews/notes/' + vm.opportunity.id
    }).then(function successCallback (response) {
      vm.opportunity.notes = response.data.notes;
      $http({
        method: 'PUT',
        url: '/api/interviews/' + vm.opportunity.id,
        data: vm.opportunity,
      }).then(function successCallback () {
        $rootScope.$broadcast('updatingArchived', vm.opportunity.id, vm.opportunity.archived);
      }, function errorCallback () {
        vm.opportunity.archived = oldArchived;
      });
    }, function errorCallback () {
    });
  }
  function compareCompanyDisabled () {
    if (!vm.opportunity.selected && companyCompare.count() >= 3) {
      return true;
    }
    return false;
  }
  function setSelected (selected) {
    if (selected) {
      if (!compareCompanyDisabled()) {
        vm.opportunity.selected = selected;
        companyCompare.addCompany(vm.opportunity.id, vm.opportunity);
      }
    } else {
      vm.opportunity.selected = selected;
      companyCompare.removeCompany(vm.opportunity.id);
    }
  }
  function broadcastCurrentOpportunity () {
    var card = opportunitiesData.getOpp(vm.opportunity.id).data;
    selectedCardData.set(card);
    $rootScope.$broadcast('updatingCard');
  }

}

})();
