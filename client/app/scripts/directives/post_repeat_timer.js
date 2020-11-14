// Use in HTML:
//<tr ng-repeat="item in items" hp-post-repeat-timer>…</tr>

(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpPostRepeatTimer', hpPostRepeatTimer);

function hpPostRepeatTimer(moment, $timeout) {
  var directive = {
    restrict: 'EA',
    scope: {
      userId: '='
    },
    link: linkFunc,
    controller: HpPostRepeatTimerController,
    controllerAs: 'vm',
    bindToController: true
  };
  return directive;

  function linkFunc(scope/*, element, attrs*/) {
    if (scope.$last || (scope.$parent && scope.$parent.$last)) {
      console.log('finished parsing list (scope.$last): ' + moment().format('HH:mm:ss.SSS'));
      $timeout(function(){
        console.log('finished rendering list (scope.$last timeout): ' + moment().format('HH:mm:ss.SSS'));
      });
    }
  }
}

HpPostRepeatTimerController.$inject = [];
function HpPostRepeatTimerController () {
  var vm = this;
  vm.data = {};
}

})();