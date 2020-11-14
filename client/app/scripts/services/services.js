'use strict';

/**
 * @ngdoc service
 * @name hirepoolApp.services
 * @description
 * # services
 * Service in the hirepoolApp.
 */
angular.module('hirepoolApp')
  .service('currentlySelectedEvent', function () {
    var event = {};
    var interaction = {};
    var participant = {};

    return {
      get: function () {
        return event;
      },
      set: function (value) {
        event = value;
      },
      getInteraction: function () {
        return interaction;
      },
      setInteraction: function (value) {
        interaction = value;
      },
      getParticipant: function () {
        return participant;
      },
      setParticipant: function (value) {
        participant = value;
      }
    };
  })
  .service('selectedCardData', function (opportunitiesData) {
    var card = {};

    return {
      get: function () {
        return card;
      },
      set: function(value) {
        card = opportunitiesData.getOpp(value.id).data;
      }
    };
  })
  .service('opportunityDetails', function () {
    var opportunityDetails = {};

    return {
      get: function () {
        return opportunityDetails;
      },
      set: function (value) {
        opportunityDetails = value;
      }
    };
  })
  .service('namingHelpers', function (moment) {
    function adminCsvNamer (root, timeframe) {
      var day = moment().format('MMM-DD-YYYY');
      var fileName = 'hirepool-' + root + '-';
      if (timeframe === 'all') {
        timeframe = timeframe + '-';
      } else if (timeframe) {
        timeframe = 'last-' + timeframe + '-days-';
      } else {
        timeframe = '';
      }
      fileName = fileName + timeframe + day;
      return fileName;
    }

    return {
      adminCsvNamer: adminCsvNamer,
    };
  })
  .service('generalHelpers', function () {

    function isVowel (char) {
      var vowelsIndex = 'aeiouAEIOU';
      if (char && char.length === 1) {
        return vowelsIndex.indexOf(char) >= 0 ? true : false;
      }
    }

    function prependWithA (textToPrepend) {
      if (textToPrepend) {
        return (isVowel(textToPrepend[0]) ? 'an ' : 'a ') + textToPrepend;
      }
    }

    return {
      prependWithA: prependWithA,
      isVowel: isVowel,
    };
  })
  .service('emailHelpers', function () {
    var regexp = /^[\!#\$%&'\*\+\-\/=\?\^_`\{\|\}~A-Za-z0-9]+(\.[\!#\$%&'\*\+\-\/=\?\^_`\{\|\}~A-Za-z0-9]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$/;

    return {
      regexp: regexp
    };
  });
