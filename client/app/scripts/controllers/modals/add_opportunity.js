'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:ModalsAddOpportunityCtrl
 * @description
 * # ModalsAddOpportunityCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('ModalsAddOpportunityCtrl', function ($scope, $auth, $timeout, $http, $controller, $rootScope, _, jQuery, ConstantsFactory, emailHelpers, eventRecorder, userProperties) {

    $scope.view = {};
    $scope.data = {};
    $scope.view.sourceDropdownOptions = ConstantsFactory.OpportunitySourceDropdownOptions;

    $scope.fullModalReset = function () {
      $scope.resetData();
    };

    $scope.resetData = function () {
      $scope.data.sourceFromDropdown = '';
      $scope.data.sourceFromText = '';
      $scope.data.opportunity = {};
      $scope.changedSuccessfully = false;
      $scope.tryingToSave = false;
      $scope.submitted = false;

      var field = userProperties.getField();
      if (field) {
        $scope.data.opportunity.role = field;
      }

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
      if($scope.saveOpportunity()) {
        $scope.tryingToSave = true;
        $http({
          method: 'POST',
          url: '/api/interviews/',
          data: {
            interview: {
              applied: $scope.data.opportunity.applied,
              applied_on: $scope.data.opportunity.applied_on,
              role: $scope.data.opportunity.role,
              location: $scope.data.opportunity.companyLocation,
              referrer_name: $scope.data.opportunity.referrerName,
              referrer_email : $scope.data.opportunity.referrerEmail,
              job_title : $scope.data.opportunity.jobTitle,
              job_url : $scope.data.opportunity.jobUrl,
              source: getSource(),
              pinned: false
            },
            company: {
              name: $scope.data.opportunity.company.name,
              location: $scope.data.opportunity.companyLocation,
              domain: $scope.data.opportunity.company.domain || ''
            }
          }
        }).then(function successCallback(response) {
          eventRecorder.trackEvent({
            action: 'created-opportunity',
            modal: 'add-opportunity',
            interviews: [response.data.interview.id]
          });
          $scope.changedSuccessfully = true;
          $scope.tryingToSave = false;
          eventRecorder.trackEvent('added-opportunity');
          if (response && response.data && response.data.interview && response.data.interview.id) {
            window.location.hash = '#/opportunity/' + response.data.interview.id;
          }
          $timeout(function() {
            jQuery('.modal .close-button').click();
          });
          $rootScope.$broadcast('opportunityCreated', {
            id: response.data.interview.id,
            opportunity: response.data.interview,
          });
        }, function errorCallback() {
          $scope.tryingToSave = false;
          $timeout(function() {
            jQuery('.modal .close-button').click();
          });
        });
      }
    };

    var surveyCleanupFunc = $rootScope.$on('setSurveyAnswers', function () {
      var field = userProperties.getField();
      if (field) {
        $scope.data.opportunity.role = field;
      }
    });

    $scope.$on('$destroy', function() {
      surveyCleanupFunc();
    });

  });
