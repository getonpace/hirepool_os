(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('OpportunitiesIndexCtrl', OpportunitiesIndexCtrl);

OpportunitiesIndexCtrl.$inject = ['$scope', '$http', '$timeout', '$rootScope', 'eventRecorder', 'userProperties', 'moment', '_'];
function OpportunitiesIndexCtrl ($scope, $http, $timeout, $rootScope, eventRecorder, userProperties, moment, _) {
  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'opportunities-index'
  });
  eventRecorder.trackEvent('load-opportunities-index-page');

  var userData = userProperties.get();
  var justShowedAccountsMerged = false;

  var vm = this;
  vm.data = {};
  vm.view = {};

  vm.data.cards = [];
  vm.data.opportunitiesLoadedCount = 0;
  vm.data.opportunitiesLoaded = false;

  vm.view.showComparisonView = false;

  if (userData.need_ftu_opportunities_index) {
    window.openModal('opportunities_index_ftu_overlay');
    $rootScope.$broadcast('ftuOverlayModalOpened', 'opportunities_index_ftu_overlay');
    $http({
      method: 'PUT',
      url: '/api/users/need_ftu_opportunities_index'
    }).then(function (resp) {
      if (resp && resp.data && resp.data.user) {
        userProperties.set(resp.data.user);
      }
    });
  }

  vm.openAddEventFodal = openAddEventFodal;
  vm.hideLoading = hideLoading;
  vm.setupOppForCards = setupOppForCards;

  function setupOppForCards (opportunityContainer) {
    var opportunity = opportunityContainer.data;
    opportunity.gdData = opportunityContainer.gdData;
    opportunity.cbData = opportunityContainer.cbData;
    return {
      template: 'views/opportunities/opportunity_card.html',
      data: opportunity,
    };
  }

  function openAddEventFodal () {
    $rootScope.$broadcast('reset-add-event-and-opportunity-fodal');
    window.openModal('add-event-and-opportunity-fodal');
  }

  function hideLoading () {
    return window.hpAllCardsLoaded || (vm.data.opportunitiesLoadedCount === 0 && vm.data.opportunitiesLoaded) || (vm.data.opportunitiesLoadedCount > 0 && vm.data.cards.length === 0 && vm.data.opportunitiesLoaded);
  }

  function showAccountsMergedMessage (user) {
    if (user.last_authentication_merged_at) {
      var lastMerge = moment(user.last_authentication_merged_at);
      var lastMessaged = user.authentication_merged_message_shown_at ? moment(user.authentication_merged_message_shown_at) : moment(0);
      if (lastMerge.isAfter(lastMessaged)) {
        if (user.last_authentication_merged_provider && user.provider && user.last_authentication_merged_provider.toLowerCase() === user.provider.toLowerCase()) {
          var providers = user.available_authentication_providers;
          if (providers && providers.length === 2) {
            var emailProvider = _.find(providers, function (p) {
              return p.toLowerCase() === 'email';
            });
            if (emailProvider) {
              if (user.confirmed_at) {
                return true;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        }
      }
    }
    return false;
  }

  function openAccountsMergedModal () {
    justShowedAccountsMerged = true;
    eventRecorder.trackEvent({
      action: 'open-modal',
      page: 'opportunities-index',
      modal: 'accounts-merged-message',
    });
    window.openModal('accounts-merged-message');
    $http({
      method: 'PUT',
      url: '/api/users/saw_authentication_merged_message',
    }).then(function successCallback (resp) {
      if (resp && resp.data && resp.data.user) {
        userProperties.set(resp.data.user);
      }
    }, function errorCallback () {
    });
  }

  function showUserAgreementMessage (user) {
    if (user.sponsor && user.user_agreement_status !== 'accepted' && user.user_agreement_status !== 'declined') {
      var lastSeen;
      if (user.saw_user_agreement_at) {
        lastSeen = moment(user.saw_user_agreement_at);
      }
      var sevenDaysAgo = moment().subtract(7, 'days');
      if ( !lastSeen || (lastSeen.isBefore(sevenDaysAgo) && user.user_agreement_status !== 'auto-accepted') ) {
        return true;
      }
    }
    return false;
  }

  function openUserAgreementModal (user) {
    $rootScope.$broadcast('update-user-login-info', null);
    if (user.sponsor) {
      var modalName = 'user-agreement-' + user.sponsor + '-modal';
      $http({
        method: 'PUT',
        url: '/api/users/user_agreement/seen',
      }).then(function successCallback (resp) {
        if (resp && resp.data && resp.data.user) {
          userProperties.set(resp.data.user);
        }
      });
      eventRecorder.trackEvent({
        action: 'open-modal',
        page: 'opportunities-index',
        modal: 'sponsor-user-agreement',
      });
      window.openModal(modalName);
    }
  }

  // on view load check for special states / behaviors
  if (showAccountsMergedMessage(userData)) {
    openAccountsMergedModal();
  } else if (showUserAgreementMessage(userData)) {
    openUserAgreementModal(userData);
  }

  var layoutTimer;
  function redoLayout () {
    if (layoutTimer) {
      $timeout.cancel(layoutTimer);
    }
    layoutTimer = $timeout(function () {
      $rootScope.$broadcast('layout');
    }, 10);
  }
  var showComparisonViewCleanupFunc = $rootScope.$on('showComparisonView', function () {
    vm.view.showComparisonView = true;
  });
  var hideComparisonViewCleanupFunc = $rootScope.$on('hideComparisonView', function () {
    vm.view.showComparisonView = false;
    redoLayout();
  });
  var subheaderGotOpportunitiesCleanupFunc = $rootScope.$on('subheaderGotOpportunities', function (e, count) {
    vm.data.opportunitiesLoaded = true;
    vm.data.opportunitiesLoadedCount = count;
  });
  var subheaderUpdatedOpportunityCleanupFunc = $rootScope.$on('subheaderUpdatedOpportunity', function () {
    if(!$scope.$$phase) {
      $scope.$digest();
    }
  });
  var closeModalCleanupFunc = $rootScope.$on('closeModal', function (e, modal) {
    // if we just showed the accounts merged modal, when it closes we want to check for user agreement modal
    if (justShowedAccountsMerged && modal === 'accounts-merged-message') {
      justShowedAccountsMerged = false;
      if (showUserAgreementMessage(userData)) {
        openUserAgreementModal(userData);
      }
    }
  });

  $scope.$on('$destroy', function() {
    showComparisonViewCleanupFunc();
    hideComparisonViewCleanupFunc();
    subheaderGotOpportunitiesCleanupFunc();
    subheaderUpdatedOpportunityCleanupFunc();
    closeModalCleanupFunc();
  });

}
})();
