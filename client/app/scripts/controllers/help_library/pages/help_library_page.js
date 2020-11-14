(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('HelpLibraryPageCtrl', HelpLibraryPageCtrl);

HelpLibraryPageCtrl.$inject = ['eventRecorder', 'userProperties', '$rootScope', '$scope', '$location'];
function HelpLibraryPageCtrl (eventRecorder, userProperties, $rootScope, $scope, $location) {
  var vm = this;

  var welcomeVideoPlayer = { iframeId: 'welcome_video_iframe_v2' };
  var addingEventsVideoPlayer = { iframeId: 'help_library_adding_events_video_v2_iframe' };
  var networkingEvents1VideoPlayer = { iframeId: 'help_library_networking_events_1_video_iframe' };
  var networkingEvents2VideoPlayer = { iframeId: 'help_library_networking_events_2_video_iframe' };
  var csvUploadVideoPlayer = { iframeId: 'help_library_csv_upload_video_v2_iframe' };
  var chromeExtensionVideoPlayer = { iframeId: 'help_library_chrome_extension_video_iframe' };
  var archivingOpportunitiesVideoPlayer = { iframeId: 'help_library_archiving_opportunities_video_iframe' };
  var opportunityRatingsVideoPlayer = { iframeId: 'help_library_opportunity_ratings_video_iframe' };

  vm.userData = userProperties.get();

  var prefix = '/help_library/';
  var page = $location.path().substring(prefix.length);
  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'help-library-page-' + page,
  });

  setupPlayerjs(welcomeVideoPlayer);
  setupPlayerjs(addingEventsVideoPlayer);
  setupPlayerjs(networkingEvents1VideoPlayer);
  setupPlayerjs(networkingEvents2VideoPlayer);
  setupPlayerjs(csvUploadVideoPlayer);
  setupPlayerjs(chromeExtensionVideoPlayer);
  setupPlayerjs(archivingOpportunitiesVideoPlayer);
  setupPlayerjs(opportunityRatingsVideoPlayer);

  vm.matchSponsor = matchSponsor;

  function matchSponsor (sponsor) {
    if (vm.userData.sponsor === sponsor) {
      return true;
    }
    return false;
  }

  function setupPlayerjs (playerContainer) {
    var node = document.getElementById(playerContainer.iframeId);
    if (window.playerjs && node) {
      playerContainer.player = new window.playerjs.Player(playerContainer.iframeId);
      if (playerContainer.player) {
        var player = playerContainer.player;
        player.on('ready', function () {
          player.on('play', function () {
            eventRecorder.trackEvent({
              action: 'play-video-' + playerContainer.iframeId,
              page: 'help-library-page-' + page,
            });
          });
          player.on('end', function () {
            eventRecorder.trackEvent({
              action: 'end-video-' + playerContainer.iframeId,
              page: 'help-library-page-' + page,
            });
          });
        });
      }
    }
  }

  var setUserPropertiesCleanupFunc = $rootScope.$on('setUserProperties', function () {
    vm.userData = userProperties.get();
  });
  $scope.$on('destroy', function () {
    setUserPropertiesCleanupFunc();
  });

}
})();
