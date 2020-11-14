(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AccountOptionsCtrl', AccountOptionsCtrl);

AccountOptionsCtrl.$inject = ['eventRecorder', '$http', 'userProperties', '$scope', '$rootScope'];
function AccountOptionsCtrl (eventRecorder, $http, userProperties, $scope, $rootScope) {

  var vm = this;
  var handler;
  vm.data = {};
  vm.data.user = userProperties.get();
  vm.view = {};
  vm.view.premiumOptedIn = vm.data.user.cerebro_opt_in;

  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'account_options',
    sort_param: vm.data.user.payment_amount,
  });

  vm.checkout = checkout;
  vm.getFirstName = getFirstName;

  function getFirstName () {
    return userProperties.getFirstName();
  }

  function checkout () {
    eventRecorder.trackEvent({
      action: 'choose_premium',
      page: 'account_options',
      sort_param: vm.data.user.payment_amount,
    });
    if (vm.data.user.payment_amount > 0) {
      vm.view.paying = true;
      handler.open({
        name: 'HIREPOOL INC',
        description: 'hirepool premium subscription',
        amount: vm.data.user.payment_amount,
        zipCode: true,
        email: vm.data.user.email
      });
    } else {
      premiumOptIn();
      vm.view.premiumOptedIn = true;
    }
  }

  function premiumOptIn () {
    $http({
      method: 'PUT',
      url: '/api/users/accept_cerebro_invite'
    }).then(function (resp) {
      if (resp && resp.data && resp.data.user) {
        userProperties.set(resp.data.user);
      }
      vm.view.premiumOptedIn = true;
    });
  }

  function setPremiumState () {
    if (vm.data.user.cerebro_opt_in) {
      vm.view.premiumOptedIn = true;
    }
  }

  function setViewAmount () {
    vm.view.amount = (vm.data.user.payment_amount / 100).toFixed(2);
  }

  // account_options page init
  setViewAmount();
  setPremiumState();
  $http({
    method: 'PUT',
    url: '/api/users/saw_cerebro_invite'
  }).then(function (resp) {
    if (resp && resp.data && resp.data.user) {
      userProperties.set(resp.data.user);
    }
  });

  // setup checkout flow and stripe handler
  if (window.StripeCheckout) {
    handler = window.StripeCheckout.configure({
      key: vm.data.user.stripe_key,
      image: 'images/nari.png',
      locale: 'auto',
      token: function (token) {
        $http({
          method: 'POST',
          url: '/api/users/' + vm.data.user.id + '/subscriptions',
          data: {
            stripeToken: token.id
          }
        }).then(function successCallback () {
          eventRecorder.trackEvent({
            action: 'checkout_success',
            page: 'account_options',
            sort_param: vm.data.user.payment_amount,
          });
          vm.view.paying = false;
          vm.view.payment_success = true;
          vm.view.premiumOptedIn = true;
          premiumOptIn();
        }, function errorCallback () {
          eventRecorder.trackEvent({
            action: 'checkout_error',
            page: 'account_options',
            sort_param: vm.data.user.payment_amount,
          });
          vm.view.paying = false;
          vm.view.payment_error = true;
          vm.view.premiumOptedIn = true;
          premiumOptIn();
        });
      }
    });
  } else {
    vm.view.payment_error = true;
  }

  var setUserPropertiesCleanupFunc = $rootScope.$on('setUserProperties', function () {
    vm.data.user = userProperties.get();
    setPremiumState();
    setViewAmount();
  });
  $scope.$on('$destroy', function () {
    setUserPropertiesCleanupFunc();
  });

}
})();
