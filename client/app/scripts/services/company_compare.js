'use strict';

angular.module('hirepoolApp')
  .service('companyCompare', function (_) {

    var companiesToCompare = {};
    var companyCount = 0;
    return {
      addCompany: addCompany,
      removeCompany: removeCompany,
      getCompaniesToCompare: getCompaniesToCompare,
      count: count,
      comparePublicCo: comparePublicCo,
      compareHasInterviews: compareHasInterviews,
      clear: clear,
    };

    function getCompaniesToCompare () {
      return companiesToCompare;
    }

    function clear () {
      companiesToCompare = {};
      companyCount = 0;
    }

    function compareHasInterviews () {
      return _.some(companiesToCompare, function (opportunity) {
        if (opportunity.experiences && opportunity.experiences.length > 0) {
          return true;
        }
      });
    }

    function comparePublicCo () {
      return _.some(companiesToCompare, function (opportunity) {
        if (opportunity.cbDetails && opportunity.cbDetails.metrics && (opportunity.cbDetails.metrics.marketCap || opportunity.cbDetails.metrics.annualRevenue)) {
          return true;
        }
      });
    }

    function count () {
      return companyCount;
    }

    function addCompany (id, opportunity) {
      if (!companiesToCompare[id]) {
        companyCount = companyCount + 1;
      }
      companiesToCompare[id] = opportunity;
    }

    function removeCompany (id) {
      if (companiesToCompare[id]) {
        companyCount = companyCount - 1;
      }
      companiesToCompare[id] = false;
    }
  });
