(function () {
'use strict';

angular.module('hirepoolApp')
  .controller('ModalsGuideCtrl', function ($scope, $rootScope, opportunityDetails, selectedCardData, opportunitiesData) {
    var OUTER_RING_CIRCUMFERENCE = 345;
    var MID_RING_CIRCUMFERENCE = 282;
    var INNER_RING_CIRCUMFERENCE = 219;
    var vm = this;
    var cardUpdateMethods = {
      opportunityDetails: opportunityDetails,
      selectedCardData: selectedCardData,
    };

    var geocoder = window.google ? new window.google.maps.Geocoder() : {};

    var loadingCbData = false;
    var loadingGdData = false;

    vm.card = {};
    vm.mapData = {};
    vm.showLoading = showLoading;
    vm.toggleAccordionState = toggleAccordionState;
    vm.candidateExperienceAccordionOpen = true;
    vm.candidateExperienceAccordionClosed = false;
    vm.interviewProcessAccordionOpen = true;
    vm.interviewProcessAccordionClosed = false;
    vm.glassdoorRatingsAccordionOpen = true;
    vm.glassdoorRatingsAccordionClosed = false;
    vm.getSocialUrl = getSocialUrl;
    vm.getHeadquarters = getHeadquarters;
    vm.getOffersPercent = getOffersPercent;
    vm.getOffersPercentFormatted = getOffersPercentFormatted;
    vm.getOffersOffset = getOffersOffset;
    vm.getInterviewDifficultyPercent = getInterviewDifficultyPercent;
    vm.getInterviewDifficultyValue = getInterviewDifficultyValue;
    vm.getInterviewDifficultyLabel = getInterviewDifficultyLabel;
    vm.getInterviewDifficultyClass = getInterviewDifficultyClass;
    vm.getDurationValue = getDurationValue;
    vm.getDurationLabel = getDurationLabel;
    vm.getInterviewExperiencePercent = getInterviewExperiencePercent;
    vm.getRecommendToFriendPercentFormatted = getRecommendToFriendPercentFormatted;
    vm.getRecommendToFriendPercent = getRecommendToFriendPercent;
    vm.getRecommendToFriendClass = getRecommendToFriendClass;
    vm.getRatingsPercent = getRatingsPercent;
    vm.getRatingsClass = getRatingsClass;
    vm.getMapQueryString = getMapQueryString;

    function showLoading () {
      return loadingCbData || loadingGdData;
    }

    function getRecommendToFriendClass () {
      if (vm.card.gdData) {
        var rec = getRecommendToFriendPercent(vm.card.gdData.recommendToFriendRating);
        if (rec < 33) {
          return 'error';
        } else if (rec < 66) {
          return 'warning';
        } else if (rec < 101) {
          return 'success';
        }
      }
    }
    function getRecommendToFriendPercent () {
      if (vm.card.gdData) {
        var rating;
        if (vm.card.gdData.recommendToFriendRating > 1) {
          rating = vm.card.gdData.recommendToFriendRating;
        } else {
          rating = vm.card.gdData.recommendToFriendRating * 100;
        }
        return Math.round(rating, 0);
      }
    }
    function getRecommendToFriendPercentFormatted () {
      return getRecommendToFriendPercent() + '%';
    }
    function getRatingsPercent (ratingAttr) {
      if (vm.card.gdData) {
        var rating = vm.card.gdData[ratingAttr];
        return 100 * rating / 5;
      }
    }
    function getRatingsClass (ratingAttr) {
      if (vm.card.gdData) {
        var rating = vm.card.gdData[ratingAttr];
        if (rating < 1.66) {
          return 'error';
        } else if (rating < 3.33) {
          return 'warning';
        } else if (rating < 5.01) {
          return 'success';
        }
      }
    }
    function getInterviewExperiencePercent (experienceAttr) {
      if (vm.card.company && typeof vm.card.company[experienceAttr] === 'number') {
        return 100 * vm.card.company[experienceAttr] / vm.card.company.interview_recent_reviews;
      }
    }
    function getDurationLabel () {
      if (vm.card.company) {
        if (vm.card.company.interview_process_duration < 20) {
          return 'days';
        } else {
          return 'weeks';
        }
      }
    }
    function getDurationValue () {
      if (vm.card.company && vm.card.company.interview_process_duration && typeof vm.card.company.interview_process_duration === 'number') {
        if (vm.card.company.interview_process_duration < 20) {
          return vm.card.company.interview_process_duration.toFixed(0);
        } else {
          return (vm.card.company.interview_process_duration / 7).toFixed(0);
        }
      }
    }
    function getInterviewDifficultyClass () {
      if (vm.card.company) {
        var label = vm.getInterviewDifficultyLabel();
        switch (label) {
          case 'Easy':
            return 'success';
          case 'Average':
            return 'warning';
          case 'Hard':
            return 'error';
        }
      }
    }
    function getInterviewDifficultyLabel () {
      if (vm.card.company) {
        var diff = vm.card.company.interview_difficulty;
        if (diff < 0.66) {
          return 'Easy';
        } else if (diff < 1.33) {
          return 'Average';
        } else if (diff <= 2) {
          return 'Hard';
        }
      }
    }
    function getInterviewDifficultyValue () {
      if (vm.card.company && typeof vm.card.company.interview_difficulty === 'number') {
        return (5 * vm.card.company.interview_difficulty / 2).toPrecision(2);
      }
    }
    function getInterviewDifficultyPercent () {
      if (vm.card.company) {
        return 100 * vm.card.company.interview_difficulty / 2;
      }
    }
    function getOffersOffset (offerType) {
      var ringCircumference;
      switch (offerType) {
        case 'other':
          ringCircumference = INNER_RING_CIRCUMFERENCE;
          break;
        case 'interview_offers_declined':
          ringCircumference = MID_RING_CIRCUMFERENCE;
          break;
        case 'interview_offers_accepted':
          ringCircumference = OUTER_RING_CIRCUMFERENCE;
      }
      return (1 - getOffersPercent(offerType)) * ringCircumference;
    }
    function getOffersPercentFormatted (offerType) {
      var percent = getOffersPercent(offerType);
      if (typeof percent === 'number') {
        return (100 * percent).toFixed() + '%';
      }
    }
    function getOffersPercent (offerType) {
      var company = vm.card.company;
      if (company) {
        var offerCount = vm.card.company[offerType];
        if (offerType === 'other') {
          offerCount = company.interview_recent_reviews - (company.interview_offers_declined + company.interview_offers_accepted);
        }
        if (typeof offerCount === 'number' && typeof company.interview_recent_reviews === 'number') {
          return offerCount / company.interview_recent_reviews;
        }
      }
    }
    function toggleAccordionState (accordion) {
      vm[accordion + 'Closed'] = !vm[accordion + 'Closed'];
      vm[accordion + 'Open'] = !vm[accordion + 'Open'];
    }
    function getHeadquarters () {
      var hq = '';
      if (vm.card.cbData && vm.card.cbData.geo) {
        var geo = vm.card.cbData.geo;
        if (geo.city) {
          hq = geo.city;
          if (geo.stateCode) {
            hq = hq + ', ' + geo.stateCode;
          }
        } else {
          if (geo.state) {
            hq = geo.state;
          }
        }
        if (geo.country !== 'United States') {
          if (geo.city || geo.state) {
            hq = hq + ', ' + geo.country;
          } else {
            hq = geo.country;
          }
        }
      }
      return hq;
    }
    function getSocialUrl (provider) {
      if (vm.card.cbData && vm.card.cbData[provider] && vm.card.cbData[provider].handle) {
        return 'https://' + provider + '.com/' + vm.card.cbData[provider].handle;
      }
      return false;
    }

    function setAndCreateMap () {
      var locString = vm.card.location;
      geocoder.geocode( { address: locString }, function (results, status) {
        if (status === 'OK') {
          var latLng = results[0].geometry.location;
          vm.mapData.center = {
            lat: latLng.lat(),
            lng: latLng.lng(),
          };
          createMap();
        }
      });
    }

    function createMap () {
      vm.map = new window.google.maps.Map(document.getElementById('guide_modal_map_container'), {
        center: vm.mapData.center,
        scrollwheel: false,
        zoom: 17,
        disableDefaultUI: true,
        draggable: false
      });
      createMarker();
    }

    function createMarker () {
      vm.mapData.marker = new window.google.maps.Marker({
        map: vm.map,
        position: vm.mapData.center,
        title: vm.card.location
      });
    }

    function getMapQueryString () {
      return encodeURI(vm.card.location);
    }

    var openGuideCleanupFunc = $rootScope.$on('openGuide', function (ev, cardUpdateMethod) {
      loadingGdData = false;
      loadingCbData = false;

      vm.card = cardUpdateMethods[cardUpdateMethod].get();
      if (!vm.card.cbData) {
        loadingCbData = true;
        opportunitiesData.setCbData({id: vm.card.id}).then(function promiseResolved () {
          vm.card.cbData = opportunitiesData.getCbData(vm.card.id);
          loadingCbData = false;
        }, function promiseRejected () {
          loadingCbData = false;
        });
      }
      if (!vm.card.gdData) {
        loadingGdData = true;
        opportunitiesData.setGdData({id: vm.card.id}).then(function promiseResolved () {
          vm.card.gdData = opportunitiesData.getGdData(vm.card.id);
          loadingGdData = false;
        }, function promiseRejected () {
          loadingGdData = false;
        });
      }
      if (vm.card.location) {
        setAndCreateMap();
      }
    });
    $scope.$on('$destroy', function() {
      openGuideCleanupFunc();
    });
  });
})();
