(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpEventRecorder', hpEventRecorder);

function hpEventRecorder($parse, eventRecorder) {
  var directive = {
    restrict: 'A',
    link: linkFunc,
  };
  return directive;

  function linkFunc(scope, element, attrs) {
    element.bind('click', function () {
      var options = $parse(attrs.hpEventRecorder);
      var user_action = options(scope);
      if (user_action && user_action.action) {
        eventRecorder.trackEvent(user_action);
      }
    });
  }
}

})();