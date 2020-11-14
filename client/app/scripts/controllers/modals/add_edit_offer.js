'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:ModalsAddEditOfferCtrl
 * @description
 * # ModalsAddEditOfferCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('ModalsAddEditOfferCtrl', function ($scope, $rootScope, selectedCardData, opportunityDetails, $http, $timeout, _, moment, jQuery, ConstantsFactory, eventRecorder) {

    $scope.card = {};
    $scope.offer = {};
    $scope.data = {};
    $scope.view = {};
    $scope.view.OfferStatusDropdownOptions = ConstantsFactory.OfferStatusDropdownOptions;

    var oppCleanupFunc = $rootScope.$on('currentOpportunityUpdatedBySystem', function () {
      $scope.card = opportunityDetails.get();
      $scope.offer = _.extend({}, $scope.offer, $scope.card.offer);
      if ($scope.card.offer && !_.isEmpty($scope.card.offer)) {
        $scope.existingOffer = true;
      }
      setStatusValues();
      $scope.reRenderDateForm();
    });
    var cardCleanupFunc = $rootScope.$on('updatingCard', function () {
      $scope.card = selectedCardData.get();
      $scope.offer = _.extend({}, $scope.offer, $scope.card.offer);
      if ($scope.card.offer && !_.isEmpty($scope.card.offer)) {
        $scope.existingOffer = true;
      }
      setStatusValues();
      $scope.reRenderDateForm();
    });

    function setStatusValues () {
      if ($scope.offer.status) {
        var index = $scope.view.OfferStatusDropdownOptions.indexOf($scope.offer.status);
        if (index > -1) {
          $scope.data.statusFromDropdown = $scope.offer.status;
        } else {
          $scope.data.statusFromDropdown = 'Other';
          $scope.data.statusFromText = $scope.offer.status;
        }
      } else {
        $scope.data.statusFromDropdown = '';
        $scope.data.statusFromText = '';
      }
    }

    $scope.fullModalReset = function () {
      $scope.resetData();
      $rootScope.$broadcast('close-dateform-dropdown');
    };

    $scope.resetData = function () {
      $scope.data.statusFromDropdown = '';
      $scope.data.statusFromText = '';
      $scope.offer = {};
      $scope.changedSuccessfully = false;
      $scope.tryingToSubmit = false;
      $scope.tryingToDelete = false;
      $scope.deletedSuccessfully = false;
      $scope.submitted = false;
      $scope.existingOffer = false;
      $scope.resetValidations();
    };

    $scope.resetValidations = function () {
      $scope.status_req = false;
      $scope.add_comp_req = false;
      $scope.target_comp_req = false;
      $scope.base_salary_req = false;
      $scope.base_salary_too_high = false;
      $scope.offer_date_req = false;
    };

    $scope.fullModalReset();

    $scope.hasClientValidationErrors = function () {
      if ($scope.submitted) {
        var returnVal = false;
        $scope.resetValidations();

        var requiredErrors = $scope.addOfferForm.$error.required;

        if (requiredErrors) {
          if (_.find(requiredErrors, function(e) { return e.$name === 'status'; })) {
            $scope.status_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'base-salary'; })) {
            $scope.base_salary_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'offer-date'; })) {
            $scope.offer_date_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'additional-compensation'; })) {
            $scope.add_comp_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'total-target-compensation'; })) {
            $scope.target_comp_req = true;
          }

          returnVal = true;
        }

        if ($scope.offer.base_salary > 9000000000) {
          $scope.base_salary_too_high = true;
          returnVal = true;
        }

        return returnVal;
      }

      return true;
    };

    $scope.showOtherStatusInput = function () {
      if ($scope.data.statusFromDropdown && $scope.data.statusFromDropdown.toLowerCase() === 'other') {
        return true;
      }
      return false;
    };

    $scope.destroyOffer = function () {
      $scope.submitted = true;

      if ($scope.hasClientValidationErrors() || $scope.changed_successfully) {
        return;
      }

      $scope.tryingToDelete = true;
      $http({
        method: 'DELETE',
        url: '/api/offers/' + $scope.card.offer.id,
        params: { interview_id: $scope.card.id },
      }).then(function successCallback(response) {
        eventRecorder.trackEvent({
          action: 'deleted-offer',
          modal: 'add-edit-offer',
          interviews: [response.data.interview.id]
        });
        $scope.tryingToDelete = false;
        $scope.deletedSuccessfully = true;
        $timeout(function() {
          jQuery('.modal .close-button').click();
        }, 50);
        $rootScope.$broadcast('cardUpdated', {id: response.data.interview.id });
        $rootScope.$broadcast('updatedOffer', {}, response.data.interview.id);
      }, function errorCallback() {
      });
    };

    function getStatus () {
      if ($scope.data.statusFromDropdown && $scope.data.statusFromDropdown !== "Other") {
        return $scope.data.statusFromDropdown;
      } else {
        return $scope.data.statusFromText || $scope.data.statusFromDropdown;
      }
    }

    $scope.submitOffer = function () {
      $scope.submitted = true;
      if ($scope.hasClientValidationErrors() || $scope.changed_successfully) {
        return;
      }

      $scope.tryingToSubmit = true;
      $scope.offer.status = getStatus();
      if ($scope.existingOffer) {
        $http({
          method: 'PUT',
          url: '/api/offers/' + $scope.card.offer.id,
          data: {
            interview: {
              id: $scope.card.id
            },
            offer: {
              status: $scope.offer.status,
              base_salary: $scope.offer.base_salary,
              additional_compensation: $scope.offer.additional_compensation,
              total_target_compensation: $scope.offer.total_target_compensation,
              expiration_date: $scope.offer.expiration_date,
            }
          }
        }).then(function successCallback(response) {
          eventRecorder.trackEvent({
            action: 'updated-offer',
            modal: 'add-edit-offer',
            interviews: [response.data.offer.interview_id]
          });
          $scope.changedSuccessfully = true;
          $scope.tryingToSubmit = false;
          $timeout(function() {
            if ($scope.offer.status === 'accepted') {
              eventRecorder.trackEvent({
                action: 'accepted-offer',
                modal: 'add-edit-offer',
                interviews: [response.data.offer.interview_id]
              });
              eventRecorder.trackEvent('accepted-offer');
            }
            jQuery('.modal .close-button').click();
          }, 50);
          $rootScope.$broadcast('cardUpdated', {id: response.data.offer.interview_id});
          $rootScope.$broadcast('updatedOffer', response.data.offer, response.data.offer.interview_id);
        }, function errorCallback() {
        });
      } else {
        $http({
          method: 'POST',
          url: '/api/offers/',
          data: {
            interview: {
              id: $scope.card.id
            },
            offer: {
              status: $scope.offer.status,
              base_salary: $scope.offer.base_salary,
              additional_compensation: $scope.offer.additional_compensation,
              total_target_compensation: $scope.offer.total_target_compensation,
              expiration_date: $scope.offer.expiration_date,
            }
          }
        }).then(function successCallback(response) {
          eventRecorder.trackEvent({
            action: 'created-offer',
            modal: 'add-edit-offer',
            interviews: [response.data.offer.interview_id]
          });
          $scope.changedSuccessfully = true;
          $scope.tryingToSubmit = false;
          $timeout(function() {
            eventRecorder.trackEvent('added-offer');
            if ($scope.offer.status && $scope.offer.status.toLowerCase() === 'accepted') {
              eventRecorder.trackEvent('accepted-offer');
            }
            jQuery('.modal .close-button').click();
          });
          $rootScope.$broadcast('cardUpdated', {id: response.data.offer.interview_id});
          $rootScope.$broadcast('updatedOffer', response.data.offer, response.data.offer.interview_id);
        }, function errorCallback() {
        });
      }
    };

    $scope.$on('$destroy', function() {
      oppCleanupFunc();
      cardCleanupFunc();
    });

  });
