(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AdminOverviewInterviewersCtrl', AdminOverviewInterviewersCtrl);

AdminOverviewInterviewersCtrl.$inject = ['$http', '$rootScope', '$scope', '_', 'highchartsHelper', 'moment', 'namingHelpers'];
function AdminOverviewInterviewersCtrl ($http, $rootScope, $scope, _, highchartsHelper, moment, namingHelpers) {
  var vm = this;

  vm.data = {};
  vm.view = {};
  vm.view.timeframe = 30;
  vm.view.pickerId = 'admin-overview-interviewers';

  vm.data.interviewersTable = {
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
        name: 'relationship',
        title: 'Relationship',
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
        name: 'interviewers_count',
        title: 'Interviewers',
        type: 'numeric',
        hover: 'Count of interviewers at this aggregated level',
        tdClasses: ['hp-sortable-table-left-border'],
        thClasses: ['hp-sortable-table-left-border'],
      },
      {
        name: 'unique_interviewers_by_name_count',
        title: 'Interviewers (by name)',
        type: 'numeric',
        hover: 'Count of unique interviewers by name at this aggregated level',
      },
      {
        name: 'unique_interviewers_by_email_count',
        title: 'Interviewers (by email)',
        type: 'numeric',
        hover: 'Count of unique interviewers by email at this aggregated level',
      },
      {
        name: 'interviewers_with_email_count',
        title: 'Interviewers (with email)',
        type: 'numeric',
        hover: 'Count of interviewers with emails at this aggregated level',
      },
      {
        name: 'average_excited_rating',
        title: 'Avg Excited',
        type: 'numeric',
        displayParser: 'setFloat2',
        hover: 'Average "excited" rating of all interviewers with any feedback at this aggregated level',
      },
      {
        name: 'average_culture_rating',
        title: 'Avg Cultural',
        type: 'numeric',
        displayParser: 'setFloat2',
        hover: 'Average "culture value" rating of all interviewers with any feedback at this aggregated level',
      },
    ]
  };

  vm.view.filterOptions = {
    company: { attr: 'company', title: 'Company', set: true },
    job_title: { attr: 'job_title', title: 'Job Title', set: false },
    role: { attr: 'role', title: 'Role', set: false },
    source: { attr: 'source', title: 'Source', set: false },
    relationship: { attr: 'relationship', title: 'Relationship', set: false },
    email: { attr: 'email', title: 'Email', set: false },
    name: { attr: 'name', title: 'Name', set: false },
  };

  vm.showLoading = showLoading;
  vm.setRows = setRows;
  vm.getCsvFileName = namingHelpers.adminCsvNamer;

  function showLoading () {
    return (vm.view.fetchingData || vm.view.massagingData);
  }

  function getInterviewers (timeframe) {
    if (timeframe) {
      vm.view.timeframe = timeframe;
    }
    vm.view.fetchingData = true;
    console.log('getting interviewers: ' + moment().format('HH:mm:ss.SSS'));
    $http({
      method: 'GET',
      url: '/api/interviewers/overview/' + vm.view.timeframe,
    }).then(function successCallback (resp) {
      console.log('got interviewers: ' + moment().format('HH:mm:ss.SSS'));
      vm.view.massagingData = true;
      vm.view.fetchingData = false;
      console.log('merging and sorting interviewers: ' + moment().format('HH:mm:ss.SSS'));
      vm.data.interviewers = resp.data.event_interviewers.concat(resp.data.interaction_interviewers);
      vm.data.interviewers = vm.data.interviewers.sort(function (a, b) {
        if (moment(a.created_at).isBefore(b.created_at)) {
          return 1;
        }
        return -1;
      });
      console.log('merged and sorted interviewers: ' + moment().format('HH:mm:ss.SSS'));
      console.log('setting interviewers row data: ' + moment().format('HH:mm:ss.SSS'));
      setRows();
      console.log('set interviewers row data: ' + moment().format('HH:mm:ss.SSS'));
      console.log('drawing interviewers graph: ' + moment().format('HH:mm:ss.SSS'));
      redrawGraph();
      console.log('drew interviewers graph: ' + moment().format('HH:mm:ss.SSS'));
    }, function errorCallback () {
      vm.view.fetchingData = false;
    });
  }

  function setRows () {
    vm.view.massagingData = true;
    var dataGroups;
    var fo = vm.view.filterOptions;
    if (fo.company.set) {
      vm.data.interviewersTable.fields[0].hide = false;
    } else {
      vm.data.interviewersTable.fields[0].hide = true;
    }
    if (fo.job_title.set) {
      vm.data.interviewersTable.fields[1].hide = false;
    } else {
      vm.data.interviewersTable.fields[1].hide = true;
    }
    if (fo.role.set) {
      vm.data.interviewersTable.fields[2].hide = false;
    } else {
      vm.data.interviewersTable.fields[2].hide = true;
    }
    if (fo.source.set) {
      vm.data.interviewersTable.fields[3].hide = false;
    } else {
      vm.data.interviewersTable.fields[3].hide = true;
    }
    if (fo.relationship.set) {
      vm.data.interviewersTable.fields[4].hide = false;
    } else {
      vm.data.interviewersTable.fields[4].hide = true;
    }
    if (fo.email.set) {
      vm.data.interviewersTable.fields[5].hide = false;
    } else {
      vm.data.interviewersTable.fields[5].hide = true;
    }
    if (fo.name.set) {
      vm.data.interviewersTable.fields[6].hide = false;
    } else {
      vm.data.interviewersTable.fields[6].hide = true;
    }
    if (fo.company.set || fo.job_title.set || fo.role.set || fo.source.set || fo.relationship.set || fo.email.set || fo.name.set) {
      dataGroups = {};
      _.each(vm.data.interviewers, function (interviewer) {
        var id = '';
        if (fo.company.set) {
          id = interviewer.interview.company;
        }
        if (fo.job_title.set) {
          id = id + '-' + interviewer.interview.job_title;
        }
        if (fo.role.set) {
          id = id + '-' + interviewer.interview.role;
        }
        if (fo.source.set) {
          id = id + '-' + interviewer.interview.source;
        }
        if (fo.relationship.set) {
          id = id + '-' + interviewer.detail_level;
        }
        if (fo.email.set) {
          id = id + '-' + interviewer.email;
        }
        if (fo.name.set) {
          id = id + '-' + interviewer.name;
        }
        if (id) {
          if (dataGroups[id]) {
            var dg = dataGroups[id];
            dg.interviewers_count = dg.interviewers_count + 1;
            if (interviewer.email) {
              dg.interviewers_with_email_count = dg.interviewers_with_email_count + 1;
            }
            if (interviewer.excited) {
              dg.interviewers_with_excited_count = dg.interviewers_with_excited_count + 1;
              dg.total_excited_rating = dg.total_excited_rating + interviewer.excited;
            }
            if (interviewer.culture_val) {
              dg.interviewers_with_culture_count = dg.interviewers_with_culture_count + 1;
              dg.total_culture_rating = dg.total_culture_rating + interviewer.culture_val;
            }
            dg.unique_interviewers_by_email[interviewer.email] = true;
            dg.unique_interviewers_by_name[interviewer.name] = true;
          } else {
            dataGroups[id] = {
              company: interviewer.interview.company,
              job_title: interviewer.interview.job_title,
              role: interviewer.interview.role,
              source: interviewer.interview.source,
              relationship: interviewer.relationship,
              email: interviewer.email,
              name: interviewer.name,
              interviewers_count: 1,
              interviewers_with_email_count: interviewer.email ? 1 : 0,
              unique_interviewers_by_email: {},
              unique_interviewers_by_name: {},
              total_excited_rating: interviewer.excited ? interviewer.excited : 0,
              interviewers_with_excited_count: interviewer.excited ? 1 : 0,
              total_culture_rating: interviewer.culture_val ? interviewer.culture_val : 0,
              interviewers_with_culture_count: interviewer.culture_val ? 1 : 0,
            };
            dataGroups[id].unique_interviewers_by_email[interviewer.email] = true;
            dataGroups[id].unique_interviewers_by_name[interviewer.name] = true;
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
      vm.data.interviewersTable.rows = [];
      _.each(dataGroups, function (dg) {
        vm.data.interviewersTable.rows.push({
          company: dg.company,
          job_title: dg.job_title,
          role: dg.role,
          source: dg.source,
          relationship: dg.relationship,
          email: dg.email,
          name: dg.name,
          interviewers_count: dg.interviewers_count,
          interviewers_with_email_count: dg.interviewers_with_email_count,
          average_excited_rating: dg.interviewers_with_excited_count ? dg.total_excited_rating / dg.interviewers_with_excited_count : '',
          average_culture_rating: dg.interviewers_with_culture_count ? dg.total_culture_rating / dg.interviewers_with_culture_count : '',
          unique_interviewers_by_email_count: _.size(dg.unique_interviewers_by_email),
          unique_interviewers_by_name_count: _.size(dg.unique_interviewers_by_name),
        });
      });
      vm.view.hideTable = false;
    }
    vm.view.massagingData = false;
  }

  function redrawGraph () {
    highchartsHelper.drawAdminOverviewGraph(vm.data.interviewers, vm.view.timeframe, 'Interviewers Added');
  }

  var showInterviewersTabCleanupFunc = $rootScope.$on('admin-overview-show-tab-interviewers', function () {
    if (!vm.view.fetchingData && !vm.data.interviewers) {
      getInterviewers();
    } else {
      redrawGraph();
    }
  });
  var timeframeUpdatedCleanupFunc = $rootScope.$on('hp-timeframe-picker-udpate-' + vm.view.pickerId, function (event, timeframe) {
    getInterviewers(timeframe);
  });

  $scope.$on('destroy', function () {
    showInterviewersTabCleanupFunc();
    timeframeUpdatedCleanupFunc();
  });

}

})();
