'use strict';

angular.module('hirepoolApp').directive('companyAutoComplete', function ($http, _, $timeout) {

  return {
    templateUrl: 'views/directives/autocomplete.html',
    restrict: 'E',
    scope: {
      titleLabel: '@',
      inputSize: '@',
      suggestions: '=',
      valueKey: '@',
      placeholder: '@',
      uid: '@',
      inputName: '@',
      handleValidations: '=',
      updateEntireModel: '=',
      valueIsRequired: '=',
    },
    require: '?ngModel',
    focusFirstInput: true,
    link: function (scope, element, attrs, ngModel) {
      if (!ngModel) {
        return;
      }

      scope.inputClass = 'input';
      if (scope.inputSize) {
        scope.inputClass = 'input-' + scope.inputSize;
      }

      if (!scope.inputName) {
        scope.inputName = scope.uid;
      }

      ngModel.$render = function () {
        if (ngModel.$viewValue) {
          var cur = ngModel.$viewValue;
          scope.currentVal = cur;
          scope.currentVal.selectedIndex = -1;
          scope.currentVal.predictions = [];
        } else {
          scope.currentVal = {
            selectedIndex: -1,
            predictions: [],
          };
          scope.currentVal[scope.valueKey] = '';
        }
      };

      scope.handleInputChange = function () {
        scope.getSuggestions();
        if (scope.handleValidations) {
          scope.handleValidations();
        }
      };

      scope.getSuggestions = function () {
        var val = scope.currentVal[scope.valueKey];
        if (val && val.length > 0) {
          var valueSplitStringArray = val.split(' ');
          var filteredPredictionsArray = [];
          $http.get('/api/company_autocomplete/?query=' + val)
            .then(function successCallback (response) {
              var suggestions = response.data;
              _.forEach(suggestions, function (suggestion) {
                var everySubstringExists = valueSplitStringArray.every(function (substring) {
                  if (!suggestion[scope.valueKey] || !suggestion[scope.valueKey].toLowerCase) {
                    return false;
                  } else {
                    return suggestion[scope.valueKey].toLowerCase().indexOf(substring.toLowerCase()) >= 0;
                  }
                });
                if (everySubstringExists) {
                  suggestion.valueSplitStringArray = valueSplitStringArray;
                  filteredPredictionsArray.push(suggestion);
                }
              });
              scope.currentVal.predictions = filteredPredictionsArray;
            }, function errorCallback () {
              scope.currentVal.selectedIndex = -1;
              scope.currentVal.predictions = [];
            });
        } else {
          scope.currentVal.selectedIndex = -1;
          scope.currentVal.predictions = [];
        }
      };


      scope.autocompleteKeyDown = function (event) {
        if (event.keyCode === 38) {
          event.preventDefault();
          // console.log('up arrow');
          if (scope.currentVal.selectedIndex > -1) {
            scope.currentVal.selectedIndex--;
          }
        } else if (event.keyCode === 39) {
          // console.log('right arrow');
        } else if (event.keyCode === 40) {
          event.preventDefault();
          // console.log('down arrow');
          if (scope.currentVal.selectedIndex < scope.currentVal.predictions.length - 1) {
            scope.currentVal.selectedIndex++;
          }
        } else if (event.keyCode === 37) {
          // console.log('left arrow');
        } else if (event.keyCode === 13) {
          event.preventDefault();
          // console.log('return');
          if (scope.currentVal.selectedIndex === -1) {
            scope.setCurrentValue();
          } else {
            scope.setCurrentValue(scope.currentVal.predictions[scope.currentVal.selectedIndex]);
          }
        }
      };

      scope.setCurrentValue = function (selectedValue) {
        if (selectedValue) {
          if (scope.updateEntireModel) {
            scope.currentVal = selectedValue;
          } else {
            scope.currentVal[scope.valueKey] = selectedValue[scope.valueKey];
          }
          scope.currentVal.selectedIndex = -1;
          scope.currentVal.predictions = [];
        } else {
          scope.currentVal.predictions = [];
        }
        $timeout(function () {
          if(!scope.$$phase) {
            scope.$digest();
          }
        }, 100);
      };

      scope.$watch('currentVal', function(currentVal) {
        ngModel.$setViewValue(currentVal);
      }, true);
    }
  };
});
