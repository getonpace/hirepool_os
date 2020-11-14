'use strict';

angular.module('hirepoolApp')
  .controller('MapViewIndexCtrl', function ($scope, $rootScope, _, userProperties, opportunitiesData, eventRecorder, $translate) {

    eventRecorder.trackEvent({
      action: 'load-page',
      page: 'map-view-index'
    });

    if (userProperties.showSurveyReminder()) {
      var surveyReminderText = {};
      $translate('modal.survey_reminder.map_view.title').then(function successCallback (translatedResponse) {
        surveyReminderText.title = translatedResponse;
        $rootScope.$broadcast('setSurveyReminderText', surveyReminderText);
      }, function errorCallback (keyToBeTranslated) {
        surveyReminderText.title = keyToBeTranslated;
        $rootScope.$broadcast('setSurveyReminderText', surveyReminderText);
      });
      $translate('modal.survey_reminder.map_view.reminder_text').then(function successCallback (translatedResponse) {
        surveyReminderText.reminderText = translatedResponse;
        $rootScope.$broadcast('setSurveyReminderText', surveyReminderText);
      }, function errorCallback (keyToBeTranslated) {
        surveyReminderText.reminderText = keyToBeTranslated;
        $rootScope.$broadcast('setSurveyReminderText', surveyReminderText);
      });
      window.openModal('survey-reminder-modal');
    }

    var vm = this;
    vm.opps = [];
    vm.userData = {
      latLng: userProperties.getLatLng(),
    };
    vm.mapData = {
      markers: {},
    };
    if (vm.userData.latLng) {
      vm.mapData.center = {
        lat: vm.userData.latLng.lat(),
        lng: vm.userData.latLng.lng(),
      };
    }
    vm.hasMap = false;

    opportunitiesData.getAll({forceRefresh: false})
      .then(function successCallback (opps) {
        vm.opps = opps;
        if (vm.mapData.center) {
          createMap();
        }
        _.each(vm.opps, function (opp) {
          if (!opp.data.archived) {
            opportunitiesData.setLatLng(opp.data.id).then(function (oppWithLoc) {
              if (!vm.mapData.center && oppWithLoc && oppWithLoc.latLng) {
                vm.mapData.center = {
                  lat: oppWithLoc.latLng.lat(),
                  lng: oppWithLoc.latLng.lng(),
                };
                createMap();
              }
            });
          }
        });
      }, function errorCallback () {
        console.error('error getting opportunities');
      });

    function createMap () {

      if (typeof vm.mapData.center.lat === 'number' && typeof vm.mapData.center.lng === 'number') {
        vm.hasMap = true;

        // Create a map object and specify the DOM element for display.
        vm.map = new window.google.maps.Map(document.getElementById('map_container'), {
          center: vm.mapData.center,
          scrollwheel: false,
          zoom: 12
        });

        // Create a marker and set its position.
        if (vm.userData.latLng) {
          vm.homeMarker = new window.google.maps.Marker({
            map: vm.map,
            position: vm.mapData.center,
            title: 'Home'
          });
        }

        _.each(vm.opps, function (opp) {
          if (!opp.data.archived) {
            addMarker(opp);
          }
        });

        window.google.maps.event.addDomListener(window, 'resize', function() {
          if (vm.mapData.boundaries) {
            setBoundaries();
          } else {
            vm.map.setCenter(vm.mapData.center);
          }
        });
      }
    }

    function setBoundaries () {
      var options = {
        north: vm.mapData.boundaries.latMax,
        south: vm.mapData.boundaries.latMin,
      };
      if (vm.mapData.boundaries.lngMax - vm.mapData.boundaries.lngMin > 180) {
        options.west = vm.mapData.boundaries.lngMax;
        options.east = vm.mapData.boundaries.lngMaxSecond;
      } else {
        options.west = vm.mapData.boundaries.lngMin;
        options.east = vm.mapData.boundaries.lngMax;
      }
      vm.map.fitBounds(options);
    }

    function updateBoundaries (latLng) {
      var lat = latLng.lat();
      var lng = latLng.lng();
      if (!vm.mapData.boundaries) {
        vm.mapData.boundaries = {};
        if (typeof vm.mapData.center.lat === 'number' && typeof vm.mapData.center.lng === 'number') {
          vm.mapData.boundaries.latMax = vm.mapData.center.lat;
          vm.mapData.boundaries.latMin = vm.mapData.center.lat;
          vm.mapData.boundaries.lngMax = vm.mapData.center.lng;
          vm.mapData.boundaries.lngMin = vm.mapData.center.lng;
          vm.mapData.boundaries.lngMaxSecond = vm.mapData.center.lng;
        }
      }
      if (lat > vm.mapData.boundaries.latMax) {
        vm.mapData.boundaries.latMax = lat;
      } else if (lat < vm.mapData.boundaries.latMin) {
        vm.mapData.boundaries.latMin = lat;
      }
      if (lng > vm.mapData.boundaries.lngMax) {
        vm.mapData.boundaries.lngMaxSecond = vm.mapData.boundaries.lngMax;
        vm.mapData.boundaries.lngMax = lng;
      } else if (lng > vm.mapData.boundaries.lngMaxSecond) {
        vm.mapData.boundaries.lngMaxSecond = lng;
      }
      if (lng < vm.mapData.boundaries.lngMin) {
        vm.mapData.boundaries.lngMin = lng;
      }
      setBoundaries();
    }

    function addMarker (opp) {
      if (opp.latLng && opp.latLng.lat && opp.latLng.lng) {
        vm.mapData.markers[opp.data.id] = new window.google.maps.Marker({
          map: vm.map,
          position: {
            lat: opp.latLng.lat(),
            lng: opp.latLng.lng(),
          },
          title: opp.data.job_title ? opp.data.company.name + ', ' + opp.data.job_title : opp.data.company.name,
        });
        updateBoundaries(opp.latLng);
      }
    }

    function updateOpp (id) {
      vm.opps[id] = opportunitiesData.getOpp(id);
    }

    function updateOppLatLng (id) {
      var opp = vm.opps[id];
      var marker = vm.mapData.markers[id];
      if (opp) {
        opp.latLng = opportunitiesData.getLatLng(id);
      }
      if (!opp.data.archived) {
        if (marker) {
        } else if (vm.map) {
          addMarker(opp);
        }
      }
    }

    var setUserLatLngCleanupFunc = $rootScope.$on('setUserLatLng', function () {
      vm.userData.latLng = userProperties.getLatLng();
      vm.mapData.center = {
        lat: vm.userData.latLng.lat(),
        lng: vm.userData.latLng.lng(),
      };
      if (!vm.hasMap) {
        createMap();
      }
    });

    var setOppCleanupFunc = $rootScope.$on('setOpp', function (e, id) {
      updateOpp(id);
    });

    var setOppLatLngCleanupFunc = $rootScope.$on('setOppLatLng', function (e, id) {
      updateOppLatLng(id);
    });

    $scope.$on('$destroy', function() {
      setUserLatLngCleanupFunc();
      setOppCleanupFunc();
      setOppLatLngCleanupFunc();
    });

  });
