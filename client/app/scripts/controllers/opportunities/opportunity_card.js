'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:OpportunitiesCardCtrl
 * @description
 * # OpportunitiesCardCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('OpportunitiesCardCtrl', function ($scope, $timeout, $rootScope, $http, selectedCardData, scoreHelpers, moment, _, jQuery, companyCompare, opportunitiesData, eventRecorder) {

    $scope.hideContent = false;

    $scope.data = $scope.$parent.it.data;
    $scope.data.loading = false;
    $scope.cardInfo = {
      compare: false
    };

    $scope.compareCompanyDisabled = function () {
      if (!$scope.cardInfo.compare && companyCompare.count() >= 3) {
        return true;
      }
      return false;
    };

    var hideCurrentDropdownMenu = function ($event) {
      // http://foundation.zurb.com/forum/posts/36720-foundation-6-orbit--how-to-get-an-existing-instance-
      var currentDropDownMenu = new window.Foundation.DropdownMenu(jQuery($event.target).parents('.dropdown'));
      currentDropDownMenu._hide();
    };

    $scope.setCompareCompany = function () {
      $scope.cardInfo.compare = !$scope.cardInfo.compare;
      if ($scope.cardInfo.compare) {
        companyCompare.addCompany($scope.data.id, $scope.data);
      } else {
        companyCompare.removeCompany($scope.data.id);
      }
    };

    $scope.justAddedInterview = false;
    if ($scope.data && $scope.data.experiences && $scope.data.experiences.length) {
      var newInterviews = _.filter($scope.data.experiences, function (e) {
        return moment().diff(e.created_at, 'seconds') < 5;
      });
      if (newInterviews.length > 0) {
        $scope.justAddedInterview = true;
      }
    }

    $scope.getUpcomingInterviews = function () {
      if ($scope.data && $scope.data.experiences && $scope.data.experiences.length) {
        return _.chain($scope.data.experiences).filter(function (e) {
          return moment().isBefore(e.date);
        }).map(function (e) {
          return moment(e.date).format('MM-DD-YYYY');
        }).value();
      } else {
        return [];
      }
    };

    $scope.getCardScore = function () {
      return scoreHelpers.getScore($scope.data);
    };

    $scope.openingGuideModal = function () {
      $scope.setCardData();
      $rootScope.$broadcast('openGuide', 'selectedCardData');
      eventRecorder.trackEvent('open-guide-modal');
    };

    $scope.openAddEventFodal = function () {
      $scope.setCardData();
      window.openModal('add-event-and-opportunity-fodal');
      eventRecorder.trackEvent('open-add-event-modal');
    };

    $scope.setCardData = function () {
      selectedCardData.set(opportunitiesData.getOpp($scope.data.id).data);
      $rootScope.$broadcast('updatingCard');
    };

    $scope.togglePinned = function ($event) {
      $scope.data.loading = true;
      $scope.data.pinned = !$scope.data.pinned;

      // TODO when we fix notes in opportunity details, remove the
      // need to GET /api/interviews/notes/
      $http({
        method: 'GET',
        url: '/api/interviews/notes/' + $scope.data.id
      }).then(function successCallback (response) {
        $scope.data.notes = response.data.notes;
        $http({
          method: 'PUT',
          url: '/api/interviews/' + $scope.data.id,
          data: $scope.data,
        }).then(function successCallback () {
          $scope.data.loading = false;
          $rootScope.$broadcast('updatingPinned', $scope.data.id, $scope.data.pinned);
        }, function errorCallback () {
          $scope.data.loading = false;
          $scope.data.pinned = !$scope.data.pinned;
        });
      }, function errorCallback () {
      });

      hideCurrentDropdownMenu($event);
    };

    $scope.archive = function ($event) {
      $scope.data.archived = !$scope.data.archived;

      // TODO when we fix notes in opportunity details, remove the
      // need to GET /api/interviews/notes/
      $http({
        method: 'GET',
        url: '/api/interviews/notes/' + $scope.data.id
      }).then(function successCallback (response) {
        $scope.data.notes = response.data.notes;
        $http({
          method: 'PUT',
          url: '/api/interviews/' + $scope.data.id,
          data: $scope.data,
        }).then(function successCallback () {
          $scope.data.loading = false;
          $rootScope.$broadcast('updatingArchived', $scope.data.id, $scope.data.archived);
        }, function errorCallback () {
          $scope.data.loading = false;
          $scope.data.archived = !$scope.data.archived;
        });
      }, function errorCallback () {
      });

      hideCurrentDropdownMenu($event);
    };

    var setOppCleanupFunc = $rootScope.$on('setOpp', function (e, id) {
      if (id === $scope.data.id) {
        $scope.data = opportunitiesData.getOpp(id).data;
      }
    });
    $scope.$on('$destroy', function() {
      setOppCleanupFunc();
    });

  });
