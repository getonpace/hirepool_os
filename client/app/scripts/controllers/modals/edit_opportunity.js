'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:ModalsEditOpportunityCtrl
 * @description
 * # ModalsEditOpportunityCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('ModalsEditOpportunityCtrl', function ($scope, $auth, $timeout, $http, $controller, $rootScope, _, jQuery, ConstantsFactory, emailHelpers, selectedCardData, opportunityDetails, eventRecorder) {

    $scope.view = {};
    $scope.data = {};
    $scope.view.sourceDropdownOptions = ConstantsFactory.OpportunitySourceDropdownOptions;

    var cardCleanupFunc = $rootScope.$on('updatingCard', function () {
      $scope.data.opportunity = selectedCardData.get();
      $scope.data.company.name = $scope.data.opportunity.company.name;
      $scope.data.company.domain = $scope.data.opportunity.company.domain;
      $scope.setLocationModelValue($scope.data.opportunity.location);
      setSourceValues();
    });
    var oppCleanupFunc = $rootScope.$on('currentOpportunityUpdatedBySystem', function () {
      $scope.data.opportunity = opportunityDetails.get();
      $scope.data.company.name = $scope.data.opportunity.company.name;
      $scope.data.company.domain = $scope.data.opportunity.company.domain;
      $scope.setLocationModelValue($scope.data.opportunity.location);
      setSourceValues();
    });

    $scope.fullModalReset = function () {
      $scope.resetData();
    };

    $scope.resetData = function () {
      $scope.data.sourceFromDropdown = '';
      $scope.data.sourceFromText = '';
      $scope.data.location = '';
      $scope.data.company = {};
      $scope.data.opportunity = {};
      $scope.changedSuccessfully = false;
      $scope.tryingToSave = false;
      $scope.submitted = false;
      $scope.resetValidations();
    };

    $scope.resetValidations = function () {
      $scope.company_name_req = false;
      $scope.source_req = false;
      $scope.ref_email_invalid = false;
    };

    $scope.fullModalReset();

    $scope.hasClientValidationErrors = function () {
      if ($scope.submitted) {
        var returnVal = false;
        $scope.resetValidations();

        var requiredErrors = $scope.addOpportunityForm.$error.required;
        if (requiredErrors) {
          if (_.find(requiredErrors, function(e) { return e.$name === 'company_name'; })) {
            $scope.company_name_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'source'; })) {
            $scope.source_req = true;
          }

          returnVal = true;
        }

        if ($scope.addOpportunityForm.referrer_email.$viewValue &&
          !emailHelpers.regexp.test($scope.addOpportunityForm.referrer_email.$viewValue)) {
          $scope.ref_email_invalid = true;
          returnVal = true;
        }
        return returnVal;
      }

      return true;
    };

    $scope.getOpportunityRoleAutoCompleteOptions = function () {
      return ConstantsFactory.OpportunityRoleAutoCompleteOptions;
    };

    function setSourceValues () {
      if ($scope.data.opportunity.source) {
        var found = _.find($scope.view.sourceDropdownOptions, function (sourceContainer) {
          var index = sourceContainer.options.indexOf($scope.data.opportunity.source);
          return index > -1;
        });
        if (found) {
          $scope.data.sourceFromDropdown = $scope.data.opportunity.source;
        } else {
          $scope.data.sourceFromDropdown = 'Other';
          $scope.data.sourceFromText = $scope.data.opportunity.source;
        }
      }
    }

    $scope.showOtherOpportunityInput = function () {
      if ($scope.data.sourceFromDropdown && $scope.data.sourceFromDropdown.toLowerCase() === 'other') {
        return true;
      }
      return false;
    };

    $scope.getOpportunityText = function () {
      if ($scope.data.opportunity.company && $scope.data.opportunity.company.name) {
        return 'the opportunity at ' + $scope.data.opportunity.company.name;
      } else {
        return 'this opportunity';
      }
    };

    $scope.saveOpportunity = function () {
      $scope.submitted = true;

      if ($scope.hasClientValidationErrors() || $scope.changedSuccessfully) {
        return false;
      }
      return true;
    };

    function getSource () {
      if ($scope.data.sourceFromDropdown && $scope.data.sourceFromDropdown !== "Other") {
        return $scope.data.sourceFromDropdown;
      } else {
        return $scope.data.sourceFromText || $scope.data.sourceFromDropdown;
      }
    }

    $scope.submitAndClose = function () {
      if (!$scope.data.opportunity.company.location) {
        $scope.data.opportunity.company.location = $scope.data.opportunity.location;
      }
      $scope.data.opportunity.company.domain = $scope.data.company.domain;
      $scope.data.opportunity.company.name = $scope.data.company.name;
      if($scope.saveOpportunity()) {
        $scope.tryingToSave = true;
        $scope.data.opportunity.location = $scope.data.location;
        $scope.data.opportunity.source = getSource();

        // TODO when we fix notes in opportunity details, remove the
        // need to GET /api/interviews/notes/
        $http({
          method: 'GET',
          url: '/api/interviews/notes/' + $scope.data.opportunity.id
        }).then(function successCallback(response) {
          $scope.data.opportunity.notes = response.data.notes;
          $http({
            method: 'PUT',
            url: '/api/interviews/' + $scope.data.opportunity.id,
            data: $scope.data.opportunity
          }).then(function successCallback(response) {
            eventRecorder.trackEvent({
              action: 'updated-opportunity',
              modal: 'edit-opportunity',
              page: 'opportunities-index',
              interviews: [response.data.interview.id]
            });
            $scope.changedSuccessfully = true;
            $scope.tryingToSave = false;
            $timeout(function() {
              jQuery('.modal .close-button').click();
            });
            $rootScope.$broadcast('opportunityUpdated', {
              id: response.data.interview.id,
              opportunity: response.data.interview,
            });
          }, function errorCallback() {
            // TODO: seriously we just close the fucking modal on error?
            $scope.tryingToSave = false;
            $timeout(function() {
              jQuery('.modal .close-button').click();
            });
          });
        },
        function errorCallback() {
          // TODO: seriously we just close the fucking modal on error?
          $scope.tryingToSave = false;
          $timeout(function() {
            jQuery('.modal .close-button').click();
          });
        });
      }
    };

    $scope.$on('$destroy', function() {
      oppCleanupFunc();
      cardCleanupFunc();
    });

  });
