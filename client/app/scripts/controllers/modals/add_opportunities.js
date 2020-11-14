(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('ModalsAddOpportunitiesCtrl', ModalsAddOpportunitiesCtrl);

ModalsAddOpportunitiesCtrl.$inject = ['ConstantsFactory', '$rootScope', 'opportunitiesData', '_', 'jQuery', '$http', '$timeout', 'eventRecorder', 'Upload', '$location'];
function ModalsAddOpportunitiesCtrl (ConstantsFactory, $rootScope, opportunitiesData, _, jQuery, $http, $timeout, eventRecorder, Upload, $location) {
  var vm = this;
  vm.data = {};
  vm.view = {};
  vm.errors = {};
  vm.view.statesOrder = {
    'import': 0,
    'approve': 1,
    'match': 2,
    'done': 3
  };
  vm.view.opportunityOptions = {
    name: 'Company Name',
    job_title: 'Job Title',
    job_url: 'Job Posting URL',
    notes: 'Notes',
    location: 'Company Location',
    source: 'Opportunity Source',
    role: 'Opportunity Field',
    applied: 'Applied',
    applied_on: 'Applied On',
    referrer_name: 'Referrer Name',
    referrer_email: 'Referrer Email'
  };
  vm.view.selectedOptions = [];
  vm.view.eventModalTitles = ConstantsFactory.EventModalTitles;
  vm.view.eventModalSubtitles = ConstantsFactory.EventModalSubtitles;
  vm.view.eventModalStrings = ConstantsFactory.EventModalStrings;
  vm.view.dataIsValid = true;
  vm.view.matchFirstStep = true;
  vm.view.matchSecondStep = false;
  vm.view.showHiddenColumns = false;
  vm.view.ignoreColumns = false;
  vm.view.showLoadingScreen = false;

  vm.fullModalReset = fullModalReset;
  vm.hasClientValidationErrors = hasClientValidationErrors;
  vm.stepNext = stepNext;
  vm.stepBack = stepBack;
  vm.validateData = validateData;
  vm.submitData = submitData;
  vm.closeModal = closeModal;
  vm.getActiveProgressClass = getActiveProgressClass;
  vm.upload = upload;
  vm.verifyHeaderRow = verifyHeaderRow;
  vm.hideColumn = hideColumn;
  vm.showColumn = showColumn;
  vm.hasBeenSelected = hasBeenSelected;
  vm.hiddenColumnCount = hiddenColumnCount;
  vm.toggleHeaderRow = toggleHeaderRow;
  vm.toggleHiddenColumnVisibility = toggleHiddenColumnVisibility;
  vm.totalCount = totalCount;
  vm.aprovedAndSemiApprovedCount = aprovedAndSemiApprovedCount;
  vm.approvedCount = approvedCount;
  vm.semiApprovedCount = semiApprovedCount;
  vm.unApprovedCount = unApprovedCount;
  vm.isApproved = isApproved;
  vm.isSemiApproved = isSemiApproved;
  vm.isUnapproved = isUnapproved;
  vm.company_key = company_key;
  vm.setCompany = setCompany;
  vm.clearField = clearField;
  vm.getCompanySuggestions = getCompanySuggestions;
  vm.closeErrorPopup = closeErrorPopup;
  vm.toggleIgnoreColumns = toggleIgnoreColumns;
  vm.backToDashboard = backToDashboard;
  vm.showErrorPopup = showErrorPopup;

  function showErrorPopup () {
    var e = vm.errors;
    return (e.csv_req || e.company_name_req || e.csvFileTypeError || e.csvParseError || e.genericCheckCsvError || e.no_company_name_error || e.applied_boolean_error || e.applied_on_date_error);
  }

  function upload (file) {
    resetValidations();
    if (file) {
      Upload.upload({
          url: '/api/interviews/check_csv',
          data: {file: file}
        }).success(function (data) {
          vm.data.opportunities = data.csv;
          vm.data.fileName = data.fileName;
          setState('approve');
        }).error(function (data) {
          if (data && data.error && data.error === 'Invalid file type') {
            vm.errors.csvFileTypeError = true;
          } else if (data && data.error && data.error === 'Error reading CSV') {
            vm.errors.csvParseError = true;
          } else {
            vm.errors.genericCheckCsvError = true;
          }
        });
    }
  }

  jQuery('#filedrag')
  .on('dragover', function() {
    jQuery(this).addClass('dragging');
    return false;
  })
  .on('dragleave', function() {
    jQuery(this).removeClass('dragging');
    return false;
  })
  .on('drop', function() {
    jQuery(this).removeClass('dragging');
  });

  function verifyHeaderRow(isAHeader) {
    vm.data.opportunities[0].header = isAHeader;
    vm.data.opportunityColumns = zipCsvColumns(vm.data.opportunities);
    stepNext();
  }

  var zipCsvColumns = function(opportunities) {
    var rows = opportunities.map(function(opportunity) {
      return opportunity.row;
    });

    // use .apply as a workaround because .zip doesn't accept array of arrays
    // https://stackoverflow.com/questions/38112725/can-the-lodash-zip-function-work-with-an-array-of-arrays
    var columns = _.zip.apply(_, rows);

    columns = columns.map(function(column, index) {
      var columnData = column.map(function(data, rowIndex) {
        return {
          value: data,
          header: opportunities[rowIndex].header,
          rowIndex: opportunities[rowIndex].id
        };
      });

      return {
        hidden: false,
        visible: true,
        field: vm.view.selectedOptions[index],
        column: columnData
      };
    });

    return columns;
  };

  function hideColumn(column) {
    column.hidden = true;
    if (vm.view.showHiddenColumns) {
      column.visible = true;
    } else {
      column.visible = false;
    }
  }

  function showColumn(column) {
    column.hidden = false;
    column.visible = true;
  }

  function hasBeenSelected(fieldName) {
    var selected = _.filter(vm.data.opportunityColumns, function(column) {
      return column.field === fieldName;
    });

    if (selected.length > 0) {
      return true;
    }
  }

  function hiddenColumnCount() {
    return _.filter(vm.data.opportunityColumns, function(column) {
      return column.hidden;
    }).length;
  }

  function toggleHeaderRow () {
    var headerRow = _.map(vm.data.opportunityColumns, function(column) {
      return column.column[0];
    });

    _.forEach(headerRow, function(item) {
      item.header = !item.header;
    });
  }

  function toggleHiddenColumnVisibility () {
    vm.view.showHiddenColumns = !vm.view.showHiddenColumns;
    return _.forEach(vm.data.opportunityColumns, function(column) {
      if (column.hidden) {
        column.visible = vm.view.showHiddenColumns;
      }
    });
  }

  function moveCompanyNamesToFirstColumn() {
    _.each(vm.data.opportunityColumns, function(column, index) {
      if (column.field === 'name') {
        var namesColumn = vm.data.opportunityColumns.splice(index, 1);
        vm.data.opportunityColumns.unshift(namesColumn[0]);
      }
    });
  }

  function validateData() {
    hasClientValidationErrors({submitting: true});
    if (vm.view.dataIsValid) {
      moveCompanyNamesToFirstColumn();
      $http({
        method: 'POST',
        data: {
          opportunity_data_columns: vm.data.opportunityColumns
        },
        url: '/api/interviews/validate_csv_data'
      }).then(function(response) {
        vm.view.showLoadingScreen = false;
        vm.view.matchFirstStep = false;
        vm.view.matchSecondStep = true;
        vm.data.opportunityColumns = response.data.data;
        vm.data.opportunityColumns.push({
          field: 'domain',
          hidden: true,
          visible: true,
          column: []
        });
        _.each(vm.data.opportunityColumns[0].column, function(column) {
          vm.data.opportunityColumns[vm.data.opportunityColumns.length - 1].column.push({
            value: column.domain ? column.domain : '',
            rowIndex: column.rowIndex,
            header: column.header,
          });
        });
        if (response.data.parse_errors) {
          if (response.data.parse_errors.applied_boolean_error) {
            vm.errors.applied_boolean_error = true;
            vm.errors.applied_boolean_error_values = _.uniq(response.data.parse_errors.applied_boolean_error);
          }
          if (response.data.parse_errors.applied_on_date_error) {
            vm.errors.applied_on_date_error = true;
            vm.errors.applied_on_date_error_values = _.uniq(response.data.parse_errors.applied_on_date_error);
          }
          if (response.data.parse_errors.no_company_name_error) {
            vm.errors.no_company_name_error = true;
            vm.errors.no_company_name_error_count = _.uniq(response.data.parse_errors.no_company_name_error);
          }
        }
      }).catch(function (error) {
        vm.view.showLoadingScreen = false;
        console.error(error);
      });
    }
  }

  function submitData() {
    hasClientValidationErrors({submitting: true});
    if (vm.view.dataIsValid) {
      $http({
        method: 'POST',
        data: {
          opportunities: vm.data.opportunityColumns
        },
        url: '/api/interviews/save_csv_data'
      }).then(function() {
        vm.view.showLoadingScreen = false;
        $rootScope.$broadcast('refetchAllOpportunities');
        stepNext();
      }).catch(function (error) {
        vm.view.showLoadingScreen = false;
        console.error(error);
      });
    }
  }

  function totalCount(columns) {
    if (vm.view.state === 'match' && columns && columns[0]) {
      var count = columns.length;
      if (columns[0].header) {
        count--;
      }
      return count;
    }
  }

  function aprovedAndSemiApprovedCount(columns) {
    return _.filter(columns, function(column) {
      return vm.isApproved(column) || vm.isSemiApproved(column) && !column.header;
    }).length;
  }

  function approvedCount(columns) {
    return _.filter(columns, function(column) {
      return vm.isApproved(column) && !column.header;
    }).length;
  }

  function semiApprovedCount(columns) {
    return _.filter(columns, function(column) {
      return vm.isSemiApproved(column) && !column.header;
    }).length;
  }

  function unApprovedCount(columns) {
    return _.filter(columns, function(column) {
      return vm.isUnapproved(column) && !column.header;
    }).length;
  }

  function isApproved (data) {
    // console.log('isApproved');
    // console.log(data);
    return data.valid && data.value && data.domain;
  }

  function isSemiApproved (data) {
    return !data.valid && data.value && !data.domain;
  }

  function isUnapproved (data) {
    return !data.valid && !data.value && !data.domain;
  }

  function company_key (company, event) {
    if (event.keyCode === 38) {
      event.preventDefault();
      //
      if (company.selectedIndex > -1) {
        company.selectedIndex--;
      }
    } else if (event.keyCode === 39) {
      //
    } else if (event.keyCode === 40) {
      event.preventDefault();
      if (company.selectedIndex < company.predictions.length - 1) {
        company.selectedIndex++;
      }
    } else if (event.keyCode === 37) {
      //
    } else if (event.keyCode === 13) {
      event.preventDefault();
      if (company.selectedIndex === -1) {
        vm.setCompany();
      } else {
        vm.setCompany(company, company.predictions[company.selectedIndex]);
      }
    }
  }

  function checkIfLastItemsOfComanyNameArray($index) {
    var companyNames = vm.data.opportunityColumns[0].column;
    if (companyNames.length - 3 <= $index && companyNames.length > 2) {
      addDropdownOpenClass();
    }
  }

  function addDropdownOpenClass() {
    var $modelContent = document.querySelector('.opportunities-modal-content');
    $modelContent.classList.add('dropdown-open');
  }

  function removeDropdownOpenClass() {
    var $modelContent = document.querySelector('.opportunities-modal-content');
    $modelContent.classList.remove('dropdown-open');
  }

  function setCompany (company, employer) {
    if (employer) {
      company.value = employer.name;
      company.domain = employer.domain;
      company.selectedIndex = -1;
      company.predictions = [];
      company.valid = true;

      _.filter(vm.data.opportunityColumns[vm.data.opportunityColumns.length - 1].column, function (column) {
        return column.rowIndex === company.rowIndex;
      })[0].value = company.domain;
    } else {
      company.predictions = [];
    }
    removeDropdownOpenClass();
  }

  function clearField (data) {
    data.value = '';
    data.domain = '';
    data.predictions = [];
    data.valid = false;
    removeDropdownOpenClass();
  }

  function getCompanySuggestions (company, $index) {
    if (company.value && company.value.length > 0) {
      // fucking CORS
      $http.get('/api/company_autocomplete/?query=' + company.value)
        .then(function successCallback (response) {
          var employerSplitStringArray = company.value.split(' ');
          var filteredPredictionsArray = [];
          _.forEach(response.data, function (d) {
            var everySubstringExists = employerSplitStringArray.every(function (v) {
              if (!d.name) {
                return false;
              } else {
                return d.name.toLowerCase().indexOf(v.toLowerCase()) >= 0;
              }
            });

            if (everySubstringExists) {
              d.employerSplitStringArray = employerSplitStringArray;
              filteredPredictionsArray.push(d);
            }
          });
          company.predictions = filteredPredictionsArray;
          company.valid = false;
          company.domain = "";

          if (company.predictions.length > 0) {
            checkIfLastItemsOfComanyNameArray($index);
          }

          _.filter(vm.data.opportunityColumns[vm.data.opportunityColumns.length - 1].column, function (column) {
            return column.rowIndex === company.rowIndex;
          })[0].value = "";

        }, function errorCallback () {
          company.selectedIndex = -1;
          company.predictions = [];
          removeDropdownOpenClass();
        });
    } else {
      company.selectedIndex = -1;
      company.predictions = [];
      company.valid = false;
      company.domain = "";
      removeDropdownOpenClass();
    }
  }

  function toggleIgnoreColumns () {
    vm.view.ignoreColumns = !vm.view.ignoreColumns;
  }

  fullModalReset();

  function fullModalReset () {
    resetData();
    resetValidations();
  }

  function resetData () {
    vm.data.opportunities = {};
    vm.data.opportunityColumns = {};
    vm.data.fileName = "";
    vm.view.selectedOptions = [];
    vm.view.showLoadingScreen = false;
    setState('import');
  }

  function resetValidations () {
    vm.view.dataIsValid = true;
    vm.errors = {};
  }

  function hasClientValidationErrors (options) {
    if (options && options.submitting) {
      vm.errors.submitAttempted = true;
    }
    var state = vm.view.state;
    var submitAttempted = vm.errors.submitAttempted;
    if (submitAttempted) {
      resetValidations();
      if (state === 'import') {
        if (!vm.data.opportunities.length) {
          vm.errors.csv_req = true;
          vm.view.dataIsValid = false;
        }
      } else if (state === 'match') {
        var fieldNames = _.map(vm.data.opportunityColumns, function(column) {
          return column.field;
        });
        if (!_.includes(fieldNames, "name")) {
          vm.view.dataIsValid = false;
          vm.errors.company_name_req = true;
        } else {
          vm.view.showLoadingScreen = true;
        }
      }
    }
  }

  function closeErrorPopup () {
    vm.errors.csv_req = false;
    vm.errors.opportunity_source_req = false;
    vm.errors.company_name_req = false;
    vm.errors.csvFileTypeError = false;
    vm.errors.csvParseError = false;
    vm.errors.genericCheckCsvError = false;
    vm.errors.applied_boolean_error_values = false;
    vm.errors.applied_boolean_error = false;
    vm.errors.applied_on_date_error_values = false;
    vm.errors.applied_on_date_error = false;
    vm.errors.no_company_name_error_count = 0;
    vm.errors.no_company_name_error = false;
  }

  function setState (state) {
    vm.view.state = state;
    vm.view.title = vm.view.eventModalTitles[state];
    vm.view.subtitle = vm.view.eventModalSubtitles[state];
    vm.errors.submitAttempted = false;
  }

  function stepNext () {
    var state = vm.view.state;
    hasClientValidationErrors({submitting: true});
    if (vm.view.dataIsValid) {
      if (state === 'import') {
        eventRecorder.trackEvent('upload-csv');
        setState('approve');
      } else if (state === 'approve') {
        eventRecorder.trackEvent('confirm-csv-header');
        setState('match');
        window.columns = vm.data.opportunityColumns;
        vm.view.matchFirstStep = true;
        vm.view.matchSecondStep = false;
      } else if (state === 'match' && vm.view.matchFirstStep) {
        vm.view.matchFirstStep = false;
        vm.view.matchSecondStep = true;
        eventRecorder.trackEvent('confirm-csv-data');
      } else if (state === 'match' && vm.view.matchSecondStep) {
        eventRecorder.trackEvent('complete-csv-upload');
        setState('done');
      }
    }
  }

  function stepBack () {
    var state = vm.view.state;
    resetValidations();
    if (state === 'done') {
      setState('match');
    } else if (state === 'match') {
      if (vm.view.matchSecondStep) {
        vm.view.matchFirstStep = true;
        vm.view.matchSecondStep = false;
      } else {
        setState('approve');
      }
    } else if (state === 'approve') {
      setState('import');
    }
  }

  function backToDashboard () {
    var location = $location.path();
    if (location !== '/' && location !== '/grid_view') {
      $location.path('/');
    }
    closeModal();
  }

  function closeModal () {
    vm.data = {};
    $timeout(function () {
      jQuery('.modal .close-button').trigger('click');
    }, 100);
  }

  function getActiveProgressClass (elementState) {
    if (vm.view.statesOrder[elementState] <= vm.view.statesOrder[vm.view.state]) {
      return 'active';
    }
    return '';
  }

}
})();
