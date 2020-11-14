(function () {
'use strict';

angular
  .module('hirepoolApp')
  .service('eventRecorder', eventRecorder);

eventRecorder.$inject = ['ENV', '$http', 'userProperties'];
function eventRecorder (ENV, $http, userProperties) {

  var intercomEventsForUpdate = [
    'added-offer',
    'open-guide-modal',
    'added-event',
    'added-opportunity',
    'added-collaborator',
    'load-opportunities-index-page',
    'load-opportunities-grid-page'
  ];

  return {
    trackEvent: trackEvent,
    trackPublicEvent: trackPublicEvent,
  };

  function trackPublicEvent (event) {
    if (event.action && event.page) {
      $http({
        method: 'POST',
        url: '/api/user_actions/public',
        data: {
          user_action: {
            action: event.action,
            page: event.page,
          }
        }
      }).then(function successCallback() {
      }, function errorCallback() {
      });
    }
  }

  function trackEvent (event) {
    var user = userProperties.get();
    if (event && event.action && user.id) {
      if (ENV.name === 'production' && window.amplitude) {
        var eventName = event.action;
        var eventsToAppendTo = [
          'load-page',
          'open-modal',
          'play-video',
          'skip-video',
          'finish-video'
        ];
        // if the eventName begins with 'show-tab-' or is in the eventsToAppendTo whitelist
        // add the page or modal to the event name for clarity
        if (eventName.indexOf('show-tab-') > -1 || eventsToAppendTo.indexOf(eventName) > -1) {
          if (event.modal) {
            eventName = eventName + '.' + event.modal;
          } else if (event.page) {
            eventName = eventName + '.' + event.page;
          }
        }
        window.amplitude.getInstance().logEvent(eventName, event);
      }
      $http({
        method: 'POST',
        url: '/api/user_actions',
        data: {
          user_action: {
            action: event.action,
            page: event.page,
            modal: event.modal,
            sort_param: event.sort_param,
            event_id: event.event_id,
            interviews: event.interviews
          }
        }
      }).then(function successCallback() {
      }, function errorCallback() {
      });
    } else {
      if (ENV.name === 'production' && window.Intercom) {
        window.Intercom('trackEvent', event);

        // because intercom throttles calls to 'update' only call when we know the event will trigger a message
        if (intercomEventsForUpdate.indexOf(event) >= 0) {
          window.Intercom('update', {last_request_at: Math.floor(Date.now() / 1000)});
        }
      }
    }
  }

}
})();
