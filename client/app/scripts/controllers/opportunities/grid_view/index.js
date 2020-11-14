(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('GridViewIndexCtrl', GridViewIndexCtrl);

GridViewIndexCtrl.$inject = ['eventRecorder', '_', 'companyCompare', '$rootScope', '$scope', 'scoreHelpers', 'moment', 'opportunityHelpers'];
function GridViewIndexCtrl (eventRecorder, _, companyCompare, $rootScope, $scope, scoreHelpers, moment, opportunityHelpers) {
  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'grid-view'
  });
  eventRecorder.trackEvent('load-opportunities-grid-page');

  var vm = this;

  vm.data = {};
  vm.view = {};
  vm.data.gridData = {
    rows: [],
    fields: [
      {
        name: 'actions',
        title: 'Actions',
        type: 'opportunity_actions',
        tdClasses: ['actions-cell'],
        thClasses: ['actions-cell'],
      },
      {
        name: 'rating',
        title: 'Rating',
        type: 'opportunity_grid_rating',
        sort_type: 'numeric',
      },
      {
        name: 'company_name',
        title: 'Company',
      },
      {
        name: 'job_title_for_link',
        title: 'Job Title',
        type: 'link',
        link_key: 'opportunity_details_url',
      },
      {
        name: 'status',
        title: 'Status',
      },
      {
        name: 'applied_on',
        title: 'Applied On',
        type: 'date',
        parser: 'getAbbrevDate',
      },
      {
        name: 'job_url',
        title: 'Job URL',
        type: 'external_link',
        link_key: 'job_url',
      },
      {
        name: 'next_event_at',
        title: 'Next Event',
        type: 'date',
        parser: 'getAbbrevDate',
      },
      {
        name: 'last_event_at',
        title: 'Last Event',
        type: 'date',
        parser: 'getAbbrevDate',
      },
      {
        name: 'source',
        title: 'Source',
        tdClasses: ['source-cell'],
        thClasses: ['source-cell'],
      },
      {
        name: 'location',
        title: 'Location',
        tdClasses: ['location-cell'],
        thClasses: ['location-cell'],
      },
      {
        name: 'offer_salary',
        title: 'Offer',
        type: 'opportunity_grid_offer',
        sort_type: 'numeric',
      },
      {
        name: 'updated_at',
        title: 'Last Edited',
        type: 'date',
        parser: 'getAbbrevDate',
      },
    ]
  };

  vm.openAddEventFodal = openAddEventFodal;
  vm.setupOppForGrid = setupOppForGrid;

  function openAddEventFodal () {
    $rootScope.$broadcast('reset-add-event-and-opportunity-fodal');
    window.openModal('add-event-and-opportunity-fodal');
  }

  function setupOppForGrid (opportunityContainer) {
    var opportunity = opportunityContainer.data;
    opportunity.gdData = opportunityContainer.gdData;
    opportunity.cbData = opportunityContainer.cbData;

    if (companyCompare.getCompaniesToCompare()[opportunity.id]) {
      opportunity.selected = true;
    }
    opportunity.opportunity_details_url = '#/opportunity/' + opportunity.id;
    if (opportunity.company && opportunity.company.name) {
      opportunity.company_name = opportunity.company.name;
    }
    opportunity.job_title_for_link = opportunity.job_title || '<UNKNOWN>';
    opportunity.status = opportunityHelpers.getStatus(opportunity);

    var last = '';
    var next = '';
    if (opportunity.events && opportunity.events.length) {
      var now = moment();
      _.each(opportunity.events, function (event) {
        if (event.date) {
          var evDate = moment(event.date);
          if (evDate.isBefore(now)) {
            if (last) {
              if (evDate.isBetween(moment(last), now)) {
                last = event.date;
              }
            } else {
              last = event.date;
            }
          } else {
            if (next) {
              if (evDate.isBetween(now, moment(next))) {
                next = event.date;
              }
            } else {
              next = event.date;
            }
          }
        }
      });
    }
    opportunity.next_event_at = next;
    opportunity.last_event_at = last;

    if (opportunity.offer && opportunity.offer.base_salary) {
      opportunity.offer_salary = opportunity.offer.base_salary;
    }

    var rating = scoreHelpers.getScore(opportunity);
    if (rating !== '-') {
      opportunity.rating = rating;
    }
    return opportunity;
  }

  var showComparisonViewCleanupFunc = $rootScope.$on('showComparisonView', function () {
    vm.view.showComparisonView = true;
  });
  var hideComparisonViewCleanupFunc = $rootScope.$on('hideComparisonView', function () {
    vm.view.showComparisonView = false;
  });
  $scope.$on('$destroy', function() {
    showComparisonViewCleanupFunc();
    hideComparisonViewCleanupFunc();
  });
}
})();
