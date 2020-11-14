(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AdminOppDetailsCtrl', AdminOppDetailsCtrl);

AdminOppDetailsCtrl.$inject = ['$scope', 'moment', 'ConstantsFactory', '$sce', 'opportunityHelpers'];
function AdminOppDetailsCtrl ($scope, moment, ConstantsFactory, $sce, opportunityHelpers) {
  var vm = this;

  vm.data = {};
  vm.view = {};

  vm.parentData = $scope.$parent.vm.data;
  vm.getFullDate = $scope.$parent.vm.getFullDate;
  vm.getThumbs = $scope.$parent.vm.getThumbs;

  vm.ConstantsFactory = ConstantsFactory;
  vm.getOppString = getOppString;
  vm.getPoc = getPoc;
  vm.getShortestDateString = getShortestDateString;
  vm.feedbackText = feedbackText;
  vm.toggleExpanded = toggleExpanded;
  vm.getSce = getSce;
  vm.getStatus = getStatus;

  function getStatus (opp) {
    return opportunityHelpers.getStatus(opp);
  }

  function getSce (html) {
    return $sce.trustAsHtml(html);
  }

  function toggleExpanded (event) {
    event.expanded = !event.expanded;
  }

  function feedbackText (event) {
    if (event.hasFeedback) {
      return 'Has Feedback';
    }
    if (!event.hasFeedback && isInPast(event.date)) {
      return 'Needs Feedback';
    }
    return '';
  }

  function getShortestDateString (dateString) {
    if (dateString) {
      return moment(dateString).format('MM/DD');
    }
    return '';
  }

  function getPoc (event) {
    var poc = event.interviewers.find(function (int) { return int.is_poc; });
    if (poc) {
      return poc.interviewer.name + (poc.interviewer.email ? (' (' + poc.interviewer.email + ')') : '');
    }
    return '';
  }

  function getOppString (opp) {
    var oppString = '';
    if (opp) {
      if (opp.company && opp.company.name) {
        oppString = opp.company.name;
      }
      if (opp.company && opp.company.name && opp.job_title) {
        oppString = oppString + ': ';
      }
      if (opp.job_title) {
        oppString = oppString + opp.job_title;
      }
    }
    return oppString;
  }

  function isInPast (date) {
    return moment().isAfter(date);
  }

}

})();