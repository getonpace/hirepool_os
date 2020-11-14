(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpSortableTable', hpSortableTable);

function hpSortableTable() {
  var directive = {
    templateUrl: 'views/directives/sortable_table.html',
    restrict: 'E',
    scope: {
      tableData: '=',
      defaultSort: '@'
    },
    link: linkFunc,
    controller: HpSortableTableController,
    controllerAs: 'vm',
    bindToController: true
  };
  return directive;

  function linkFunc(/*scope, element, attrs*/) {
    /* */
  }
}

HpSortableTableController.$inject = ['moment', '$rootScope', '$scope', 'opportunitiesData', 'selectedCardData', '$timeout'];
function HpSortableTableController (moment, $rootScope, $scope, opportunitiesData, selectedCardData, $timeout) {
  var vm = this;
  vm.view = {};
  vm.view.sortState = {};
  if (vm.defaultSort) {
    var fieldObj = vm.tableData.fields.find(function (field) {
      return field.name === vm.defaultSort;
    });
    vm.view.sortState = {
      fieldObj: fieldObj,
      field: vm.defaultSort,
      descending: true
    };
  }

  vm.sortRows = sortRows;
  vm.getThumbClass = getThumbClass;
  vm.showOppDetails = showOppDetails;
  vm.parse = parse;
  vm.setCardData = setCardData;

  var parsers = {};
  parsers.getAbbrevDate = function (dateString) {
    if (dateString) {
      return moment(dateString).format('MM-DD-YY');
    }
  };
  parsers.joinUserTrackingTags = function (userTrackingTags) {
    return userTrackingTags.reduce(function (prev, tag) {
      if (prev) {
        return prev + ', ' + tag.tag;
      } else {
        return tag.tag;
      }
    }, '');
  };
  parsers.getNestedAttribute = function (data, field) {
    if (field.nestedAttribute && data) {
      return data[field.nestedAttribute];
    }
  };
  parsers.setPercent0 = function (data) {
    if (data) {
      return (data * 100).toFixed() + '%';
    }
  };
  parsers.setDollars = function (data) {
    if (data) {
      return '$' + data.toFixed(2);
    }
  };
  parsers.setFloat2 = function (data) {
    if (data) {
      return data.toFixed(2);
    }
  };
  parsers.setInt = function (data) {
    if (data) {
      return data.toFixed();
    }
  };
  parsers.setPenniesToDollars = function (data) {
    if (data) {
      return '$' + (data / 100).toFixed(2);
    }
  };

  function setCardData (oppId) {
    if (oppId) {
      var card = opportunitiesData.getOpp(oppId).data;
      selectedCardData.set(card);
      $rootScope.$broadcast('updatingCard');
    }
  }

  // for admin/user_profile tables
  function showOppDetails (oppId) {
    if (oppId) {
      $rootScope.$broadcast('admin-show-opp-details', oppId);
    }
  }

  function parse (data, field, row) {
    var parser;
    if (field.parser) {
      parser = parsers[field.parser];
    } else if (field.displayParser) {
      parser = parsers[field.displayParser];
    }
    if (data && parser) {
      return parser(data, field, row);
    }
    return data;
  }

  function getThumbClass (thumb) {
    if (thumb === 'Up') {
      return 'fa-thumbs-up';
    }
    if (thumb === 'Sideways') {
      return 'fa-hand-stop-o';
    }
    if (thumb === 'Down') {
      return 'fa-thumbs-down';
    }
    return '';
  }

  function sortRows (field, noChange) {
    var descending = true;
    if (noChange) {
      field = vm.view.sortState.fieldObj;
      descending = vm.view.sortState.descending;
    } else {
      if (vm.view.sortState.field === field.name) {
        descending = !vm.view.sortState.descending;
        vm.view.sortState.descending = descending;
      } else {
        vm.view.sortState = {
          fieldObj: field,
          field: field.name,
          descending: descending
        };
      }
    }
    if (vm.view.sortState.field) {
      vm.tableData.rows.sort(function compareFunc (rowA, rowB) {
        var aCompVal, bCompVal;
        if (field.parser && parsers[field.parser] && field.parser !== 'getAbbrevDate') {
          aCompVal = parsers[field.parser](rowA[field.name], field);
          bCompVal = parsers[field.parser](rowB[field.name], field);
        } else {
          aCompVal = rowA[field.name];
          bCompVal = rowB[field.name];
        }
        if (field.type === 'opportunity_actions') {
          if (rowA.pinned !== rowB.pinned) {
            if (descending) {
              if (rowA.pinned) {
                return -1;
              } else {
                return 1;
              }
            } else {
              if (rowA.pinned) {
                return 1;
              } else {
                return -1;
              }
            }
          }
          if (rowA.archived !== rowB.archived) {
            if (descending) {
              if (rowA.archived) {
                return 1;
              } else {
                return -1;
              }
            } else {
              if (rowA.archived) {
                return -1;
              } else {
                return 1;
              }
            }
          }
          return getDateSort(rowA.updated_at, rowB.updated_at, descending);
        } else if (field.type === 'numeric' || field.sort_type === 'numeric') {
          return getNumericSort(aCompVal, bCompVal, descending);
        } else if (field.type === 'date' || field.sort_type === 'date') {
          return getDateSort(aCompVal, bCompVal, descending);
        } else {
          return getAlphaSort(aCompVal, bCompVal, descending);
        }
      });
    }
  }

  function getAlphaSort (aCompVal, bCompVal, descending) {
    var aVal = aCompVal;
    var bVal = bCompVal;
    if (aVal === bVal) {
      return 0;
    }
    if (typeof aCompVal === 'string') {
      aVal = aCompVal.toLowerCase();
    }
    if (typeof bCompVal === 'string') {
      bVal = bCompVal.toLowerCase();
    }
    if (descending) {
      if (!aVal) {
        return 1;
      }
      if (!bVal) {
        return -1;
      }
      if (aVal < bVal) {
        return -1;
      }
      return 1;
    } else {
      if (!aVal) {
        return -1;
      }
      if (!bVal) {
        return 1;
      }
      if (aVal < bVal) {
        return 1;
      }
      return -1;
    }
  }

  function getNumericSort (aCompVal, bCompVal, descending) {
    var aVal = parseFloat(aCompVal, 10);
    var bVal = parseFloat(bCompVal, 10);
    if (aVal === bVal) {
      return 0;
    }
    if (isNaN(aVal)) {
      aVal = -999999;
    }
    if (isNaN(bVal)) {
      bVal = -99999;
    }
    if (descending) {
      if (aVal < bVal) {
        return 1;
      }
      return -1;
    } else {
      if (aVal < bVal) {
        return -1;
      }
      return 1;
    }
  }

  function getDateSort (aCompVal, bCompVal, descending) {
    var aVal = '';
    var bVal = '';
    if (aCompVal) {
      aVal = moment(aCompVal);
    }
    if (bCompVal) {
      bVal = moment(bCompVal);
    }
    if (aVal === bVal) {
      return 0;
    }
    if (!aVal) {
      if (descending) {
        return 1;
      }
      return -1;
    }
    if (!bVal) {
      if (descending) {
        return -1;
      }
      return 1;
    }
    if (aVal.isSame(bVal)) {
      return 0;
    }
    if (descending) {
      if (aVal.isBefore(bVal)) {
        return 1;
      }
      return -1;
    } else {
      if (aVal.isBefore(bVal)) {
        return -1;
      }
      return 1;
    }
  }

  var lastSortRequestedAt = 0;
  var sortTimer = null;
  function runSortOnTimer () {
    if (lastSortRequestedAt > (new Date().getTime() - 800)) {
      $timeout.cancel(sortTimer);
      sortTimer = $timeout(runSortOnTimer, 800);
    } else {
      $timeout.cancel(sortTimer);
      sortRows(null, true);
    }
  }

  if (vm.defaultSort && vm.view.sortState.fieldObj) {
    sortRows(null, true);
  }
  var sortableTableSortCleanupFunc = $rootScope.$on('sortableTableSort', function () {
    lastSortRequestedAt = new Date().getTime();
    runSortOnTimer();
  });

  $scope.$on('$destroy', function() {
    sortableTableSortCleanupFunc();
  });

}

})();
