'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:ModalsUserProfileCtrl
 * @description
 * # ModalsUserProfileCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('ModalsUserProfileCtrl', function ($scope, $auth, $timeout, jQuery, _, $location, userProperties, $http, $rootScope, eventRecorder, translateHelper, $q, passwordValidationHelper) {

    $scope.fullModalReset = function () {
      resetData();
      resetCsvDataExports();
      resetPasswordChange();
      setRetakeSurveyButtonText();
      setRetakePremiumSurveyButtonText();
      resetNameChange();
      resetNameValidations();
      resetPasswordErrors();
    };

    function resetData () {
      $scope.userData = {};
    }

    function resetValidations () {
      $scope.curr_pass_req = false;
      $scope.curr_pass_invalid = false;
      $scope.other_error = false;
      $scope.equals_current_pass = false;
    }

    function resetPasswordErrors () {
      $scope.passwordErrors = {};
    }

    function resetNameChange () {
      $scope.showSaveName = true;
      $scope.disableSaveName = true;
      $scope.savingName = false;
      $scope.nameSaved = false;
      $scope.nameSubmitted = false;
    }

    function resetNameValidations () {
      $scope.nameError = false;
      $scope.nameRequiredError = false;
    }

    function resetPasswordChange () {
      $scope.password = {
        changed_successfully: false
      };
      $scope.submitted = false;
      $scope.tryingToSave = false;
      $scope.showChangePassword = false;
      resetValidations();
    }

    function resetCsvDataExports () {
      // Hide container of links
      $scope.showCsvExportLinks = false;
      $scope.hasUploadedResumes = false;
      $scope.loadingCsvData = false;

      // Empty container of links, if there are any
      while (csvLinksContainer && csvLinksContainer.firstChild) {
        csvLinksContainer.firstChild.remove();
      }

      while (resumeLinksContainer && resumeLinksContainer.firstChild) {
        resumeLinksContainer.firstChild.remove();
      }
    }

    // Node to append downloadable CSV links
    var csvLinksContainer = document.querySelector('#export-user-data .csv-export-links');
    var resumeLinksContainer = document.querySelector('#export-user-data .resume-export-links');

    // List of API endpoints for downloadable CSV's
    var csvDataEndpoints = [
      'opportunities',
      'events',
      'interactions',
      'collaborations',
      'events_interviewer_ratings',
      'interactions_interviewer_ratings'
    ];

    // setup the modal to be ready
    $scope.fullModalReset();
    $scope.user = userProperties.get();
    setPremiumIsFree();


    // functions made available to scope
    $scope.setCsvExportLinks = setCsvExportLinks;
    $scope.setShowChangePassword = setShowChangePassword;
    $scope.setHideChangePassword = setHideChangePassword;
    $scope.retakeSurvey = retakeSurvey;
    $scope.retakePremiumSurvey = retakePremiumSurvey;
    $scope.submitPasswordChange = submitPasswordChange;
    $scope.resetCsvDataExports = resetCsvDataExports;
    $scope.hasClientValidationErrors = hasClientValidationErrors;
    $scope.hasPwErrors = hasPwErrors;
    $scope.closeModal = closeModal;

    function closeModal () {
      $timeout(function() {
        jQuery('.modal .close-button').click();
      });
    }

    // Helper to create anchor tags with download-able CSV files embedded
    function createCsvDownloadLink (linkText, csvFileName, csvContent) {
      // Encode the contents of the CSV into a blob
      var blobdata = new Blob([csvContent],{type : 'text/csv'});

      // Build the '<a>' tag to hold the csv blob
      var link = document.createElement('a');
      link.innerText = linkText;
      link.setAttribute('href', window.URL.createObjectURL(blobdata));
      link.setAttribute('download', csvFileName);

      // Wrap the link in '<li></li>' tags and return it.
      var link_item = document.createElement('li');
      link_item.appendChild(link);

      return link_item;
    }

    function getCsvExportData (userId) {
      // Set common request options
      var reqOptions = {
        headers: {
          'Accept': 'text/csv'
        }
      };

      // Iterate over the dataSets/endpoints; reduce all the $http.get
      // responses into an object keyed by the respective endpoints.
      var http_get_promises = csvDataEndpoints.reduce(
        function (response_map, endpoint) {
          var dataApiEndpointUrl = '/api/user_data/' + endpoint;
          response_map[endpoint] = $http.get(dataApiEndpointUrl, reqOptions);
          return response_map;
        },
        {} // Initial response_map
      );
      http_get_promises.resumes = $http.get('/api/users/' + userId + '/resumes');

      // Return a single promise for the collection of $http.get promises
      return $q.all(http_get_promises);
    }

    function setCsvExportLinks () {
      $scope.loadingCsvData = true;
      getCsvExportData($scope.user.id)
        .then(function successCallback (responses) {
          // Create the DocumentFragment that holds links
          var csvDataLinks = document.createDocumentFragment();

          // Iterate over csvDataEndpoints
          angular.forEach(csvDataEndpoints, function (dataEndpoint) {
            // Get response for endpoint
            var response = responses[dataEndpoint];

            // Link attributes
            var linkText = _.capitalize(dataEndpoint.replace(/_/g, ' '));
            var csvFileName = null;

            // Try and get the filename from the response headers
            if (response.hasOwnProperty('Content-Disposition')) {
              csvFileName = response.headers['Content-Disposition'].match(/filename=(\"?)(.+)(\1)/)[2];
            }

            // Fall back on determining it from the dataEndpoint
            if (!csvFileName || csvFileName.length === 0) {
              csvFileName = dataEndpoint + '.csv';
            }

            // Create new link element to download CSV file
            var link_li = createCsvDownloadLink(linkText, csvFileName, response.data);

            // Add link item to csvDataLinks array
            csvDataLinks.appendChild(link_li);
          });

          // Append links to container
          if (csvLinksContainer) {
            csvLinksContainer.appendChild(csvDataLinks);
          }

          if (!!responses.resumes) {
            var resumeLinks = document.createDocumentFragment();
            var resumes = responses.resumes.data.resumes;
            angular.forEach(resumes, function (resume) {
              var link = document.createElement('a');
              link.innerText = resume.original_filename;
              link.setAttribute('href', resume.resume_file.url);
              link.setAttribute('target', '_blank');

              var link_item = document.createElement('li');
              link_item.appendChild(link);

              resumeLinks.appendChild(link_item);
            });

            if (resumeLinksContainer) {
              resumeLinksContainer.appendChild(resumeLinks);
              $scope.hasUploadedResumes = true;
            }
          }

          // Show container of links
          $scope.showCsvExportLinks = true;
          $scope.loadingCsvData = false;

        }, function errorCallback (responses) {
          console.log('Uh-oh!! Unable to download CSV from API.', responses);
          $scope.loadingCsvData = false;
          resetCsvDataExports();
        });
    }

    function setShowChangePassword () {
      $scope.showChangePassword = true;
    }

    function setHideChangePassword () {
      $scope.showChangePassword = false;
      resetPasswordChange();
    }

    function retakePremiumSurvey () {
      eventRecorder.trackEvent({
        action: 'retaking-premium-survey',
        modal: 'user-profile'
      });
      var $ = jQuery;
      var $body = $('html');
      $body.toggleClass('nav-open');
      if ($body.is('.nav-open')) {
        $('.wrapper').on('click' , function() {
          $body.removeClass('nav-open');
        });
      }
      $timeout(function () {
        $('.modal .close-button').trigger('click');
      }, 100);
      $location.path('/premium_survey');
    }

    function retakeSurvey () {
      eventRecorder.trackEvent({
        action: 'retaking-survey',
        modal: 'user-profile'
      });
      var $ = jQuery;
      var $body = $('html');
      $body.toggleClass('nav-open');
      if ($body.is('.nav-open')) {
        $('.wrapper').on('click' , function() {
          $body.removeClass('nav-open');
        });
      }
      $timeout(function () {
        $('.modal .close-button').trigger('click');
      }, 100);
      $location.path('/survey1');
    }

    function hasNameValidationErrors () {
      if ($scope.nameSubmitted) {
        var returnVal = false;
        resetNameValidations();

        var requiredErrors = $scope.changeNameForm.$error.required;

        if (requiredErrors) {
          if (_.find(requiredErrors, function(e) { return e.$name === 'user_profile_name'; })) {
            $scope.nameRequiredError = true;
          }
          returnVal = true;
        }
        return returnVal;
      }
      return true;
    }

    function hasClientValidationErrors () {
      if ($scope.submitted) {
        var returnVal = false;
        resetValidations();

        var requiredErrors = $scope.changePasswordForm.$error.required;

        if (requiredErrors) {
          if (_.find(requiredErrors, function(e) { return e.$name === 'curr-pw'; })) {
            $scope.curr_pass_req = true;
          }
          returnVal = true;
        }

        return returnVal;
      }

      return true;
    }

    function hasPwErrors () {
      $scope.passwordErrors = passwordValidationHelper.validatePassword($scope.password.password);
      var errorsPresent = !_.reduce($scope.passwordErrors, function (memo, errorItem) {
        return memo && errorItem;
      }, true);
      return errorsPresent && $scope.submitted;
    }

    function submitPasswordChange (password) {
      $scope.submitted = true;

      if ($scope.hasClientValidationErrors() || $scope.hasPwErrors() || $scope.password.changed_successfully) {
        return;
      }

      $scope.tryingToSave = true;

      $scope.password.password_confirmation = $scope.password.password;

      $auth.updatePassword(password)
        .then(function() {
          eventRecorder.trackEvent({
            action: 'updated-password',
            modal: 'user-profile'
          });
          $scope.tryingToSave = false;
          $scope.password.changed_successfully = true;
        })
        .catch(function(response) {
          $scope.tryingToSave = false;
          if (response.data.errors.current_password && response.data.errors.current_password.includes("is invalid")) {
            $scope.curr_pass_invalid = true;
          } else if (response.data.errors.password && response.data.errors.password.includes("CANNOT_EQUAL_TO_CURRENT_PASSWORD")) {
            $scope.equals_current_pass = true;
          } else {
            $scope.other_error = true;
          }
        });
    }

    function setPremiumIsFree () {
      if ($scope.user && $scope.user.payment_amount && $scope.user.payment_amount > 0) {
        $scope.premiumIsFree = false;
      } else {
        $scope.premiumIsFree = true;
      }
    }

    var setUserPropertiesCleanupFunc = $rootScope.$on('setUserProperties', function () {
      $scope.user = userProperties.get();
      setPremiumIsFree();
    });
    var setSurveyAnswersCleanupFunc = $rootScope.$on('setSurveyAnswers', function () {
      setRetakeSurveyButtonText();
    });
    var setPremiumSurveyAnswersCleanupFunc = $rootScope.$on('setPremiumSurveyAnswers', function () {
      setRetakePremiumSurveyButtonText();
    });
    $scope.$on('$destroy', function () {
      setUserPropertiesCleanupFunc();
      setSurveyAnswersCleanupFunc();
      setPremiumSurveyAnswersCleanupFunc();
    });

    function setRetakePremiumSurveyButtonText () {
      var survey = userProperties.getPremiumSurvey();
      if (survey && survey.length > 0) {
        $scope.userData.retakePremiumSurveyButtonText = 'Retake premium survey';
      } else {
        $scope.userData.retakePremiumSurveyButtonText = 'Take premium survey';
      }
    }

    function setRetakeSurveyButtonText () {
      var survey = userProperties.getSurvey();
      if (survey && survey.length > 0) {
        translateHelper.translate({ translateKey: 'modal.user_profile.retake_survey', containerObject: $scope.userData, keyToGetResponse: 'retakeSurveyButtonText' });
      } else {
        translateHelper.translate({ translateKey: 'modal.user_profile.take_survey', containerObject: $scope.userData, keyToGetResponse: 'retakeSurveyButtonText' });
      }
    }

    $scope.enableNameSaving = function () {
      hasNameValidationErrors();
      if (!$scope.savingName) {
        $scope.nameSaved = false;
        $scope.showSaveName = true;
        $scope.disableSaveName = false;
      }
    };

    function saveNameChange (name, userId) {
      return $http({
        method: 'PUT',
        url: '/api/users/' + userId,
        data: {
          user: {
            name: name
          }
        }
      });
    }

    $scope.submitNameChange = function (name) {
      $scope.nameSubmitted = true;
      if (hasNameValidationErrors()) {
        return;
      }
      $scope.showSaveName = false;
      $scope.savingName = true;
      $scope.disableSaveName = true;
      saveNameChange(name, $scope.user.id).then(function successCallback () {
        eventRecorder.trackEvent({
          action: 'updated-name',
          modal: 'user-profile'
        });
        $scope.savingName = false;
        $scope.nameSaved = true;
      }, function errorCallback () {
        $scope.savingName = false;
        $scope.showSaveName = true;
        $scope.nameError = true;
        $scope.disableSaveName = false;
      });
    };

  });
