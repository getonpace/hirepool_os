(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AdminOverviewEventsCtrl', AdminOverviewEventsCtrl);

AdminOverviewEventsCtrl.$inject = ['$http', '$rootScope', '$scope', '_', 'userProperties', 'moment', 'highchartsHelper', 'namingHelpers'];
function AdminOverviewEventsCtrl ($http, $rootScope, $scope, _, userProperties, moment, highchartsHelper, namingHelpers) {
  var vm = this;

  vm.data = {};
  vm.view = {};
  vm.view.timeframe = 30;
  vm.view.pickerId = 'admin-overview-events';

  vm.data.eventsTable = {
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
        name: 'style',
        title: 'Event Style',
      },
      {
        name: 'substyle',
        title: 'Event Substyle',
      },
      {
        name: 'detail_level',
        title: 'Detail Level',
        hide: true,
      },
      {
        name: 'has_feedback',
        title: 'Feedback',
        type: 'boolean',
        hide: true,
      },
      {
        name: 'events_count',
        title: 'Events',
        type: 'numeric',
        hover: 'Count of events at this aggregated level',
        tdClasses: ['hp-sortable-table-left-border'],
        thClasses: ['hp-sortable-table-left-border'],
      },
      {
        name: 'future_events_count',
        title: 'In Future',
        type: 'numeric',
        hover: 'Count of events at this aggregated level which are scheduled to occur in the future',
      },
      {
        name: 'average_rating',
        title: 'Avg Rating',
        type: 'numeric',
        displayParser: 'setFloat2',
        hover: 'Average rating of all events with any feedback at this aggregated level',
      },
      {
        name: 'average_participants',
        title: 'Avg Participants',
        type: 'numeric',
        displayParser: 'setFloat2',
        hover: 'Average number of participants per event at this aggregated level',
      },
      {
        name: 'feedback_percent',
        title: 'Has Feedback',
        type: 'numeric',
        displayParser: 'setPercent0',
        hover: 'Percent of events with feedback of all events that occurred in the past this level',
      },
      {
        name: 'poc_level_percent',
        title: 'POC Level',
        type: 'numeric',
        displayParser: 'setPercent0',
        hover: 'Percent of events where user entered data only at the POC level',
        hide: true,
      },
      {
        name: 'multi_participant_level_percent',
        title: 'Participants Level',
        type: 'numeric',
        displayParser: 'setPercent0',
        hover: 'Percent of events where user entered data at the multiple participants level',
        hide: true,
      },
      {
        name: 'multi_interaction_level_percent',
        title: 'Interaction Level',
        type: 'numeric',
        displayParser: 'setPercent0',
        hover: 'Percent of events where user entered data at the multiple interactions level',
        hide: true,
      },
    ]
  };

  vm.view.filterOptions = {
    company: { attr: 'company', title: 'Company', set: true },
    job_title: { attr: 'job_title', title: 'Job Title', set: false },
    role: { attr: 'role', title: 'Role', set: false },
    source: { attr: 'source', title: 'Source', set: false },
    style: { attr: 'style', title: 'Style', set: false },
    substyle: { attr: 'substyle', title: 'Substyle', set: false },
  };
  if (userIsHirepoolAdmin()) {
    vm.view.filterOptions.detail_level = { attr: 'detail_level', title: 'Detail Level', set: false };
    vm.view.filterOptions.has_feedback = { attr: 'has_feedback', title: 'Has Feedback', set: false };
  }

  vm.showLoading = showLoading;
  vm.setRows = setRows;
  vm.getCsvFileName = namingHelpers.adminCsvNamer;

  function showLoading () {
    return (vm.view.fetchingData || vm.view.massagingData);
  }

  function userIsHirepoolAdmin () {
    return userProperties.isHirepoolAdmin();
  }

  function getEvents (timeframe) {
    if (timeframe) {
      vm.view.timeframe = timeframe;
    }
    vm.view.fetchingData = true;
    console.log('getting events: ' + moment().format('HH:mm:ss.SSS'));
    $http({
      method: 'GET',
      url: '/api/events/overview/' + vm.view.timeframe,
    }).then(function successCallback (resp) {
      console.log('got events: ' + moment().format('HH:mm:ss.SSS'));
      vm.view.massagingData = true;
      vm.view.fetchingData = false;
      vm.data.events = resp.data.events;
      console.log('setting events row data: ' + moment().format('HH:mm:ss.SSS'));
      setRows();
      console.log('set events row data: ' + moment().format('HH:mm:ss.SSS'));
      console.log('drawing events graph: ' + moment().format('HH:mm:ss.SSS'));
      redrawGraph();
      console.log('drew events graph: ' + moment().format('HH:mm:ss.SSS'));
    }, function errorCallback () {
      vm.view.fetchingData = false;
    });
  }

  function setRows () {
    vm.view.massagingData = true;
    var dataGroups;
    var fo = vm.view.filterOptions;
    if (fo.company.set) {
      vm.data.eventsTable.fields[0].hide = false;
    } else {
      vm.data.eventsTable.fields[0].hide = true;
    }
    if (fo.job_title.set) {
      vm.data.eventsTable.fields[1].hide = false;
    } else {
      vm.data.eventsTable.fields[1].hide = true;
    }
    if (fo.role.set) {
      vm.data.eventsTable.fields[2].hide = false;
    } else {
      vm.data.eventsTable.fields[2].hide = true;
    }
    if (fo.source.set) {
      vm.data.eventsTable.fields[3].hide = false;
    } else {
      vm.data.eventsTable.fields[3].hide = true;
    }
    if (fo.style.set) {
      vm.data.eventsTable.fields[4].hide = false;
    } else {
      vm.data.eventsTable.fields[4].hide = true;
    }
    if (fo.substyle.set) {
      vm.data.eventsTable.fields[5].hide = false;
    } else {
      vm.data.eventsTable.fields[5].hide = true;
    }
    if (fo.detail_level && fo.detail_level.set) {
      vm.data.eventsTable.fields[6].hide = false;
    } else {
      vm.data.eventsTable.fields[6].hide = true;
    }
    if (fo.has_feedback && fo.has_feedback.set) {
      vm.data.eventsTable.fields[7].hide = false;
    } else {
      vm.data.eventsTable.fields[7].hide = true;
    }
    if (fo.company.set || fo.job_title.set || fo.role.set || fo.source.set || fo.style.set || fo.substyle.set || fo.detail_level.set || fo.has_feedback.set) {
      dataGroups = {};
      _.each(vm.data.events, function (event) {
        var id = '';
        if (fo.company.set) {
          id = event.interview.company;
        }
        if (fo.job_title.set) {
          id = id + '-' + event.interview.job_title;
        }
        if (fo.role.set) {
          id = id + '-' + event.interview.role;
        }
        if (fo.source.set) {
          id = id + '-' + event.interview.source;
        }
        if (fo.style.set) {
          id = id + '-' + event.style;
        }
        if (fo.substyle.set) {
          id = id + '-' + event.substyle;
        }
        if (fo.detail_level && fo.detail_level.set) {
          id = id + '-' + event.detail_level;
        }
        if (fo.has_feedback && fo.has_feedback.set) {
          id = id + '-' + event.has_feedback;
        }
        if (id) {
          if (dataGroups[id]) {
            var dg = dataGroups[id];
            dg.events_count = dg.events_count + 1;
            if (event.date && moment(event.date).isAfter()) {
              dg.future_events_count = dg.future_events_count + 1;
            }
            dg.participants_count = dg.participants_count + event.participants;
            if (event.has_feedback) {
              dg.feedback_count = dg.feedback_count + 1;
            }
            if (event.detail_level === 'poc-level') {
              dg.poc_level_count = dg.poc_level_count + 1;
            }
            if (event.detail_level === 'participants-level') {
              dg.multi_participant_level_count = dg.multi_participant_level_count + 1;
            }
            if (event.detail_level === 'interaction-level') {
              dg.multi_interaction_level_count = dg.multi_interaction_level_count + 1;
            }
          } else {
            dataGroups[id] = {
              company: event.interview.company,
              job_title: event.interview.job_title,
              role: event.interview.role,
              source: event.interview.source,
              style: event.style,
              substyle: event.substyle,
              detail_level: event.detail_level,
              has_feedback: event.has_feedback,
              events_count: 1,
              future_events_count: event.date ? (moment(event.date).isAfter() ? 1 : 0) : 0,
              participants_count: event.participants,
              feedback_count: event.has_feedback ? 1 : 0,
              poc_level_count: event.detail_level === 'poc-level' ? 1 : 0,
              multi_participant_level_count: event.detail_level === 'participants-level' ? 1 : 0,
              multi_interaction_level_count: event.detail_level === 'interaction-level' ? 1 : 0,
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
      vm.data.eventsTable.rows = [];
      _.each(dataGroups, function (dg) {
        vm.data.eventsTable.rows.push({
          company: dg.company,
          job_title: dg.job_title,
          role: dg.role,
          source: dg.source,
          style: dg.style,
          substyle: dg.substyle,
          detail_level: dg.detail_level,
          has_feedback: dg.has_feedback,
          events_count: dg.events_count,
          future_events_count: dg.future_events_count,
          average_participants: dg.events_count ? dg.participants_count / dg.events_count : '',
          feedback_percent: dg.events_count ? dg.feedback_count / dg.events_count : '',
          poc_level_percent: dg.events_count ? dg.poc_level_count / dg.events_count : '',
          multi_participant_level_percent: dg.events_count ? dg.multi_participant_level_count / dg.events_count : '',
          multi_interaction_level_percent: dg.events_count ? dg.multi_interaction_level_count / dg.events_count : '',
        });
      });
      vm.view.hideTable = false;
    }
    vm.view.massagingData = false;
  }

  function redrawGraph () {
    highchartsHelper.drawAdminOverviewGraph(vm.data.events, vm.view.timeframe, 'Events Created');
  }

  var showEventsTabCleanupFunc = $rootScope.$on('admin-overview-show-tab-events', function () {
    if (!vm.view.fetchingData && !vm.data.events) {
      getEvents();
    } else {
      redrawGraph();
    }
  });
  var timeframeUpdatedCleanupFunc = $rootScope.$on('hp-timeframe-picker-udpate-' + vm.view.pickerId, function (event, timeframe) {
    getEvents(timeframe);
  });

  $scope.$on('destroy', function () {
    showEventsTabCleanupFunc();
    timeframeUpdatedCleanupFunc();
  });

}

})();
