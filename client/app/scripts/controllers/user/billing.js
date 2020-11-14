(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('BillingCtrl', BillingCtrl);

BillingCtrl.$inject = ['userProperties', 'eventRecorder', '$rootScope', '$scope', '$http', 'moment', '_'];
function BillingCtrl (userProperties, eventRecorder, $rootScope, $scope, $http, moment, _) {
  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'billing'
  });

  var vm = this;
  var handler;
  vm.data = {};
  vm.data.user = userProperties.get();
  vm.view = {};

  vm.data.accountHistoryTableData = {
    fields: [
      {
        name: 'actionName',
        title: 'Action',
      },
      {
        name: 'actionDatetime',
        type: 'numeric',
        sortType: 'numeric',
        hide: true,
      },
      {
        name: 'actionDate',
        title: 'Date',
        type: 'date',
      },
      {
        name: 'actionDetails',
        title: 'Details',
      },
    ],
    rows: [],
  };

  vm.getAccountStatus = getAccountStatus;
  vm.getUpgradeLinkText = getUpgradeLinkText;
  vm.isPremium = isPremium;
  vm.getFormattedNextPaymentDate = getFormattedNextPaymentDate;
  vm.upgradeOrDowngrade = upgradeOrDowngrade;
  vm.updatePaymentDetails = updatePaymentDetails;

  function updatePaymentDetails () {
    eventRecorder.trackEvent({
      action: 'update_payment_details',
      page: 'billing',
    });
    handler.open({
      name: 'HIREPOOL INC',
      description: 'update payment details',
      amount: 0,
      zipCode: true,
      email: vm.data.user.email,
      panelLabel: 'UPDATE'
    });
  }

  function cerebroOptOut () {
    $http({
      method: 'PUT',
      url: '/api/users/' + vm.data.user.id,
      data: {cerebro_opt_in: false}
    }).then(function (resp) {
      if (resp.data && resp.data.success) {
        userProperties.set(resp.data.user);
      }
    });
  }

  function upgradeOrDowngrade () {
    if (isPremium()) {
      if (vm.data.currentSubscription && vm.data.currentSubscription.id) {
        $http({
          method: 'DELETE',
          url: '/api/users/' + vm.data.user.id + '/subscriptions/' + vm.data.currentSubscription.id,
        }).then(function (resp) {
          if (resp.data && resp.data.success) {
            cerebroOptOut();
          }
        });
      } else {
        cerebroOptOut();
      }
    } else {
      // $location.url('premium_signup');
      window.alert('Sorry, Premium signup isn\'t available now.');
    }
  }

  function getFormattedNextPaymentDate (nextPaymentDate) {
    return moment(nextPaymentDate).format('MMM D YYYY');
  }

  function getAccountStatus () {
    if (isPremium()) {
      return 'Premium';
    }
    return 'Basic';
  }

  function getUpgradeLinkText () {
    if (isPremium()) {
      return 'downgrade';
    }
    return 'upgrade';
  }

  function isPremium () {
    if (vm.data.user.cerebro_opt_in) {
      return true;
    }
    return false;
  }

  function addSubscriptionsToAccountHistory (subscriptions) {
    if (subscriptions && subscriptions.length > 0) {
      _.each(subscriptions, function (sub) {
        var row = {};
        row.actionName = 'Begin premium subscription';
        row.actionDatetime = moment(sub.created_at).format('X');
        row.actionDate = moment(sub.created_at).format('MMM D YYYY');
        vm.data.accountHistoryTableData.rows.push(row);
        if (!sub.active && sub.end_date) {
          var endRow = {};
          endRow.actionName = 'End premium subscription';
          endRow.actionDatetime = moment(sub.end_date).format('X');
          endRow.actionDate = moment(sub.end_date).format('MMM D YYYY');
          vm.data.accountHistoryTableData.rows.push(endRow);
        }
      });
      $rootScope.$broadcast('sortableTableSort');
    }
  }

  function addTransactionsToAccountHistory (transactions) {
    if (transactions && transactions.length > 0) {
      _.each(transactions, function (transaction) {
        var row = {};
        row.actionName = 'Monthly premium payment';
        row.actionDatetime = moment(transaction.created_at).format('X');
        row.actionDate = moment(transaction.created_at).format('MMM D YYYY');
        row.actionDetails = 'Pay ' + getAmount(transaction.amount);
        vm.data.accountHistoryTableData.rows.push(row);
      });
      $rootScope.$broadcast('sortableTableSort');
    }
  }

  function getAmount (amountInPennies) {
    return '$' + (amountInPennies / 100);
  }

  function getPayments (user) {
    $http.get('/api/users/' + user.id + '/payments').then(function (resp) {
      if (resp.data && resp.data.payments) {
        vm.data.payments = resp.data.payments;
        addTransactionsToAccountHistory(vm.data.payments);
      }
    });
  }

  function getSubscriptions (user) {
    $http.get('/api/users/' + user.id + '/subscriptions').then(function (resp) {
      if (resp.data && resp.data.subscriptions) {
        vm.data.subscriptions = resp.data.subscriptions;
        addSubscriptionsToAccountHistory(vm.data.subscriptions);

        _.each(vm.data.subscriptions, function (sub) {
          if (sub.active) {
            if (vm.data.currentSubscription) {
              if (moment(sub.created_at).isAfter(moment(vm.data.currentSubscription.created_at))) {
                vm.data.currentSubscription = sub;
              }
            } else {
              vm.data.currentSubscription = sub;
            }
          }
        });
      }
    });
  }

  function getInvoices (user) {
    $http.get('/api/users/' + user.id + '/invoices').then(function (resp) {
      if (resp.data && resp.data.invoices) {
        vm.data.invoices = resp.data.invoices;
        addTransactionsToAccountHistory(vm.data.invoices);
      }
    });
  }

  function getPaymentDetails (user) {
    $http.get('/api/users/' + user.id + '/subscriptions/payment_details').then(function (resp) {
      if (resp.data && resp.data.card) {
        vm.data.card = resp.data.card;
      }
    });
  }

  if (vm.data.user && vm.data.user.id) {
    vm.data.accountHistoryTableData.rows = [];
    getSubscriptions(vm.data.user);
    getInvoices(vm.data.user);
    getPayments(vm.data.user);
    getPaymentDetails(vm.data.user);
  }

  var setUserPropertiesCleanupFunc = $rootScope.$on('setUserProperties', function () {
    var oldUserId = vm.data.user.id;
    vm.data.user = userProperties.get();
    if (oldUserId !== vm.data.user.id) {
      vm.data.accountHistoryTableData.rows = [];
      getSubscriptions(vm.data.user);
      getInvoices(vm.data.user);
      getPayments(vm.data.user);
      getPaymentDetails(vm.data.user);
    }
  });

  $scope.$on('$destroy', function() {
    setUserPropertiesCleanupFunc();
  });

  // setup checkout flow and stripe handler
  if (window.StripeCheckout) {
    handler = window.StripeCheckout.configure({
      key: vm.data.user.stripe_key,
      image: 'images/nari.png',
      locale: 'auto',
      token: function (token) {
        $http({
          method: 'PUT',
          url: '/api/users/' + vm.data.user.id + '/subscriptions/update_payment_details',
          data: {
            stripeToken: token.id
          }
        }).then(function (resp) {
          if (resp.data && resp.data.card) {
            vm.data.card = resp.data.card;
          }
        });
      }
    });
  }

}
})();
