'use strict';

angular.module('hirepoolApp')
  .service('userProperties', function ($rootScope, $http, _, moment) {
    var properties = {};
    var surveyAnswers = [];
    var premiumSurveyAnswers = [];
    var latLng;
    var geocoder = window.google ? new window.google.maps.Geocoder() : {};

    return {
      get: get,
      set: set,
      getPremiumSurvey: getPremiumSurvey,
      setPremiumSurvey: setPremiumSurvey,
      getSurvey: getSurvey,
      setSurvey: setSurvey,
      getLocString: getLocString,
      getLatLng: getLatLng,
      getField: getField,
      isAdmin: isAdmin,
      isHirepoolAdmin: isHirepoolAdmin,
      showSurveyReminder: showSurveyReminder,
      setSurveyReminderDate: setSurveyReminderDate,
      getFirstName: getFirstName,
    };

    function getFirstName () {
      if (properties.name) {
        var re = /\s+/;
        var wordsInName = properties.name.split(re);
        return wordsInName[0];
      }
    }

    function setSurveyReminderDate (when) {
      if (when === 'never') {
        $http({
          method: 'PUT',
          url: '/api/users/never_show_survey_reminder'
        }).then(function (resp) {
          if (resp && resp.data && resp.data.user) {
            properties = resp.data.user;
          }
        });
      } else {
        $http({
          method: 'PUT',
          url: '/api/users/set_survey_last_reminded_date'
        }).then(function (resp) {
          if (resp && resp.data && resp.data.user) {
            properties = resp.data.user;
          }
        });
      }
    }

    function showSurveyReminder () {
      if (surveyAnswers && surveyAnswers.length > 0) {
        return false;
      }
      if (properties.never_show_survey_reminder) {
        return false;
      }
      if (properties.last_survey_reminder_date) {
        var nextSurveyReminderDate = moment(properties.last_survey_reminder_date).add(7, 'd');
        if (moment().isBefore(nextSurveyReminderDate)) {
          return false;
        }
      }
      return true;
    }

    function isAdmin () {
      return properties.is_admin;
    }

    function isHirepoolAdmin () {
      return properties.is_admin && properties.sponsor === 'hirepool';
    }

    function get () {
      return properties;
    }

    function set (value) {
      value = decorateProviders(value);
      var oldProvider = properties.provider;
      properties = value;
      if (!properties.provider) {
        properties.provider = oldProvider;
      }
      $rootScope.$broadcast('setUserProperties');
    }

    function getSurvey () {
      return surveyAnswers;
    }

    function setSurvey (answers) {
      surveyAnswers = answers;
      setLatLng();
      $rootScope.$broadcast('setSurveyAnswers');
    }

    function getPremiumSurvey () {
      return premiumSurveyAnswers;
    }

    function setPremiumSurvey (answers) {
      premiumSurveyAnswers = answers;
      $rootScope.$broadcast('setPremiumSurveyAnswers');
    }

    function getField () {
      if (surveyAnswers && surveyAnswers.length > 0) {
        var fieldAnswer = _.find(surveyAnswers, {'question_desc': 'field'});
        if (fieldAnswer && fieldAnswer.answers[0] && fieldAnswer.answers[0].answer_text) {
          return fieldAnswer.answers[0].answer_text;
        }
      }
      return '';
    }

    function getLocString () {
      if (surveyAnswers && surveyAnswers.length > 0) {
        var userLocAnswer = _.find(surveyAnswers, {'question_desc': 'location'});
        if (userLocAnswer && userLocAnswer.answers[0] && userLocAnswer.answers[0].answer_text) {
          return userLocAnswer.answers[0].answer_text;
        }
      }
      return '';
    }

    function setLatLng () {
      var locString = getLocString();
      geocoder.geocode( { address: locString }, function (results, status) {
        if (status === 'OK') {
          latLng = results[0].geometry.location;
          $rootScope.$broadcast('setUserLatLng');
        }
      });
    }

    function getLatLng () {
      return latLng;
    }

    function getPrettyNameForProvider (provider) {
      if (provider === 'email') {
        return provider;
      }
      if (provider === 'linkedin') {
        return 'LinkedIn';
      }
      if (provider === 'github') {
        return 'GitHub';
      }
      if (provider === 'google_oauth2') {
        return 'Google';
      }
      return provider.charAt(0).toUpperCase() + provider.slice(1);
    }

    function decorateProviders (userData) {
      if (userData.provider) {
        userData.provider = getPrettyNameForProvider(userData.provider);
      }
      if (userData.available_authentication_providers) {
        userData.available_authentication_providers = userData.available_authentication_providers.map(function (provider) {
          return getPrettyNameForProvider(provider);
        });
      }
      if (userData.last_authentication_merged_provider) {
        userData.last_authentication_merged_provider = getPrettyNameForProvider(userData.last_authentication_merged_provider);
      }
      return userData;
    }

  });
