(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpActivityFeed', hpActivityFeed);

hpActivityFeed.$inject = ['$timeout'];
function hpActivityFeed ($timeout) {
  var directive = {
    templateUrl: 'views/directives/activity_feed.html',
    restrict: 'EA',
    scope: {
      userId: '='
    },
    link: linkFunc,
    controller: HpActivityFeedController,
    controllerAs: 'vm',
    bindToController: true
  };
  return directive;

  function linkFunc(scope, element/*, attrs*/) {
    element.on('$destroy', function () {
      if (scope.vm && scope.vm.recentUserActionsTimer) {
        $timeout.cancel(scope.vm.recentUserActionsTimer);
      }
    });
  }
}

HpActivityFeedController.$inject = ['moment', '$http', '$timeout', '$rootScope'];
function HpActivityFeedController (moment, $http, $timeout, $rootScope) {
  var vm = this;
  vm.data = {};
  vm.data.days = {};
  vm.data.users = {};
  vm.data.opps = {};

  vm.getDate = getDate;
  vm.getToday = getToday;
  vm.getYesterday = getYesterday;
  vm.getActionDescription = getActionDescription;
  vm.getOppDescription = getOppDescription;
  vm.showOppDetails = showOppDetails;

  function showOppDetails (event) {
    if (event && event.interviews && event.interviews.length === 1) {
      $rootScope.$broadcast('admin-show-opp-details', event.interviews[0].id);
    }
  }

  function getActionDescription (event) {
    var sort_param;
    var action = vm.data.actions.find(function (action) { return action.id === event.action_id; });
    if (event.sort_param_id) {
      sort_param = vm.data.sort_params.find(function (sort_param) { return sort_param.id === event.sort_param_id; });
    }
    var description = getObjectDescriptionOrName(action);
    if (action.name === 'load-page') {
      var page = vm.data.pages.find(function (page) { return page.id === event.page_id; });
      if (page) {
        description = description + ' ' + getObjectDescriptionOrName(page) + ' page';
      }
    } else if (action.name === 'open-modal') {
      var modal = vm.data.modals.find(function (modal) { return modal.id === event.modal_id; });
      if (modal) {
        description = description + ' ' + getObjectDescriptionOrName(modal) + ' modal';
      }
    } else {
      if (sort_param) {
        description = description + ' on ' + getObjectDescriptionOrName(sort_param);
      }
    }
    return description;
  }
  function getObjectDescriptionOrName (obj) {
    return obj.description ? obj.description : obj.name;
  }

  function getOppDescription (event) {
    var description = '';
    if (event.interviews && event.interviews.length) {
      var interviews = event.interviews.reduce(function (previous, interview) {
        if (interview.company && interview.company.name) {
          if (previous) {
            return previous + ' ' + interview.company.name;
          } else {
            return interview.company.name;
          }
        } else {
          return previous;
        }
      }, '');
      if (interviews) {
        description = description + 'for ' + interviews;
      }
    }
    return description;
  }

  function getDate (dateString) {
    return moment(dateString).format('h:mma');
  }

  function getToday () {
    return moment(new Date()).format('ddd, MMM Do');
  }

  function getYesterday () {
    return moment(new Date().getTime() - (1000*60*60*24)).format('ddd, MMM Do');
  }

  var userIndex = 0;
  var oppIndex = 0;
  var url = '/api/user_actions';
  if (vm.userId) {
    url = url + '/user/' + vm.userId;
  }
  $http({
    method: 'GET',
    url: url
  }).then(function successCallback (resp) {
    vm.data.events = resp.data.user_actions;
    vm.data.actions = resp.data.actions;
    vm.data.pages = resp.data.pages;
    vm.data.modals = resp.data.modals;
    vm.data.sort_params = resp.data.sort_params;
    splitEventsIntoDays();
    vm.recentUserActionsTimer = $timeout(updateUserActions, 1000 * 120);
  }, function errorCallback () {
  });

  function setDay (event, isUpdate) {
    var date = moment(event.created_at).format('ddd, MMM Do');
    if (vm.data.days[date]) {
      if (isUpdate) {
        vm.data.days[date].unshift(event);
      } else {
        vm.data.days[date].push(event);
      }
    } else {
      vm.data.days[date] = [event];
    }
  }

  function setEventByOpp (event, lastEvent) {
    var oppId = 'none';
    if (event.interviews && event.interviews.length === 1) {
      oppId = event.interviews[0].id;
    }
    if (!vm.data.opps[oppId]) {
      oppIndex++;
      if (oppId === 'none') {
        vm.data.opps[oppId] = {};
        event.color = '#e6e6e6';
      } else {
        vm.data.opps[oppId] = event.interviews[0];
        event.color = getColor(oppIndex);
      }
      vm.data.opps[oppId].color = event.color;
      if (lastEvent) {
        event.position = getPositionByOpp(lastEvent.position);
      } else {
        event.position = 'left';
      }
      vm.data.opps[oppId].position = event.position;
      event.oppIndex = oppIndex;
      vm.data.opps[oppId].oppIndex = oppIndex;
    } else {
      event.position = vm.data.opps[oppId].position;
      event.color = vm.data.opps[oppId].color;
      event.oppIndex = vm.data.opps[oppId].oppIndex;
    }
  }
  function setUser (event, lastEvent) {
    if (!vm.data.users[event.user_id]) {
      userIndex++;
      vm.data.users[event.user_id] = event.user;
      vm.data.users[event.user_id].color = getColor(userIndex);
      if (lastEvent) {
        vm.data.users[event.user_id].position = getPosition(lastEvent.user_id);
      } else {
        vm.data.users[event.user_id].position = 'left';
      }
      vm.data.users[event.user_id].index = userIndex;
    }
  }
  function getColor (index) {
    var colors = [
      '#d83939', // 1  red
      '#7e57c2', // 4  purple
      '#1ba9db', // 7  dark teal
      '#66bb6a', // 10 light green
      '#ffca28', // 13 light orange
      '#ff1744', // 16 vibrant pink
      '#2962ff', // 19 dark sky blue
      '#ec407a', // 2  pink
      '#5c6bc0', // 5  perriwinkle
      '#26c6da', // 8  teal
      '#d4e157', // 11 yellow green
      '#ff9800', // 14 orange
      '#c51162', // 17 magenta?
      '#0091ea', // 20 sky blue
      '#ab47bc', // 3  light purple
      '#4351b5', // 6  dark purple
      '#26a69a', // 9  bluish green
      '#ffee58', // 12 yellow
      '#ff5722', // 15 dark orange
      '#551fea', // 18 purpleish blue
    ];
/*
    var colors = [
      '#009fd4', // blue 1
      '#b381b3', // purple 1
      '#00a566', // green 6
      '#e76e3c', // red 1
      '#939393', // grey 1
      '#aa8f00', // yellow 1
      '#6d8891', // blue last
      '#f62459', // purple last
      '#6b8e23', // green last
      '#dc143c', // red last
      '#545454', // grey last
      '#554800' // yellow last
    ];
*/
    index = (index - 1) % colors.length;
    return colors[index];
  }
  function getPosition (lastEventUserId) {
    var lastPosition = vm.data.users[lastEventUserId].position;
    if (lastPosition === 'left') {
      return 'right';
    }
    return 'left';
  }
  function getPositionByOpp (lastPosition) {
    if (lastPosition === 'left') {
      return 'right';
    }
    return 'left';
  }

  function splitEventsIntoDays () {
    var lastEvent;
    vm.data.events.forEach(function (event) {
      setDay(event);
      if (vm.userId) {
        setEventByOpp(event, lastEvent);
      } else {
        setUser(event, lastEvent);
      }
      lastEvent = event;
    });
  }

  function updateUserActions () {
    var url = '/api/user_actions/recent';
    if (vm.userId) {
      url = url + '/user/' + vm.userId;
    }
    $http({
      method: 'GET',
      url: url
    }).then(function successCallback (resp) {
      vm.data.actions = resp.data.actions;
      vm.data.pages = resp.data.pages;
      vm.data.modals = resp.data.modals;
      vm.data.sort_params = resp.data.sort_params;
      addNewEvents(resp.data.user_actions);
      vm.recentUserActionsTimer = $timeout(updateUserActions, 1000 * 120);
    }, function errorCallback () {
    });
  }

  function addNewEvents(events) {
    var lastEvent = vm.data.events[0];
    events.forEach(function (event) {
      var eventExists = vm.data.events.find(function (oldEvent) { return oldEvent.id === event.id; });
      if (!eventExists) {
        setDay(event, true);
        if (vm.userId) {
          setEventByOpp(event, lastEvent);
        } else {
          setUser(event, lastEvent);
        }
        vm.data.events.unshift(event);
        lastEvent = event;
      }
    });
  }

}

})();