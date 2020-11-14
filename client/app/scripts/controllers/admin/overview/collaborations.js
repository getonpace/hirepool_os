(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AdminOverviewCollaborationsCtrl', AdminOverviewCollaborationsCtrl);

AdminOverviewCollaborationsCtrl.$inject = ['$http', '$rootScope', '$scope', '_', 'moment', 'highchartsHelper', 'namingHelpers'];
function AdminOverviewCollaborationsCtrl ($http, $rootScope, $scope, _, moment, highchartsHelper, namingHelpers) {
  var vm = this;

  vm.data = {};
  vm.view = {};
  vm.view.timeframe = 30;
  vm.view.pickerId = 'admin-overview-collaborations';

  vm.data.collaborationsTable = {
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
        name: 'email',
        title: 'Email',
      },
      {
        name: 'name',
        title: 'Name',
      },
      {
        name: 'collaborations_count',
        title: 'Requests',
        type: 'numeric',
        hover: 'Count of collaborations requested at this aggregated level',
        tdClasses: ['hp-sortable-table-left-border'],
        thClasses: ['hp-sortable-table-left-border'],
      },
      {
        name: 'collaborations_with_response_count',
        title: 'Responses',
        type: 'numeric',
        hover: 'Count of collaborations responded to at this aggregated level',
      },
      {
        name: 'unique_collaborators_count',
        title: 'Collaborators',
        type: 'numeric',
        hover: 'Count of unique collaborators (by email) at this aggregated level',
      },
      {
        name: 'response_rate',
        title: 'Response Rate',
        type: 'numeric',
        displayParser: 'setPercent0',
        hover: 'Percent of collaborator requests with responses at this aggregated level',
      },
      {
        name: 'average_wait_time',
        title: 'Avg Wait',
        type: 'numeric',
        displayParser: 'setFloat2',
        hover: 'Average number of days between collaboration request and response at this aggregated level',
      },
      {
        name: 'average_rating',
        title: 'Avg Rating',
        type: 'numeric',
        displayParser: 'setFloat2',
        hover: 'Average rating by collaborators who have responded at this aggregated level',
      },
    ]
  };

  vm.view.filterOptions = {
    company: { attr: 'company', title: 'Company', set: true },
    job_title: { attr: 'job_title', title: 'Job Title', set: false },
    role: { attr: 'role', title: 'Role', set: false },
    source: { attr: 'source', title: 'Source', set: false },
    email: { attr: 'email', title: 'Email', set: false },
    name: { attr: 'name', title: 'Name', set: false },
  };

  vm.showLoading = showLoading;
  vm.setRows = setRows;
  vm.getCsvFileName = namingHelpers.adminCsvNamer;

  function showLoading () {
    return (vm.view.fetchingData || vm.view.massagingData);
  }

  function getCollaborations (timeframe) {
    if (timeframe) {
      vm.view.timeframe = timeframe;
    }
    vm.view.fetchingData = true;
    console.log('getting collaborations: ' + moment().format('HH:mm:ss.SSS'));
    $http({
      method: 'GET',
      url: '/api/collaborator_feedback/overview/' + vm.view.timeframe,
    }).then(function successCallback (resp) {
      console.log('got collaborations: ' + moment().format('HH:mm:ss.SSS'));
      vm.view.massagingData = true;
      vm.view.fetchingData = false;
      vm.data.collaborations = resp.data.collaborations;
      console.log('setting collaborations row data: ' + moment().format('HH:mm:ss.SSS'));
      setRows();
      console.log('set collaborations row data: ' + moment().format('HH:mm:ss.SSS'));
      console.log('drawing collaborations graph: ' + moment().format('HH:mm:ss.SSS'));
      redrawGraph();
      console.log('drew collaborations graph: ' + moment().format('HH:mm:ss.SSS'));
    }, function errorCallback () {
      vm.view.fetchingData = false;
    });
  }

  function setRows () {
    vm.view.massagingData = true;
    var dataGroups;
    var fo = vm.view.filterOptions;
    if (fo.company.set) {
      vm.data.collaborationsTable.fields[0].hide = false;
    } else {
      vm.data.collaborationsTable.fields[0].hide = true;
    }
    if (fo.job_title.set) {
      vm.data.collaborationsTable.fields[1].hide = false;
    } else {
      vm.data.collaborationsTable.fields[1].hide = true;
    }
    if (fo.role.set) {
      vm.data.collaborationsTable.fields[2].hide = false;
    } else {
      vm.data.collaborationsTable.fields[2].hide = true;
    }
    if (fo.source.set) {
      vm.data.collaborationsTable.fields[3].hide = false;
    } else {
      vm.data.collaborationsTable.fields[3].hide = true;
    }
    if (fo.email.set) {
      vm.data.collaborationsTable.fields[4].hide = false;
    } else {
      vm.data.collaborationsTable.fields[4].hide = true;
    }
    if (fo.name.set) {
      vm.data.collaborationsTable.fields[5].hide = false;
    } else {
      vm.data.collaborationsTable.fields[5].hide = true;
    }
    if (fo.company.set || fo.job_title.set || fo.role.set || fo.source.set || fo.email.set || fo.name.set) {
      dataGroups = {};
      _.each(vm.data.collaborations, function (collaboration) {
        var id = '';
        if (fo.company.set) {
          id = collaboration.interview.company;
        }
        if (fo.job_title.set) {
          id = id + '-' + collaboration.interview.job_title;
        }
        if (fo.role.set) {
          id = id + '-' + collaboration.interview.role;
        }
        if (fo.source.set) {
          id = id + '-' + collaboration.interview.source;
        }
        if (fo.email.set) {
          id = id + '-' + collaboration.collaborator.email;
        }
        if (fo.name.set) {
          id = id + '-' + collaboration.collaborator.name;
        }
        if (id) {
          if (dataGroups[id]) {
            var dg = dataGroups[id];
            dg.collaborations_count = dg.collaborations_count + 1;
            dg.unique_collaborations_by_email[collaboration.email] = true;
            if (collaboration.rating) {
              dg.collaborations_with_response_count = dg.collaborations_with_response_count + 1;
              dg.total_rating = dg.total_rating + collaboration.rating;
            }
            if (collaboration.date_asked && collaboration.date_completed) {
              dg.total_response_time = dg.total_response_time + moment(collaboration.date_completed).diff(moment(collaboration.date_asked), 'days');
            }
          } else {
            dataGroups[id] = {
              company: collaboration.interview.company,
              job_title: collaboration.interview.job_title,
              role: collaboration.interview.role,
              source: collaboration.interview.source,
              email: collaboration.collaborator.email,
              name: collaboration.collaborator.name,
              collaborations_count: 1,
              collaborations_with_response_count: collaboration.rating ? 1 : 0,
              total_rating: collaboration.rating ? collaboration.rating : 0,
              total_response_time: (collaboration.date_asked && collaboration.date_completed) ? moment(collaboration.date_completed).diff(moment(collaboration.date_asked), 'days') : 0,
              unique_collaborations_by_email: {},
            };
            dataGroups[id].unique_collaborations_by_email[collaboration.email] = true;
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
      vm.data.collaborationsTable.rows = [];
      _.each(dataGroups, function (dg) {
        vm.data.collaborationsTable.rows.push({
          company: dg.company,
          job_title: dg.job_title,
          role: dg.role,
          source: dg.source,
          email: dg.email,
          name: dg.name,
          collaborations_count: dg.collaborations_count,
          unique_collaborators_count: _.size(dg.unique_collaborations_by_email),
          collaborations_with_response_count: dg.collaborations_with_response_count,
          response_rate: dg.collaborations_count ? dg.collaborations_with_response_count / dg.collaborations_count : '',
          average_wait_time: dg.collaborations_with_response_count ? dg.total_response_time / dg.collaborations_with_response_count : '',
          average_rating: dg.collaborations_with_response_count ? dg.total_rating / dg.collaborations_with_response_count : '',
        });
      });
      vm.view.hideTable = false;
    }
    vm.view.massagingData = false;
  }

  function redrawGraph () {
    highchartsHelper.drawAdminOverviewGraph(vm.data.collaborations, vm.view.timeframe, 'Collaborations Requested');
  }

  var showCollaborationsTabCleanupFunc = $rootScope.$on('admin-overview-show-tab-collaborations', function () {
    if (!vm.view.fetchingData && !vm.data.collaborations) {
      getCollaborations();
    } else {
      redrawGraph();
    }
  });
  var timeframeUpdatedCleanupFunc = $rootScope.$on('hp-timeframe-picker-udpate-' + vm.view.pickerId, function (event, timeframe) {
    getCollaborations(timeframe);
  });

  $scope.$on('destroy', function () {
    showCollaborationsTabCleanupFunc();
    timeframeUpdatedCleanupFunc();
  });

}

})();
