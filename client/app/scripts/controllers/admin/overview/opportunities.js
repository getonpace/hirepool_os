(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AdminOverviewOpportunitiesCtrl', AdminOverviewOpportunitiesCtrl);

AdminOverviewOpportunitiesCtrl.$inject = ['$http', '$rootScope', '$scope', '_', 'highchartsHelper', 'moment', 'namingHelpers'];
function AdminOverviewOpportunitiesCtrl ($http, $rootScope, $scope, _, highchartsHelper, moment, namingHelpers) {
  var vm = this;

  vm.data = {};
  vm.view = {};

  vm.data.opportunitiesTable = {
    fields: [
      {
        name: 'company',
        title: 'Company Name',
      },
      {
        name: 'job_title',
        title: 'Job Title',
      },
      {
        name: 'role',
        title: 'Opp Role',
      },
      {
        name: 'source',
        title: 'Opp Source',
      },
      {
        name: 'opp_count',
        title: 'Opps',
        type: 'numeric',
        hover: 'Count of opportunities at this aggregated level',
        tdClasses: ['hp-sortable-table-left-border'],
        thClasses: ['hp-sortable-table-left-border'],
      },
      {
        name: 'average_rating',
        title: 'Rating',
        type: 'numeric',
        displayParser: 'setFloat2',
        hover: 'Average rating of all opportunities with any feedback at this aggregated level',
        hide: true,
      },
      {
        name: 'offers_percent',
        title: 'Offers',
        type: 'numeric',
        displayParser: 'setPercent0',
        hover: 'Percent of opportunities at this aggregated level that generate offers',
      },
      {
        name: 'offers_accepted_percent',
        title: 'Accepted',
        type: 'numeric',
        displayParser: 'setPercent0',
        hover: 'Percent of offers at this aggregated level which are accepted',
      },
      {
        name: 'average_days',
        title: 'Days',
        type: 'numeric',
        displayParser: 'setInt',
        hover: 'Average length of process for all opportunities at this aggregated level, from first interview to last',
      },
      {
        name: 'average_days_to_offer',
        title: 'Days to Offer',
        type: 'numeric',
        displayParser: 'setInt',
        hover: 'Average length of process for opportunities at this level that generated an offer, from first interview to offer',
      },
      {
        name: 'average_events',
        title: 'Events',
        type: 'numeric',
        displayParser: 'setFloat2',
        hover: 'Average number of events for all opportunities with at least one event aggregated at this level',
      },
      {
        name: 'average_events_to_offer',
        title: 'Events to Offer',
        type: 'numeric',
        displayParser: 'setFloat2',
        hover: 'Average number of events for all opportunties at the level that generated an offer, from first even to offer',
      },
    ]
  };

  vm.view.timeframe = 30;
  vm.view.pickerId = 'admin-overview-opportunities';
  vm.view.filterOptions = {
    company: { attr: 'company', title: 'Company', set: true },
    job_title: { attr: 'job_title', title: 'Job Title', set: false },
    role: { attr: 'role', title: 'Role', set: false },
    source: { attr: 'source', title: 'Source', set: false },
  };

  vm.showLoading = showLoading;
  vm.setRows = setRows;
  vm.getCsvFileName = namingHelpers.adminCsvNamer;

  function showLoading () {
    return (vm.view.fetchingData || vm.view.massagingData);
  }

  function getOpportunities (timeframe) {
    if (timeframe) {
      vm.view.timeframe = timeframe;
    }
    vm.view.fetchingData = true;
    console.log('getting opportunities: ' + moment().format('HH:mm:ss.SSS'));
    $http({
      method: 'GET',
      url: '/api/interviews/overview/' + vm.view.timeframe,
    }).then(function successCallback (resp) {
      console.log('got opportunities: ' + moment().format('HH:mm:ss.SSS'));
      vm.view.massagingData = true;
      vm.view.fetchingData = false;
      vm.data.opportunities = resp.data.interviews;
      console.log('setting opportunities row data: ' + moment().format('HH:mm:ss.SSS'));
      setRows();
      console.log('set opportunities row data: ' + moment().format('HH:mm:ss.SSS'));
      console.log('drawing opportunities graph: ' + moment().format('HH:mm:ss.SSS'));
      redrawGraph();
      console.log('drew opportunities graph: ' + moment().format('HH:mm:ss.SSS'));
    }, function errorCallback () {
      vm.view.fetchingData = false;
    });
  }

  function setRows () {
    vm.view.massagingData = true;
    var dataGroups;
    var fo = vm.view.filterOptions;
    if (fo.company.set) {
      vm.data.opportunitiesTable.fields[0].hide = false;
    } else {
      vm.data.opportunitiesTable.fields[0].hide = true;
    }
    if (fo.job_title.set) {
      vm.data.opportunitiesTable.fields[1].hide = false;
    } else {
      vm.data.opportunitiesTable.fields[1].hide = true;
    }
    if (fo.role.set) {
      vm.data.opportunitiesTable.fields[2].hide = false;
    } else {
      vm.data.opportunitiesTable.fields[2].hide = true;
    }
    if (fo.source.set) {
      vm.data.opportunitiesTable.fields[3].hide = false;
    } else {
      vm.data.opportunitiesTable.fields[3].hide = true;
    }
    if (fo.company.set || fo.job_title.set || fo.role.set || fo.source.set) {
      dataGroups = {};
      _.each(vm.data.opportunities, function (opp) {
        var id = '';
        if (fo.company.set) {
          id = opp.company;
        }
        if (fo.job_title.set) {
          id = id + '-' + opp.job_title;
        }
        if (fo.role.set) {
          id = id + '-' + opp.role;
        }
        if (fo.source.set) {
          id = id + '-' + opp.source;
        }
        if (id) {
          if (dataGroups[id]) {
            var dg = dataGroups[id];
            dg.opp_count = dg.opp_count + 1;
            if (opp.offer_status) {
              dg.offers_count = dg.offers_count + 1;
            }
            if (opp.offer_status === 'accepted') {
              dg.offers_accepted_count = dg.offers_accepted_count + 1;
            }
            if (opp.total_days) {
              dg.total_days = dg.total_days + opp.total_days;
              dg.total_days_opp_counter = dg.total_days_opp_counter + 1;
              if (opp.offer_status) {
                dg.total_days_to_offer = dg.total_days_to_offer + opp.total_days;
                dg.total_days_to_offer_opp_counter = dg.total_days_to_offer_opp_counter + 1;
              }
            }
            if (opp.events_count) {
              dg.total_events = dg.total_events + opp.events_count;
              dg.total_events_opp_counter = dg.total_events_opp_counter + 1;
              if (opp.offer_status) {
                dg.total_events_to_offer = dg.total_events_to_offer + opp.events_count;
                dg.total_events_to_offer_opp_counter = dg.total_events_to_offer_opp_counter + 1;
              }
            }
          } else {
            dataGroups[id] = {
              company: opp.company,
              job_title: opp.job_title,
              role: opp.role,
              source: opp.source,
              opp_count: 1,
              offers_count: opp.offer_status ? 1 : 0,
              offers_accepted_count: opp.offer_stats === 'accepted' ? 1 : 0,
              total_days: opp.total_days,
              total_days_opp_counter: opp.total_days ? 1 : 0,
              total_days_to_offer: opp.offer_status ? opp.total_days : 0,
              total_days_to_offer_opp_counter: opp.offer_status && opp.total_days ? 1 : 0,
              total_events: opp.events_count,
              total_events_opp_counter: opp.events_count ? 1 : 0,
              total_events_to_offer: opp.offer_status ? opp.events_count : 0,
              total_events_to_offer_opp_counter: opp.offer_status && opp.events_count ? 1 : 0,
            };
          }
        }
      });
    }
    var size = _.size(dataGroups);
    if (!dataGroups) {
      vm.view.hideTable = 'no_filter';
    } else if (size < 1) {
      vm.view.hideTable = 'no_data';
    } else if (size >= 1) {
      vm.data.opportunitiesTable.rows = [];
      _.each(dataGroups, function (dg) {
        vm.data.opportunitiesTable.rows.push({
          company: dg.company,
          job_title: dg.job_title,
          role: dg.role,
          source: dg.source,
          opp_count: dg.opp_count,
          offers_percent: dg.opp_count ? dg.offers_count / dg.opp_count : '',
          offers_accepted_percent: dg.offers_count ? dg.offers_accepted_count / dg.offers_count : '',
          average_days: dg.total_days_opp_counter ? dg.total_days / dg.total_days_opp_counter : '',
          average_days_to_offer: dg.total_days_to_offer_opp_counter ? dg.total_days_to_offer / dg.total_days_to_offer_opp_counter : '',
          average_events: dg.total_events_opp_counter ? dg.total_events / dg.total_events_opp_counter : '',
          average_events_to_offer: dg.total_events_to_offer_opp_counter ? dg.total_events_to_offer / dg.total_events_to_offer_opp_counter : '',
        });
      });
      vm.view.hideTable = false;
    }
    vm.view.massagingData = false;
  }

  function redrawGraph () {
    highchartsHelper.drawAdminOverviewGraph(vm.data.opportunities, vm.view.timeframe, 'Opportunities Created');
  }

  var showOpportunitiesTabCleanupFunc = $rootScope.$on('admin-overview-show-tab-opportunities', function () {
    if (!vm.view.fetchingData && !vm.data.opportunities) {
      getOpportunities();
    } else {
      redrawGraph();
    }
  });
  var timeframeUpdatedCleanupFunc = $rootScope.$on('hp-timeframe-picker-udpate-' + vm.view.pickerId, function (event, timeframe) {
    getOpportunities(timeframe);
  });

  $scope.$on('destroy', function () {
    showOpportunitiesTabCleanupFunc();
    timeframeUpdatedCleanupFunc();
  });

}

})();
