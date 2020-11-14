'use strict';

/**
 * @ngdoc directive
 * @name hirepoolApp.directive:directives
 * @description
 * # directives
 */
var app = angular.module('hirepoolApp');

// color ratings for cool radio button input insanity
// sample usage:
// <color-ratings
//   rating-label="hotness"
//   left-label="cool"
//   right-label="hot"
//   unique-id="tom"
//   rating="dataHoldingObject.flarp">
// </color-ratings>
app.directive('colorRatings', function ($timeout) {
  return {
    templateUrl: 'views/directives/color_ratings.html',
    restrict: 'E',
    scope: {
      ratingLabel: '@',
      leftLabel: '@',
      rightLabel: '@',
      uniqueId: '@',
      rating: '='
    },
    link: function (scope) {
      scope.triggerEvent = function () {
        $timeout(function () {
          scope.$emit('colorRatingChanged');
        });
      };
    }
  };
});

app.directive('thumbRatings', function ($timeout) {
  return {
    templateUrl: 'views/directives/thumb_ratings.html',
    restrict: 'E',
    scope: {
      ratingLabel: '@',
      lowLabel: '@',
      mediumLabel: '@',
      highLabel: '@',
      uniqueId: '@',
      rating: '='
    },
    link: function (scope) {
      scope.triggerEvent = function () {
        $timeout(function () {
          scope.$emit('thumbRatingChanged');
        });
      };

      // hack for ios to set rating when <span> is clicked because it doesn't update the input
      // value as expected ... after researching still don't know why not
      scope.setRatingHack = function (rating) {
        scope.rating = rating;
        scope.triggerEvent();
      };
    }
  };
});

app.directive('locationAutoComplete', function ($http, _) {
  return {
    templateUrl: 'views/directives/location_auto_complete.html',
    restrict: 'E',
    require: '?ngModel',
    link: function (scope, element, attrs, ngModel) {
      if (!ngModel) {
        return;
      }

      var locationInitVal = attrs.locationInitVal || '';
      ngModel.$render = function () {
        scope.location = {
          location: locationInitVal,
          selectedIndex: -1,
          predictions: []
        };
      };

      scope.locationTitleLabel = attrs.locationTitleLabel;
      scope.divClass = attrs.locationDivClass || 'search search-sm';

      scope.doLocationReset = function () {
        scope.location.location = '';
        scope.location.predictions = [];
      };


      var placesService = window.google ? new window.google.maps.places.AutocompleteService() : {};
      scope.getAddressSuggestions = function () {
        if (scope.location.location && scope.location.location.length > 0) {
          placesService.getQueryPredictions({ input: scope.location.location }, displayAddressSuggestions);
        } else {
          scope.location.predictions = [];
        }
      };

      var displayAddressSuggestions = function(predictions) {
        scope.location.predictions = _.map(predictions, function (p) {
          p.descriptionMatchedArr = _.map(p.matched_substrings, function (sub) {
            return p.description.slice(sub.offset, sub.length);
          });
          return p;
        });
        scope.$apply();
      };

      scope.setDirectiveAddress = function (address) {
        if (address) {
          scope.location.location = address.description ? address.description : address;
          scope.location.selectedIndex = -1;
          scope.location.predictions = [];
        } else {
          scope.location.predictions = [];
        }
        if(!scope.$$phase) {
          scope.$digest();
        }
      };

      scope.location_key = function(event) {
        if (event.keyCode === 38) {
          event.preventDefault();
          // console.log('up arrow');
          if (scope.location.selectedIndex > -1) {
            scope.location.selectedIndex--;
          }
        } else if (event.keyCode === 39) {
          // console.log('right arrow');
        } else if (event.keyCode === 40) {
          event.preventDefault();
          // console.log('down arrow');
          if (scope.location.selectedIndex < scope.location.predictions.length - 1) {
            scope.location.selectedIndex++;
          }
        } else if (event.keyCode === 37) {
          // console.log('left arrow');
        } else if (event.keyCode === 13) {
          event.preventDefault();
          // console.log('return');
          if (scope.location.selectedIndex === -1) {
            scope.setDirectiveAddress();
          } else {
            scope.setDirectiveAddress(scope.location.predictions[scope.location.selectedIndex]);
          }
        }
      };

      scope.$parent.setLocationModelValue = function (address) {
        scope.setDirectiveAddress(address);
      };

      scope.$watch('location', function(location) {
        ngModel.$setViewValue(location.location);
      }, true);
    }
  };
});

app.directive('autoTabTo', function () {
  return {
    restrict: 'A',
    link: function (scope, el, attrs) {
      el.bind('keyup', function() {
        if (this.value.length === this.maxLength) {
          var element = document.getElementsByClassName(attrs.autoTabTo)[0];
          if (element) {
            element.focus();
          }
        }
      });
    }
  };
});

app.directive('forceMaxlength', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var limit = parseInt(attrs.mdMaxlength);
      angular.element(elem).on('keydown', function() {
        if (this.value.length >= limit) {
          this.value = this.value.substr(0,limit-1);
          return false;
        }
      });
    }
  };
});

/* jshint ignore:start */
app.directive('onErrorSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.onErrorSrc) {
          attrs.$set('src', attrs.onErrorSrc);
        }
      });
    }
  };
});
/* jshint ignore:end */

app.directive('format', function ($filter) {
  return {
    require: '?ngModel',
    link: function (scope, elem, attrs, ctrl) {
      if (!ctrl) {
        return;
      }

      var symbol = attrs.numberSymbol || ''; // can replace this with dollar sign and put into front

      ctrl.$formatters.unshift(function () {
        if (ctrl.$modelValue) {
          return symbol + $filter(attrs.format)(ctrl.$modelValue);
        } else {
          return '';
        }
      });

      ctrl.$parsers.unshift(function (viewValue) {
        var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
        elem.val(symbol+ $filter('number')(plainNumber));
        return plainNumber;
      });
    }
  };
});
