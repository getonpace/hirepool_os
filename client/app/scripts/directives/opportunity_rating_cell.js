(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpOpportunityRatingCell', hpOpportunityRatingCell);

function hpOpportunityRatingCell() {
  var directive = {
    templateUrl: 'views/directives/opportunity_rating_cell.html',
    restrict: 'E',
    scope: {
      rating: '=',
    },
    link: linkFunc,
    controller: HpOpportunityRatingCell,
    controllerAs: 'vm',
    bindToController: true
  };
  return directive;

  function linkFunc(/*scope, element, attrs*/) {
    /* */
  }
}

HpOpportunityRatingCell.$inject = [];
function HpOpportunityRatingCell () {
  // var vm = this;
}

})();
