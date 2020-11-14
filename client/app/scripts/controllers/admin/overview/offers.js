(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AdminOverviewOffersCtrl', AdminOverviewOffersCtrl);

AdminOverviewOffersCtrl.$inject = ['$http', '$rootScope', '$scope', '_', 'highchartsHelper', 'moment', 'namingHelpers'];
function AdminOverviewOffersCtrl ($http, $rootScope, $scope, _, highchartsHelper, moment, namingHelpers) {
  var vm = this;

  vm.data = {};
  vm.view = {};
  vm.view.timeframe = 30;
  vm.view.pickerId = 'admin-overview-offers';

  vm.data.offersTable = {
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
        name: 'offers_count',
        title: 'Offers',
        type: 'numeric',
        hover: 'Count of offers generated at this aggregated level',
        tdClasses: ['hp-sortable-table-left-border'],
        thClasses: ['hp-sortable-table-left-border'],
      },
      {
        name: 'accepted_rate',
        title: 'Accepted',
        type: 'numeric',
        displayParser: 'setPercent0',
        hover: 'Percent of offers accepted at this aggregated level',
      },
      {
        name: 'average_base_salary',
        title: 'Avg Base Salary',
        type: 'numeric',
        displayParser: 'setDollars',
        hover: 'Average base salary offered at this aggregated level',
      },
      {
        name: 'average_total_comp',
        title: 'Avg Total Comp',
        type: 'numeric',
        displayParser: 'setDollars',
        hover: 'Average total target compensation offered at this aggregated level',
      },
      {
        name: 'average_base_salary_accepted',
        title: 'Avg Accepted Base Salary',
        type: 'numeric',
        displayParser: 'setDollars',
        hover: 'Average base salary for accepted offers at this aggregated level',
      },
      {
        name: 'average_total_comp_accepted',
        title: 'Avg Accepted Total Comp',
        type: 'numeric',
        displayParser: 'setDollars',
        hover: 'Average total target compensation for accepted offers at this aggregated level',
      },
    ]
  };

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

  function getOffers (timeframe) {
    if (timeframe) {
      vm.view.timeframe = timeframe;
    }
    vm.view.fetchingData = true;
    console.log('getting offers: ' + moment().format('HH:mm:ss.SSS'));
    $http({
      method: 'GET',
      url: '/api/offers/overview/' + vm.view.timeframe,
    }).then(function successCallback (resp) {
      console.log('got offers: ' + moment().format('HH:mm:ss.SSS'));
      vm.view.massagingData = true;
      vm.view.fetchingData = false;
      vm.data.offers = resp.data.offers;
      console.log('setting offers row data: ' + moment().format('HH:mm:ss.SSS'));
      setRows();
      console.log('set offers row data: ' + moment().format('HH:mm:ss.SSS'));
      console.log('drawing offers graph: ' + moment().format('HH:mm:ss.SSS'));
      redrawGraph();
      console.log('drew offers graph: ' + moment().format('HH:mm:ss.SSS'));
    }, function errorCallback () {
      vm.view.fetchingData = false;
    });
  }

  function setRows () {
    vm.view.massagingData = true;
    var dataGroups;
    var fo = vm.view.filterOptions;
    if (fo.company.set) {
      vm.data.offersTable.fields[0].hide = false;
    } else {
      vm.data.offersTable.fields[0].hide = true;
    }
    if (fo.job_title.set) {
      vm.data.offersTable.fields[1].hide = false;
    } else {
      vm.data.offersTable.fields[1].hide = true;
    }
    if (fo.role.set) {
      vm.data.offersTable.fields[2].hide = false;
    } else {
      vm.data.offersTable.fields[2].hide = true;
    }
    if (fo.source.set) {
      vm.data.offersTable.fields[3].hide = false;
    } else {
      vm.data.offersTable.fields[3].hide = true;
    }
    if (fo.company.set || fo.job_title.set || fo.role.set || fo.source.set) {
      dataGroups = {};
      _.each(vm.data.offers, function (offer) {
        var id = '';
        if (fo.company.set) {
          id = offer.interview.company;
        }
        if (fo.job_title.set) {
          id = id + '-' + offer.interview.job_title;
        }
        if (fo.role.set) {
          id = id + '-' + offer.interview.role;
        }
        if (fo.source.set) {
          id = id + '-' + offer.interview.source;
        }
        if (id) {
          if (dataGroups[id]) {
            var dg = dataGroups[id];
            dg.offers_count = dg.offers_count + 1;
            dg.total_base_salary = dg.total_base_salary + offer.base_salary;
            if (offer.status && offer.status.toLowerCase() === 'accepted') {
              dg.accepted_offers_count = dg.accepted_offers_count + 1;
              dg.accepted_total_base_salary = dg.accepted_total_base_salary + offer.base_salary;
              if (offer.total_target_compensation) {
                dg.accepted_offers_with_total_comp = dg.accepted_offers_with_total_comp + 1;
                dg.accepted_total_target_compensation = dg.accepted_total_target_compensation + offer.total_target_compensation;
              }
            }
            if (offer.total_target_compensation) {
              dg.offers_with_total_comp = dg.offers_with_total_comp + 1;
              dg.total_target_compensation = dg.total_target_compensation + offer.total_target_compensation;
            }
          } else {
            dataGroups[id] = {
              company: offer.interview.company,
              job_title: offer.interview.job_title,
              role: offer.interview.role,
              source: offer.interview.source,
              offers_count: 1,
              accepted_offers_count: (offer.status && offer.status.toLowerCase() === 'accepted') ? 1 : 0,
              offers_with_total_comp: offer.total_target_compensation ? 1 : 0,
              accepted_offers_with_total_comp: (offer.status && offer.status.toLowerCase() === 'accepted' && offer.total_target_compensation) ? 1 : 0,
              total_base_salary: offer.base_salary,
              total_target_compensation: offer.total_target_compensation ? offer.total_target_compensation : 0,
              accepted_total_base_salary: (offer.status && offer.status.toLowerCase() === 'accepted') ? offer.base_salary : 0,
              accepted_total_target_compensation: (offer.status && offer.status.toLowerCase() === 'accepted' && offer.total_target_compensation) ? offer.total_target_compensation : 0,
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
      vm.data.offersTable.rows = [];
      _.each(dataGroups, function (dg) {
        vm.data.offersTable.rows.push({
          company: dg.company,
          job_title: dg.job_title,
          role: dg.role,
          source: dg.source,
          email: dg.email,
          name: dg.name,
          offers_count: dg.offers_count,
          accepted_rate: dg.offers_count ? dg.accepted_offers_count / dg.offers_count : '',
          average_base_salary: dg.offers_count ? dg.total_base_salary / dg.offers_count : '',
          average_total_comp: dg.offers_count ? dg.total_target_compensation / dg.offers_count : '',
          average_base_salary_accepted: dg.accepted_offers_count ? dg.accepted_total_base_salary / dg.accepted_offers_count : '',
          average_total_comp_accepted: dg.accepted_offers_count ? dg.accepted_total_target_compensation / dg.accepted_offers_count : '',
        });
      });
      vm.view.hideTable = false;
    }
    vm.view.massagingData = false;
  }

  function redrawGraph () {
    highchartsHelper.drawAdminOverviewGraph(vm.data.offers, vm.view.timeframe, 'Offers Generated');
  }

  var showOffersTabCleanupFunc = $rootScope.$on('admin-overview-show-tab-offers', function () {
    if (!vm.view.fetchingData && !vm.data.offers) {
      getOffers();
    } else {
      redrawGraph();
    }
  });
  var timeframeUpdatedCleanupFunc = $rootScope.$on('hp-timeframe-picker-udpate-' + vm.view.pickerId, function (event, timeframe) {
    getOffers(timeframe);
  });

  $scope.$on('destroy', function () {
    showOffersTabCleanupFunc();
    timeframeUpdatedCleanupFunc();
  });

}

})();
