'use strict';

angular.module('hirepoolApp')
  .service('opportunityHelpers', function (moment) {

    function getShortDateApplied (opp) {
      if (opp && opp.applied_on) {
        return moment(opp.applied_on).format('MMM D YYYY');
      }
      return '';
    }

    function getStatus (opp) {
      if (opp) {
        if (opp.archived) {
          return 'Archived';
        }
        if (opp.offer && opp.offer.status) {
          var status = opp.offer.status.toLowerCase();
          if (status === 'verbal') {
            return 'Pending Offer';
          }
          if (status === 'written') {
            return 'Pending Offer';
          }
          if (status === 'active') {
            return 'Pending Offer';
          }
          if (status === 'accepted') {
            return 'Accepted Offer';
          }
          if (status === 'declined') {
            return 'Declined Offer';
          }
        }
        if (opp.events && opp.events.length) {
          return 'Active';
        }
        if (opp.applied) {
          return 'Applied';
        }
        return 'Prospecting';
      }
      return null;
    }

    function getInterviewCount (opp) {
      if (opp.experiences) {
        return opp.experiences.length;
      }
      return null;
    }

    function getLastInterview (opp) {
      if (opp.experiences) {
        return opp.experiences.reduce(function (prev, curr) {
          if (prev) {
            if (moment(prev.date).isBefore(curr.date) && moment().isAfter(curr.date)) {
              return curr;
            }
          } else {
            if (moment().isAfter(curr.date)) {
              return curr;
            }
          }
          return prev;
        }, null);
      }
      return null;
    }

    function getNextInterview (opp) {
      if (opp.experiences) {
        return opp.experiences.reduce(function (prev, curr) {
          if (prev) {
            if (moment(prev.date).isAfter(curr.date) && moment().isBefore(curr.date)) {
              return curr;
            }
          } else {
            if (moment().isBefore(curr.date)) {
              return curr;
            }
          }
          return prev;
        }, null);
      }
      return null;
    }

    function getFirstInterview (opp) {
      if (opp.experiences) {
        return opp.experiences.reduce(function (prev, curr) {
          if (prev) {
            if (moment(prev.date).isAfter(curr.date)) {
              return curr;
            }
          } else {
            return curr;
          }
          return prev;
        }, null);
      }
      return null;
    }

    function getTimeInPipeline (opp) {
      var first = getFirstInterview(opp);
      if (first) {
        if (moment(first.date).isBefore()) {
          return moment(first.date).fromNow(true);
        }
      }
      return 'none';
    }

    function getOpportunityTextWithCompanyNameAndJobTitle (opp) {
      var oppText = '';
      if (opp.data && opp.data.job_title) {
        oppText = opp.data.job_title + ' at ';
      } else {
        oppText = 'Opportunity at ';
      }
      if (opp.data && opp.data.company && opp.data.company.name) {
        oppText = oppText + opp.data.company.name;
      } else {
        oppText = oppText + 'an unknown company';
      }
      return oppText;
    }

    return {
      getShortDateApplied: getShortDateApplied,
      getStatus: getStatus,
      getInterviewCount: getInterviewCount,
      getLastInterview: getLastInterview,
      getNextInterview: getNextInterview,
      getFirstInterview: getFirstInterview,
      getTimeInPipeline: getTimeInPipeline,
      getOpportunityTextWithCompanyNameAndJobTitle: getOpportunityTextWithCompanyNameAndJobTitle,
    };
  });
