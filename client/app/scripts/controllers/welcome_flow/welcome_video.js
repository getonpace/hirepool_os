(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('WelcomeVideoCtrl', WelcomeVideoCtrl);

WelcomeVideoCtrl.$inject = ['$http', 'userProperties', 'eventRecorder', '$rootScope', '$scope', 'moment', '$location'];
function WelcomeVideoCtrl ($http, userProperties, eventRecorder, $rootScope, $scope, moment, $location) {
  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'welcome-video'
  });

  var vm = this;
  vm.data = {};
  vm.data.user = userProperties.get();
  vm.view = {};
  vm.view.videoPlaying = false;

  // on view load check for special states / behaviors
  // check to see if user should be shown sponsor agreement
  if (vm.data.user.sponsor && vm.data.user.user_agreement_status !== 'accepted' && vm.data.user.user_agreement_status !== 'declined') {
    var lastSeen;
    if (vm.data.user.saw_user_agreement_at) {
      lastSeen = moment(vm.data.user.saw_user_agreement_at);
    }
    var sevenDaysAgo = moment().subtract(7, 'days');
    if ( !lastSeen || (lastSeen.isBefore(sevenDaysAgo) && vm.data.user.user_agreement_status !== 'auto-accepted') ) {
      $rootScope.$broadcast('update-user-login-info', null);
      if (vm.data.user.sponsor) {
        var modalName = 'user-agreement-' + vm.data.user.sponsor + '-modal';
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
  }

  vm.getFirstName = getFirstName;
  vm.skipVideo = skipVideo;

  function skipVideo () {
    eventRecorder.trackEvent({
      action: 'skip-video',
      page: 'welcome-video'
    });
    // if (!vm.data.user.saw_cerebro_invite) {
    //   $location.url('/choose_account');
    // } else {
    //   if (vm.player && vm.view.videoPlaying) {
    //     vm.player.pause();
    //   }
    //   $location.url('/');
    // }
    if (vm.player && vm.view.videoPlaying) {
      vm.player.pause();
    }
    $location.url('/');
  }

  function getFirstName () {
    return userProperties.getFirstName();
  }

  function finishedVideo () {
    eventRecorder.trackEvent({
      action: 'end-video-welcome_video_iframe_v2',
      page: 'welcome-video'
    });
    vm.view.videoPlaying = false;
    // if (!vm.data.user.saw_cerebro_invite) {
    //   $location.url('/choose_account');
    // } else {
    //   $location.url('/');
    // }
    $location.url('/');
  }

  function setupPlayerjs () {
    if (window.playerjs) {
      vm.player = new window.playerjs.Player('welcome_video_iframe_v2');
      if (vm.player) {
        vm.player.on('ready', function () {
          vm.player.on('play', function () {
            eventRecorder.trackEvent({
              action: 'play-video-welcome_video_iframe_v2',
              page: 'welcome-video'
            });
            vm.view.videoPlaying = true;
          });
          vm.player.on('ended', function () {
            finishedVideo();
            if(!$scope.$$phase) {
              $scope.$digest();
            }
          });
          vm.player.on('pause', function () {
            vm.view.videoPlaying = false;
          });
        });
      }
    }
  }

  // welcome page init
  $http({
    method: 'PUT',
    url: '/api/users/saw_welcome_screen'
  }).then(function (resp) {
    if (resp && resp.data && resp.data.user) {
      userProperties.set(resp.data.user);
    }
  });
  setupPlayerjs();

  var setUserPropertiesCleanupFunc = $rootScope.$on('setUserProperties', function () {
    vm.data.user = userProperties.get();
  });
  $scope.$on('$destroy', function () {
    setUserPropertiesCleanupFunc();
  });

}
})();
