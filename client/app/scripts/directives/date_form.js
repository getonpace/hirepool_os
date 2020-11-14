'use strict';

angular.module('hirepoolApp').directive('hpDateForm', function (moment, $filter, _, $rootScope) {

  return {
    templateUrl: 'views/directives/date_form.html',
    restrict: 'E',
    scope: {
      inputSize: '@',
      dateLabel: '@',
      uniqueId: '@',
      includeTime: '@',
    },
    require: '?ngModel',
    link: function (scope, element, attrs, ngModel) {
      if (!ngModel) {
        return;
      }

      ngModel.$render = function() {
        var mDate = moment();
        if (ngModel.$viewValue) {
          mDate = moment(ngModel.$viewValue);
          scope.date = {
            day: mDate.format('DD'),
            month: mDate.format('MM'),
            year: mDate.format('YYYY'),
            time: mDate.format('hh:mma')
          };
          scope.pickerDate = mDate;
        } else {
          scope.date = {
            day: '',
            month: '',
            year: '',
            time: '',
          };
        }
      };

      // HACK: trigger re-render manually to update initial values
      scope.$parent.reRenderDateForm = function () {
        ngModel.$render();
      };

      scope.inputClass = 'input';
      if (scope.inputSize) {
        scope.inputClass = 'input-' + scope.inputSize;
      }

      scope.dropdown = {};
      scope.dropdown.show = false;
      scope.dropdown.toggleDropdown = toggleDropdown;

      if (scope.includeTime) {
        scope.datetimepickerConfig = {
          minView: 'minute',
          minuteStep: 15,
        };
      } else {
        scope.datetimepickerConfig = {
          minView: 'day',
        };
      }

      scope.onTimeSet = onTimeSet;
      scope.clientValidationErrorDelegator = clientValidationErrorDelegator;
      scope.checkBlurForMonth = checkBlurForMonth;
      scope.checkBlurForDay = checkBlurForDay;

      function clientValidationErrorDelegator () {
        if (scope.hasClientValidationErrors) {
          scope.hasClientValidationErrors();
        }
        if (scope.vm && scope.vm.hasClientValidationErrors) {
          scope.vm.hasClientValidationErrors();
        }
      }

      function toggleDropdown (ev) {
        if (ev && ev.target && ev.target.classList) {
          if (ev.target.classList.contains('fa-calendar') || ev.target.classList.contains('hp-diy-dd-button')) {
            scope.dropdown.show = !scope.dropdown.show;
          }
        } else if (ev === 'force-toggle') {
          scope.dropdown.show = !scope.dropdown.show;
        } else if (ev === 'force-close') {
          scope.dropdown.show = false;
        }
      }

      function stringContainsDigitsOnly (val) {
        return /^\d+$/.test(val);
      }

      function checkBlurForMonth () {
        if (scope.date.month.length === 1 && parseInt(scope.date.month) === 1) {
          scope.date.month = '01';
          if(!scope.$$phase) {
            scope.$digest();
          }
        }
      }

      function checkBlurForDay () {
        if (scope.date.day.length === 1 && _.indexOf([1, 2, 3], parseInt(scope.date.day)) !== -1) {
          scope.date.day = '0' + scope.date.day;
          if(!scope.$$phase) {
            scope.$digest();
          }
        }
      }

      function onTimeSet (newDate) {
        scope.dropdown.toggleDropdown('force-close');
        if (newDate) {
          var mDate = moment(newDate);
          scope.date = {
            day: mDate.format('DD'),
            month: mDate.format('MM'),
            year: mDate.format('YYYY'),
            time: mDate.format('hh:mma')
          };
          ngModel.$setViewValue(mDate.format());
          ngModel.$render();
        }
      }

      scope.$watch('date.time', function (time) {
        if (time) {
          if (isNaN(time[0]) || (time.length === 2 && (isNaN(time[1]) && time[1] !== ':')) || (time.length === 4 && isNaN(time[3])) || (time.length === 5 && isNaN(time[4]))) {
            scope.date.time = scope.date.time.slice(0, -1);
          } else if (time.length === 1 && parseInt(time) > 1) {
            scope.date.time = '0' + time;
          } else if (time.length === 2 && stringContainsDigitsOnly(time)) {
            if (parseInt(time) > 12) {
              time = '12';
            }
            scope.date.time = time + ':';
          } else if (time.length === 2 && time === '1:') {
            scope.date.time = '0' + scope.date.time;
          } else if (time.length === 4 && parseInt(time[3]) > 5)  {
            scope.date.time = scope.date.time.slice(0, -1);
          } else if (time.length === 6 && time[5] !== 'a' && time[5] !== 'p' && time[5] !== 'A' && time[5] !== 'P')  {
            scope.date.time = scope.date.time.slice(0, -1);
          } else if (time.length === 6 && (time[5] === 'a' || time[5] === 'p'))  {
            scope.date.time = scope.date.time + 'm';
          } else if (time.length === 6 && (time[5] === 'A' || time[5] === 'P'))  {
            scope.date.time = scope.date.time + 'M';
          }
        } else {
          scope.date.time = '';
        }
      });

      scope.$watch('date.day', function (day) {
        if (day) {
          if (day.length === 1 && parseInt(day) > 3) {
            scope.date.day = '0' + day;
          } else if (parseInt(day) > 31) {
            scope.date.day = 31;
          }
        } else {
          scope.date.day = '';
        }
      });

      scope.$watch('date.month', function (month) {
        if (month) {
          if (month.length === 1 && parseInt(month) > 1) {
            scope.date.month = '0' + month;
          } else if (parseInt(month) > 12) {
            scope.date.month = 12;
          }
        } else {
          scope.date.month = '';
        }
      });

      scope.$watch('date.year', function (year) {
        if (year) {
          scope.date.year = year;
        } else {
          scope.date.year = '';
        }
      });

      scope.$watch('date', function(date) {
        if (date && date.year && date.month && date.day) {
          //TODO: Make validation stricter
          var yearIsValid = (date.year.length === 4);
          var monthIsValid = (date.month < 13 && date.month.length === 2);
          var dayIsValid = (date.day < 32 && date.day.length === 2);

          ngModel.$setValidity('yearRequired', yearIsValid ? true : false);
          ngModel.$setValidity('monthRequired', monthIsValid ? true : false);
          ngModel.$setValidity('dayRequired', dayIsValid ? true : false);

          if (scope.includeTime) {
            if (date.time) {
              var timeIsValid = (date.time.length === 7);
              ngModel.$setValidity('timeRequired', timeIsValid ? true : false);
              if (yearIsValid && monthIsValid && dayIsValid && timeIsValid) {
                var momentObjectWithTime = moment(date.month + '-' + date.day + '-' + date.year + ' ' + date.time, 'MM-DD-YYYY hh:mma Z');
                if (momentObjectWithTime.isValid()) {
                  ngModel.$setViewValue(momentObjectWithTime.format());
                  scope.pickerDate = momentObjectWithTime;
                }
              } else {
                ngModel.$setViewValue(null);
                scope.pickerDate = null;
              }
            } else {
              ngModel.$setViewValue(null);
              scope.pickerDate = null;
            }
          } else {
            if (yearIsValid && monthIsValid && dayIsValid) {
              var momentObject = moment(date.month + '-' + date.day + '-' + date.year, 'MM-DD-YYYY Z');
              if (momentObject.isValid()) {
                ngModel.$setViewValue(momentObject.format());
                scope.pickerDate = momentObject;
              }
            } else {
              ngModel.$setViewValue(null);
              scope.pickerDate = null;
            }
          }
        } else {
          ngModel.$setViewValue(null);
          scope.pickerDate = null;
        }
        scope.clientValidationErrorDelegator();
      }, true);

      $rootScope.$on('close-dateform-dropdown', function () {
        scope.dropdown.toggleDropdown('force-close');
      });

    }
  };
});
