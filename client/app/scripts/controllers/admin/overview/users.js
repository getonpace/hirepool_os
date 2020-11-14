(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AdminOverviewUsersCtrl', AdminOverviewUsersCtrl);

AdminOverviewUsersCtrl.$inject = ['$http', '$rootScope', '$scope', 'userProperties', 'highchartsHelper', 'moment', '_', 'namingHelpers'];
function AdminOverviewUsersCtrl ($http, $rootScope, $scope, userProperties, highchartsHelper, moment, _, namingHelpers) {
  var vm = this;

  vm.data = {};
  vm.view = {};
  vm.filter = {
    val: '',
  };

  vm.data.usersTable = {
    fields: [
      {
        name: 'name',
        title: 'User Name',
        type: 'user_profile_link',
      },
      {
        name: 'email',
        title: 'Email Address',
      },
      {
        name: 'days_active',
        title: 'Days Active',
        type: 'numeric',
      },
      {
        name: 'created_at',
        title: 'Registered',
        type: 'date',
        parser: 'getAbbrevDate',
      },
      {
        name: 'updated_at',
        title: 'Last Login',
        type: 'date',
        parser: 'getAbbrevDate',
      },
      {
        name: 'access_group_title',
        title: 'Access Group',
      },
      {
        name: 'user_tracking_tags',
        title: 'User Tracking Tags',
        parser: 'joinUserTrackingTags',
      },
      {
        name: 'opportunities_count',
        title: 'Opportunities',
        type: 'numeric',
      },
      {
        name: 'events_count',
        title: 'Events',
        type: 'numeric',
      },
      {
        name: 'offers_count',
        title: 'Offers',
        type: 'numeric',
      },
      {
        name: 'user_actions_count',
        title: 'Total Actions',
        type: 'numeric',
      },
    ]
  };
  if (userIsHirepoolAdmin()) {
    vm.data.usersTable.fields.push(
      {
        name: 'sponsor',
        title: 'Sponsor',
      },
      {
        name: 'user_agreement_status',
        title: 'User Agreement',
      },
      {
        name: 'saw_user_agreement_at',
        title: 'Saw Agreement',
        type: 'date',
        parser: 'getAbbrevDate',
      },
      {
        name: 'provider',
        title: 'Login Method',
      },
      {
        name: 'is_admin',
        title: 'Admin',
        type: 'boolean',
      },
      {
        name: 'payments_last_paid_at',
        title: 'Last Paid On',
        type: 'date',
        parser: 'getAbbrevDate',
      },
      {
        name: 'payments_last_paid_amount',
        title: 'Last Paid Amount',
        type: 'numeric',
        parser: 'setPenniesToDollars',
      },
      {
        name: 'payments_subscription_renewal_date',
        title: 'Renews On',
        type: 'date',
        parser: 'getAbbrevDate',
      },
      {
        name: 'payments_total_paid_amount',
        title: 'Total Paid Amount',
        type: 'numeric',
        parser: 'setPenniesToDollars',
      },
      {
        name: 'payments_total_payments_made',
        title: 'Total Payments',
        type: 'numeric',
      }
    );
  }
  vm.data.usersTable.fields.push(
    {
      name: 'users_count',
      title: 'Users',
      type: 'numeric',
      hide: true,
      tdClasses: ['hp-sortable-table-left-border'],
      thClasses: ['hp-sortable-table-left-border'],
      groupField: true,
    },
    {
      name: 'avg_days_active',
      title: 'Avg Days Active',
      type: 'numeric',
      displayParser: 'setFloat2',
      hide: true,
      groupField: true,
    },
    {
      name: 'avg_opps_count',
      title: 'Avg Opportunities',
      type: 'numeric',
      displayParser: 'setFloat2',
      hide: true,
      groupField: true,
    },
    {
      name: 'avg_events_count',
      title: 'Avg Events',
      type: 'numeric',
      displayParser: 'setFloat2',
      hide: true,
      groupField: true,
    },
    {
      name: 'avg_offers_count',
      title: 'Avg Offers',
      type: 'numeric',
      displayParser: 'setFloat2',
      hide: true,
      groupField: true,
    },
    {
      name: 'avg_actions_count',
      title: 'Avg Total Actions',
      type: 'numeric',
      displayParser: 'setFloat2',
      hide: true,
      groupField: true,
    }
  );
  if (userIsHirepoolAdmin()) {
    vm.data.usersTable.fields.push(
      {
        name: 'total_dollars_paid',
        title: 'Total Dollars Paid',
        type: 'numeric',
        displayParser: 'setPenniesToDollars',
        hide: true,
        groupField: true,
      },
      {
        name: 'avg_dollars_paid',
        title: 'Avg Dollars Paid',
        type: 'numeric',
        displayParser: 'setPenniesToDollars',
        hide: true,
        groupField: true,
      },
      {
        name: 'total_payments_made',
        title: 'Total Payments Made',
        type: 'numeric',
        hide: true,
        groupField: true,
      },
      {
        name: 'avg_payments_made',
        title: 'Avg Payments Made',
        type: 'numeric',
        displayParser: 'setFloat2',
        hide: true,
        groupField: true,
      }
    );
  }
  vm.view.timeframe = 30;
  vm.view.pickerId = 'admin-overview-users';
  getUsers();

  vm.view.filterOptions = {
    access_group_title: { attr: 'access_group_title', title: 'Access Group', set: false },
  };
  if (userIsHirepoolAdmin()) {
    vm.view.filterOptions.sponsor = { attr: 'sponsor', title: 'Sponsor', set: false };
  }

  vm.showLoading = showLoading;
  vm.setRows = setRows;
  vm.getCsvFileName = namingHelpers.adminCsvNamer;
  vm.runDataFilter = runDataFilter;
  vm.disableFilter = disableFilter;
  vm.resetFilter = resetFilter;

  function runDataFilter (searchString) {
    if (searchString) {
      var usersToFilter = vm.data.allUsers;
      vm.data.users = _.filter(usersToFilter, function (user) {
        return (user.name && user.name.toLowerCase().search(searchString.toLowerCase()) !== -1) || (user.email && user.email.toLowerCase().search(searchString.toLowerCase()) !== -1) || (user.sponsor && user.sponsor.toLowerCase().search(searchString.toLowerCase()) !== -1) || (user.access_group_title && user.access_group_title.toLowerCase().search(searchString.toLowerCase()) !== -1);
      });
    } else {
      vm.data.users = vm.data.allUsers;
    }
    setRows();
  }

  function disableFilter () {
    if (vm.data.allUsers && vm.data.allUsers.length === 0) {
      return true;
    }
    return false;
  }

  function resetFilter () {
    vm.filter.val = '';
    runDataFilter(vm.filter.val);
  }

  function showLoading () {
    return (vm.view.fetchingData || vm.view.massagingData);
  }

  function userIsHirepoolAdmin () {
    return userProperties.isHirepoolAdmin();
  }

  function getUsers (timeframe) {
    if (timeframe) {
      vm.view.timeframe = timeframe;
    }
    vm.view.fetchingData = true;
    console.log('getting users: ' + moment().format('HH:mm:ss.SSS'));
    $http({
      method: 'GET',
      url: '/api/users/overview/' + vm.view.timeframe,
    }).then(function successCallback (resp) {
      console.log('got users: ' + moment().format('HH:mm:ss.SSS'));
      vm.view.massagingData = true;
      vm.view.fetchingData = false;
      vm.data.users = resp.data.users;
      vm.data.allUsers = _.cloneDeep(vm.data.users);
      console.log('setting users row data: ' + moment().format('HH:mm:ss.SSS'));
      setRows();
      console.log('set users row data: ' + moment().format('HH:mm:ss.SSS'));
      console.log('drawing users graph: ' + moment().format('HH:mm:ss.SSS'));
      redrawGraph();
      console.log('drew users graph: ' + moment().format('HH:mm:ss.SSS'));
    }, function errorCallback () {
      vm.view.fetchingData = false;
    });
  }

  function setRows () {
    vm.view.massagingData = true;
    var dataGroups;
    var fo = vm.view.filterOptions;
    if (fo.access_group_title.set || (fo.sponsor && fo.sponsor.set) ) {
      setFieldsToHide('individual');
      if (fo.access_group_title.set) {
        vm.data.usersTable.fields[5].hide = false;
      } else {
        vm.data.usersTable.fields[5].hide = true;
      }
      if (fo.sponsor && fo.sponsor.set) {
        vm.data.usersTable.fields[11].hide = false;
      } else {
        vm.data.usersTable.fields[11].hide = true;
      }
      dataGroups = {};
      _.each(vm.data.users, function (user) {
        var id = '';
        if (fo.access_group_title.set) {
          id = user.access_group_title || 'XXAAXX-CUSTOM-ID-NO-ACCESS-GROUP-TITLE';
        }
        if (fo.sponsor.set) {
          id = id + '-' + (user.sponsor || 'XXAAXX-CUSTOM-ID-NO-SPONSOR');
        }
        if (id) {
          if (dataGroups[id]) {
            var dg = dataGroups[id];
            dg.users_count = dg.users_count + 1;
            dg.total_days = dg.total_days + user.days_active;
            dg.total_opps = dg.total_opps + user.opportunities_count;
            dg.total_events = dg.total_events + user.events_count;
            dg.total_offers = dg.total_offers + user.offers_count;
            dg.total_actions = dg.total_actions + user.user_actions_count;
            if (userIsHirepoolAdmin()) {
              dg.total_dollars_paid = dg.total_dollars_paid + user.payments_total_paid_amount;
              dg.total_payments_made = dg.total_payments_made + user.payments_total_payments_made;
            }
          } else {
            dataGroups[id] = {
              access_group_title: user.access_group_title,
              sponsor: user.sponsor,
              users_count: 1,
              total_days: user.days_active || 0,
              total_opps: user.opportunities_count || 0,
              total_events: user.events_count || 0,
              total_offers: user.offers_count || 0,
              total_actions: user.user_actions_count || 0,
            };
            if (userIsHirepoolAdmin()) {
              dataGroups[id].total_dollars_paid = user.payments_total_paid_amount || 0;
              dataGroups[id].total_payments_made = user.payments_total_payments_made || 0;
            }
          }
        }
      });
    } else {
      setFieldsToHide('group');
    }
    var size;
    if (dataGroups) {
      size = _.size(dataGroups);
      if (size < 1) {
        vm.view.hideTable = 'no_data';
      } else {
        vm.data.usersTable.rows = [];
        _.each(dataGroups, function (dg) {
          var rowToPush = {
            access_group_title: dg.access_group_title,
            sponsor: dg.sponsor,
            users_count: dg.users_count,
            avg_days_active: dg.users_count ? dg.total_days / dg.users_count : '',
            avg_opps_count: dg.users_count ? dg.total_opps / dg.users_count : '',
            avg_events_count: dg.users_count ? dg.total_events / dg.users_count : '',
            avg_offers_count: dg.users_count ? dg.total_offers / dg.users_count : '',
            avg_actions_count: dg.users_count ? dg.total_actions / dg.users_count : '',
          };
          if (userIsHirepoolAdmin()) {
            rowToPush.total_dollars_paid = dg.total_dollars_paid;
            rowToPush.avg_dollars_paid = dg.users_count ? dg.total_dollars_paid / dg.users_count : '';
            rowToPush.total_payments_made = dg.total_payments_made;
            rowToPush.avg_payments_made = dg.users_count ? dg.total_payments_made / dg.users_count : '';
          }
          vm.data.usersTable.rows.push(rowToPush);
        });
        vm.view.hideTable = false;
      }
    } else {
      size = vm.data.users.length;
      if (size < 1) {
        vm.view.hideTable = 'no_data';
      } else {
        vm.data.usersTable.rows = vm.data.users;
        vm.view.hideTable = false;
      }
    }
    vm.view.massagingData = false;
  }

  function setFieldsToHide (type) {
    var hideGroupFields = false;
    if (type === 'group') {
      hideGroupFields = true;
    }
    vm.data.usersTable.fields.forEach(function (field) {
      if (field.groupField) {
        field.hide = hideGroupFields;
      } else {
        field.hide = !hideGroupFields;
      }
    });
  }

  function redrawGraph () {
    highchartsHelper.drawAdminOverviewGraph(vm.data.users, vm.view.timeframe, 'User Signups');
  }

  var showUsersTabCleanupFunc = $rootScope.$on('admin-overview-show-tab-users', function () {
    if (!vm.view.fetchingData && !vm.data.users) {
      getUsers();
    } else {
      redrawGraph();
    }
  });
  var timeframeUpdatedCleanupFunc = $rootScope.$on('hp-timeframe-picker-udpate-' + vm.view.pickerId, function (event, timeframe) {
    getUsers(timeframe);
  });

  $scope.$on('destroy', function () {
    showUsersTabCleanupFunc();
    timeframeUpdatedCleanupFunc();
  });

}

})();
