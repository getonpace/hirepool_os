(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpOpportunitiesSubheader', hpOpportunitiesSubheader);

function hpOpportunitiesSubheader() {
  var directive = {
    templateUrl: 'views/directives/opportunities_subheader.html',
    restrict: 'E',
    scope: {
      visibleOpportunities: '=',
      containerType: '@',
      opportunitySetupFunc: '=',
    },
    link: linkFunc,
    controller: HpOpportunitiesSubheaderController,
    controllerAs: 'vm',
    bindToController: true
  };
  return directive;

  function linkFunc(/*scope, element, attrs*/) {
    /* */
  }
}

HpOpportunitiesSubheaderController.$inject = ['_', 'scoreHelpers', '$rootScope', 'companyCompare', 'opportunitiesData', '$timeout'];
function HpOpportunitiesSubheaderController (_, scoreHelpers, $rootScope, companyCompare, opportunitiesData, $timeout) {
  var vm = this;
  vm.view = {};
  vm.view.nowShowing = 'active';
  vm.data = {};
  vm.data.activeOpportunities = [];
  vm.data.archivedOpportunities = [];
  vm.data.filterValue = '';

  vm.showArchivedOpportunities = showArchivedOpportunities;
  vm.showActiveOpportunities = showActiveOpportunities;
  vm.showComparisonView = showComparisonView;
  vm.disableCompareButton = disableCompareButton;
  vm.runDataFilter = runDataFilter;
  vm.resetFilter = resetFilter;
  vm.disableFilter = disableFilter;

  function disableFilter () {
    var allOpps = vm.data.activeOpportunities;
    if (vm.view.nowShowing === 'archived') {
      allOpps = vm.data.archivedOpportunities;
    }
    if (allOpps.length === 0) {
      vm.data.filterValue = '';
      return true;
    }
    return false;
  }

  function resetFilter () {
    vm.data.filterValue = '';
    runDataFilter(vm.data.filterValue);
  }

  function runDataFilter (searchString) {
    var oppsToFilter = vm.data.activeOpportunities;
    if (vm.view.nowShowing === 'archived') {
      oppsToFilter = vm.data.archivedOpportunities;
    }
    vm.visibleOpportunities = _.filter(oppsToFilter, function (opportunityContainer) {
      var opportunityData = getOpportunityData(opportunityContainer);
      var matches = function () {
        return (opportunityData.company.name && opportunityData.company.name.toLowerCase().search(searchString.toLowerCase()) !== -1) ||
          (opportunityData.company.location && opportunityData.company.location.toLowerCase().search(searchString.toLowerCase()) !== -1) ||
          (opportunityData.job_title && opportunityData.job_title.toLowerCase().search(searchString.toLowerCase()) !== -1);
      };
      if (!opportunityData.company.name) {
        return false;
      } else {
        return matches();
      }
    });
  }

  function disableCompareButton () {
    return companyCompare.count() < 2;
  }

  function showComparisonView () {
    $rootScope.$broadcast('showComparisonView');
  }

  function showActiveOpportunities () {
    vm.view.nowShowing = 'active';
    vm.visibleOpportunities = vm.data.activeOpportunities;
    if (vm.data.filterValue) {
      runDataFilter(vm.data.filterValue);
    }
  }

  function showArchivedOpportunities () {
    vm.view.nowShowing = 'archived';
    vm.visibleOpportunities = vm.data.archivedOpportunities;
    if (vm.data.filterValue) {
      runDataFilter(vm.data.filterValue);
    }
  }

  function sortOpportunities (opportunities, skipSort) {
    if (!skipSort) {
      if (vm.containerType === 'grid') {
        $rootScope.$broadcast('sortableTableSort');
        return opportunities;
      } else {
        opportunities.sort(function (a, b) {
          var opp1 = getOpportunityData(a);
          var opp2 = getOpportunityData(b);
          var tempComanyScore1 =  scoreHelpers.getScore(opp1);
          var tempComanyScore2 = scoreHelpers.getScore(opp2);
          var dateVal1 = new Date(opp1.created_at).getTime() / 10000;
          var dateVal2 = new Date(opp2.created_at).getTime() / 10000;
          if (tempComanyScore1 === '-') {
            tempComanyScore1 = -1;
          }
          if (tempComanyScore2 === '-') {
            tempComanyScore2 = -1;
          }
          if (opp1.pinned) {
            if (opp2.pinned) {
              if (tempComanyScore1 > tempComanyScore2) {
                return -1;
              } else if (tempComanyScore2 > tempComanyScore1) {
                return 1;
              } else {
                if (dateVal1 > dateVal2) {
                  return -1;
                } else if (dateVal2 > dateVal1) {
                  return 1;
                } else {
                  return 0;
                }
              }
            } else {
              return -1;
            }
          }
          if (opp2.pinned) {
            if (!opp1.pinned) {
              return 1;
            }
          }
          if (tempComanyScore1 > tempComanyScore2) {
            return -1;
          } else if (tempComanyScore2 > tempComanyScore1) {
            return 1;
          } else {
            if (dateVal1 > dateVal2) {
              return -1;
            } else if (dateVal2 > dateVal1) {
              return 1;
            } else {
              return 0;
            }
          }
        });
      }
    }
  }

  function getOpportunityData (opportunityContainer) {
    if (vm.containerType === 'cards') {
      return opportunityContainer.data;
    }
    return opportunityContainer;
  }

  // initialize data for opportunities
  vm.visibleOpportunities = vm.data.activeOpportunities;
  if (vm.containerType === 'cards') {
    window.hpAllCardsLoaded = false;
  }
  refreshOpps();
  function refreshOpps () {
    opportunitiesData.getAll({forceRefresh: false})
      .then(function successCallback (opportunities) {
        gotOpportunities(opportunities);
      }).catch(function errorCallback () {
        console.error('error getting opportunities');
      });
  }
  function gotOpportunities (opportunities) {
    if (_.size(opportunities) > 0) {
      // small timeout to make this async in case `.then` is immediate
      $timeout(function () {
        _.each(opportunities, function (opportunityContainer) {
          oppHandler(opportunityContainer, true);
        });
        sortOpportunities(vm.data.activeOpportunities);
        sortOpportunities(vm.data.archivedOpportunities);
        $rootScope.$broadcast('subheaderGotOpportunities', _.size(opportunities));
      }, 10);
    } else {
      $rootScope.$broadcast('subheaderGotOpportunities', 0);
    }
  }
  function oppHandler (idOrOpportunityContainer, skipSort) {
    var opportunityContainer;
    if (typeof idOrOpportunityContainer === 'number') {
      opportunityContainer = opportunitiesData.getOpp(idOrOpportunityContainer);
    } else {
      opportunityContainer = idOrOpportunityContainer;
    }
    opportunityContainer = vm.opportunitySetupFunc(opportunityContainer);
    var opportunityData = getOpportunityData(opportunityContainer);
    var indexInArchived = vm.data.archivedOpportunities.findIndex(function (element) {
      var elData = getOpportunityData(element);
      return elData.id === opportunityData.id;
    });
    var indexInActive = vm.data.activeOpportunities.findIndex(function (element) {
      var elData = getOpportunityData(element);
      return elData.id === opportunityData.id;
    });
    if (opportunityData.archived) {
      if (indexInActive > -1) {
        vm.data.activeOpportunities.splice(indexInActive, 1);
      }
      if (indexInArchived > -1) {
        vm.data.archivedOpportunities[indexInArchived] = opportunityContainer;
        sortOpportunities(vm.data.archivedOpportunities, skipSort);
      } else {
        vm.data.archivedOpportunities.push(opportunityContainer);
        sortOpportunities(vm.data.archivedOpportunities, skipSort);
      }
    } else {
      if (indexInArchived > -1) {
        vm.data.archivedOpportunities.splice(indexInArchived, 1);
      }
      if (indexInActive > -1) {
        vm.data.activeOpportunities[indexInActive] = opportunityContainer;
        sortOpportunities(vm.data.activeOpportunities, skipSort);
      } else {
        vm.data.activeOpportunities.push(opportunityContainer);
        sortOpportunities(vm.data.activeOpportunities, skipSort);
      }
    }
    if (vm.data.searchVal) {
      vm.doSearch(vm.data.searchVal);
    }
  }

  var refetchAllOpportunitiesDoneCleanupFunc = $rootScope.$on('refetchAllOpportunitiesDone', function() {
    opportunitiesData.getAll()
      .then(function successCallback (opportunities) {
        gotOpportunities(opportunities);
      }).catch(function errorCallback () {
        console.error('error getting opportunities');
      });
  });
  var archiveCleanupFunc = $rootScope.$on('updatingArchived', function (e, id) {
    console.log('updating archived');
    oppHandler(id);
    console.log('updated archived');
    console.log('visible: ' + vm.visibleOpportunities.length);
    console.log('archived: ' + vm.data.archivedOpportunities.length);
    console.log('active: ' + vm.data.activeOpportunities.length);
  });
  var setOppCleanupFunc = $rootScope.$on('setOpp', function (e, id) {
    oppHandler(id);
  });
  var setOppGdDataCleanupFunc = $rootScope.$on('setOppGdData', function (e, id) {
    oppHandler(id);
  });
  var setOppCbDataCleanupFunc = $rootScope.$on('setOppCbData', function (e, id) {
    oppHandler(id);
  });
  var pinCleanupFunc = $rootScope.$on('updatingPinned', function (e, id) {
    oppHandler(id);
  });
  var cardCleanupFunc = $rootScope.$on('cardUpdated', function (e, args) {
    oppHandler(args.id);
  });
  function clearCompanyCompare () {
    companyCompare.clear();
    vm.data.activeOpportunities.forEach(function (opportunityContainer) {
      var opp = getOpportunityData(opportunityContainer);
      opp.selected = false;
      opp.compareCompany = false;
    });
    vm.data.archivedOpportunities.forEach(function (opportunityContainer) {
      var opp = getOpportunityData(opportunityContainer);
      opp.selected = false;
      opp.compareCompany = false;
    });
  }
  this.$onDestroy = function () {
    refetchAllOpportunitiesDoneCleanupFunc();
    archiveCleanupFunc();
    setOppCleanupFunc();
    setOppGdDataCleanupFunc();
    setOppCbDataCleanupFunc();
    pinCleanupFunc();
    cardCleanupFunc();
    clearCompanyCompare();
  };
}

})();
