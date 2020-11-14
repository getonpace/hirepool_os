(function () {

  'use strict';

  ComparisonViewItemController.$inject = ['$rootScope', '$scope', 'selectedCardData', 'scoreHelpers', 'companyCompare', 'opportunityHelpers', 'moment', 'userProperties', '_', 'opportunitiesData'];
  function ComparisonViewItemController ($rootScope, $scope, selectedCardData, scoreHelpers, companyCompare, opportunityHelpers, moment, userProperties, _, opportunitiesData) {
    var vm = this;
    var loadingCbData = false;
    var loadingLatLng = false;
    var loadingCommute = false;

    vm.user = {
      surveyAnswers: userProperties.getSurvey(),
      locString: userProperties.getLocString(),
      latLng: userProperties.getLatLng(),
    };

    vm.data = {};
    if (vm.opportunity.data) {
      vm.data.opportunity = vm.opportunity.data;
    } else {
      vm.data.opportunity = vm.opportunity;
    }
    vm.data.location = opportunitiesData.getLocString(vm.data.opportunity.id);
    vm.data.cbData = opportunitiesData.getCbData(vm.data.opportunity.id);
    if (!vm.data.cbData) {
      loadingCbData = true;
      setIsLoading();
      opportunitiesData.setCbData({id: vm.data.opportunity.id}).then(function () {
        vm.data.cbData = opportunitiesData.getCbData(vm.data.opportunity.id);
        loadingCbData = false;
        setIsLoading();
      });
    }
    vm.data.latLng = opportunitiesData.getLatLng(vm.data.opportunity.id);
    if (!vm.data.latLng) {
      loadingLatLng = true;
      opportunitiesData.setLatLng(vm.data.opportunity.id);
    } else {
      vm.data.commute = opportunitiesData.getCommuteTime(vm.data.opportunity.id);
    }
    if (vm.user.latLng && vm.data.latLng) {
      loadingCommute = true;
      opportunitiesData.setCommuteTime(vm.data.opportunity.id, vm.user.latLng);
    }

    vm.geoCodeFetching = false;
    vm.setCurrentOpportunity = setCurrentOpportunity;
    vm.getOpportunityRating = getOpportunityRating;
    vm.getInterviewScore = getInterviewScore;
    vm.getValueFit = getValueFit;
    vm.getPplFit = getPplFit;
    vm.getCollabScore = getCollabScore;
    vm.getCollabs = getCollabs;
    vm.getFoundedYear = getFoundedYear;
    vm.getEmployees = getEmployees;
    vm.getTwitterFollowers = getTwitterFollowers;
    vm.getMarketCap = getMarketCap;
    vm.getRevenue = getRevenue;
    vm.getFunding = getFunding;
    vm.comparePublicCo = companyCompare.comparePublicCo;
    vm.compareHasInterviews = companyCompare.compareHasInterviews;
    vm.getNextInterview = function () {
      return opportunityHelpers.getNextInterview(vm.data.opportunity);
    };
    vm.getLastInterview = function () {
      return opportunityHelpers.getLastInterview(vm.data.opportunity);
    };
    vm.getFirstInterview = function () {
      return opportunityHelpers.getFirstInterview(vm.data.opportunity);
    };
    vm.getInterviewCount = function () {
      return opportunityHelpers.getInterviewCount(vm.data.opportunity);
    };
    vm.getTimeInPipeline = function () {
      return opportunityHelpers.getTimeInPipeline(vm.data.opportunity);
    };
    vm.dateHelper = dateHelper;

    function dateHelper (dateString) {
      return moment(dateString).format('ddd MMM Do');
    }

    function dollarMask (val) {
      var masked;
      if (val < 1000) {
        return '$' + Math.round(val, 0);
      }
      if (val < 1000000) {
        masked = (val / 1000);
        return '$' + masked + 'K';
      }
      if (val < 1000000000) {
        masked = (val / 1000000);
        return '$' + masked + 'M';
      }
      masked = (val / 1000000000);
      return '$' + masked + 'B';
    }

    function getFunding () {
      var cb = vm.data.cbData;
      if (cb && cb.metrics && cb.metrics.raised) {
        return dollarMask(cb.metrics.raised);
      }
      return '-';
    }

    function getRevenue () {
      var cb = vm.data.cbData;
      if (cb && cb.metrics && cb.metrics.annualRevenue) {
        return dollarMask(cb.metrics.annualRevenue);
      }
      return '-';
    }

    function getMarketCap () {
      var cb = vm.data.cbData;
      if (cb && cb.metrics && cb.metrics.marketCap) {
        return dollarMask(cb.metrics.marketCap);
      }
      return '-';
    }

    function getTwitterFollowers () {
      var cb = vm.data.cbData;
      if (cb && cb.twitter && cb.twitter.followers) {
        return Math.round(cb.twitter.followers, 0);
      }
      return '-';
    }

    function getEmployees () {
      var cb = vm.data.cbData;
      if (cb && cb.metrics && cb.metrics.employees) {
        return Math.round(cb.metrics.employees, 0);
      }
      return '';
    }

    function getFoundedYear () {
      var cb = vm.data.cbData;
      if (cb && cb.foundedYear) {
        return Math.round(cb.foundedYear, 0);
      }
      return '';
    }

    function getCollabs () {
      return vm.data.opportunity.collaborator_feedbacks.filter(function (collab) {
        if (collab.collaborator && collab.collaborator.name && collab.rating) {
          return true;
        }
      }).map(function (collab) {
        return collab.collaborator.name;
      });
    }

    function getCollabScore () {
      return scoreHelpers.getCollabScore(vm.data.opportunity);
    }

    function getPplFit () {
      return scoreHelpers.getEventPplFit(vm.data.opportunity);
    }

    function getValueFit () {
      return scoreHelpers.getEventValueFit(vm.data.opportunity);
    }

    function getOpportunityRating () {
      return scoreHelpers.getScore(vm.data.opportunity);
    }

    function getInterviewScore () {
      return scoreHelpers.getOverallEventScore(vm.data.opportunity);
    }

    function setCurrentOpportunity () {
      selectedCardData.set(vm.data.opportunity);
      $rootScope.$broadcast('updatingCard');
    }

    function setIsLoading () {
      if (loadingCbData) {
        vm.opportunity.comparisonViewIsLoading = true;
      } else {
        vm.opportunity.comparisonViewIsLoading = false;
      }
    }

    var setSurveyAnswersCleanupFunc = $rootScope.$on('setSurveyAnswers', function () {
      vm.user.surveyAnswers = userProperties.getSurvey();
      vm.user.locString = userProperties.getLocString();
    });

    var setUserLatLngCleanupFunc = $rootScope.$on('setUserLatLng', function () {
      vm.user.latLng = userProperties.getLatLng();
      if (vm.user.latLng && vm.data.latLng) {
        loadingCommute = true;
        opportunitiesData.setCommuteTime(vm.data.opportunity.id, vm.user.latLng);
      }
    });

    var setOppCbDataCleanupFunc = $rootScope.$on('setOppCbData', function (e, id) {
      if (id === vm.data.opportunity.id) {
        vm.data.cbData = opportunitiesData.getCbData(id);
        vm.data.location = opportunitiesData.getLocString(id);
        loadingCbData = false;
        setIsLoading();
      }
    });

    var setOppLatLngCleanupFunc = $rootScope.$on('setOppLatLng', function (e, id) {
      if (id === vm.data.opportunity.id) {
        loadingLatLng = false;
        vm.data.latLng = opportunitiesData.getLatLng(id);
        if (vm.user.latLng && vm.data.latLng) {
          loadingCommute = true;
          opportunitiesData.setCommuteTime(id, vm.user.latLng);
        }
      }
    });

    var setOppCommuteTimeCleanupFunc = $rootScope.$on('setOppCommuteTime', function (e, id) {
      if (id === vm.data.opportunity.id) {
        vm.data.commute = opportunitiesData.getCommuteTime(id);
        loadingCommute = false;
        $scope.$apply();
      }
    });

    $scope.$on('$destroy', function() {
      setSurveyAnswersCleanupFunc();
      setUserLatLngCleanupFunc();
      setOppCbDataCleanupFunc();
      setOppLatLngCleanupFunc();
      setOppCommuteTimeCleanupFunc();
    });

  }

  angular.module('hirepoolApp').component('comparisonViewItem', {
    templateUrl: 'views/components/comparison_view_item.html',
    controller: ComparisonViewItemController,
    controllerAs: 'vm',
    bindings: {
      opportunity: '<'
    }
  });

})();
