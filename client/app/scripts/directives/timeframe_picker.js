(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpTimeframePicker', hpTimeframePicker);

function hpTimeframePicker() {
  var directive = {
    templateUrl: 'views/directives/timeframe_picker.html',
    restrict: 'EA',
    scope: {
      timeframe: '=',
      disabledMarker: '=',
      uniqueId: '=',
    },
    link: linkFunc,
    controller: HpTimeframePickerController,
    controllerAs: 'vm',
    bindToController: true
  };
  return directive;

  function linkFunc(/*scope, element, attrs*/) {
    /* */
  }
}

HpTimeframePickerController.$inject = ['$rootScope'];
function HpTimeframePickerController ($rootScope) {
  var vm = this;

  vm.getClass = getClass;
  vm.setTimeframe = setTimeframe;

  function getClass (timeframe) {
    if (vm.disabledMarker) {
      return 'disabled';
    } else if (vm.timeframe === timeframe) {
      return 'active';
    } else {
      return '';
    }
  }

  function setTimeframe (timeframe) {
    if (!vm.disabledMarker && vm.timeframe !== timeframe) {
      vm.timeframe = timeframe;
      $rootScope.$broadcast('hp-timeframe-picker-udpate-' + vm.uniqueId, vm.timeframe);
    }
  }

}

})();
