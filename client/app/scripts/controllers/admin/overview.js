'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:AdminOverviewCtrl
 * @description
 * # AdminOverviewCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('AdminOverviewCtrl', function ($scope, $http, $filter, _, moment, userProperties) {

    var TEST_USERS = [1, 19, 20, 21, 22, 23, 24, 25, 26, 27, 34, 35, 39, 40, 44, 45, 46, 52, 58, 66, 92, 131, 132, 138, 139, 140, 141, 148, 153, 174, 178, 201, 269, 273, 274, 278, 281, 285, 288, 291, 292, 307, 308, 320, 354];
    function isRealUser (userId) {
      if (userId && !TEST_USERS.includes(userId)) {
        return true;
      }
      return false;
    }

    $scope.data = {};
    $scope.overview = {};
    $scope.tab = 'overview';
    $scope.auth = null;

    $scope.getPoc = function (event) {
      if (event && event.interviewers) {
        var poc = event.interviewers.find(function (interviewer) { return interviewer.is_poc; });
        if (poc && poc.interviewer) {
          return poc.interviewer;
        }
      }
      return {};
    };

    $scope.userIsAdmin = function () {
      return userProperties.isAdmin();
    };
    $scope.userIsHirepoolAdmin = function () {
      return userProperties.isHirepoolAdmin();
    };
    $scope.getUserTrackingTags = function (user) {
      return user.user_tracking_tags.map(function (tagsObject) {
        return tagsObject.tag;
      }).join(', ');
    };
    $scope.show = function (tab) {
      $scope.tab = tab;
    };
    $scope.getUser = function (id) {
      return _.find($scope.data.users, {id: id});
    };
    $scope.getDate = function (dateString) {
      if (dateString) {
        return moment(dateString).format('MMM D YYYY');
      }
      return '';
    };
    $scope.getDateTime = function (dateString) {
      if (dateString) {
        return moment(dateString).format('HH:mm MMM D');
      }
      return '';
    };

    function getUserFromOppId (oppId) {
      var opp = _.find($scope.data.opportunities, {id: oppId});
      if (opp) {
        return _.find($scope.data.users, {id: opp.user_id});
      }
      return '';
    }
    function getLastUpdated (userId, entities, lastUpdated) {
      if (entities && entities.length) {
        entities.filter(function (el) {
          var elUserId, user;
          if (el.user_id) {
            elUserId = el.user_id;
          } else {
            user = getUserFromOppId(el.interview_id);
            elUserId = user.id;
          }
          if (userId === elUserId) {
            return true;
          }
        }).forEach(function (el) {
          if (moment(el.updated_at).isAfter(lastUpdated)) {
            lastUpdated = el.updated_at;
          }
        });
      }
      return lastUpdated;
    }

    $scope.getLastUserUpdate = function (user) {
      var lastUpdated = user.created_at;
      lastUpdated = getLastUpdated(user.id, $scope.data.opportunities, lastUpdated);
      lastUpdated = getLastUpdated(user.id, $scope.data.events, lastUpdated);
      lastUpdated = getLastUpdated(user.id, $scope.data.collaborations, lastUpdated);
      lastUpdated = getLastUpdated(user.id, $scope.data.offers, lastUpdated);
      return $scope.getDate(lastUpdated);
    };
    $scope.getEventUserName = function (exp) {
      var user = getUserFromOppId(exp.interview_id);
      return user ? user.name : '';
    };
    $scope.getEventEmail = function (exp) {
      var user = getUserFromOppId(exp.interview_id);
      return user ? user.email : '';
    };
    $scope.getEventCompany = function (exp) {
      var opp = _.find($scope.data.opportunities, {id: exp.interview_id});
      return opp ? opp.company.name : '';
    };

    function eventHasFeedback (event) {
      var retVal = false;
      _.each(event.interactions, function (interaction) {
        if (interaction.one_word || interaction.culture_val) {
          retVal = true;
        } else {
          _.each(interaction.interviewer, function (interviewer) {
            if (interviewer.excited) {
              retVal = true;
            }
          });
        }
      });
      return retVal;
    }
    $scope.getEventFeedbackGiven = function (exp) {
      if (eventHasFeedback(exp)) {
        return 'given';
      }
      return '';
    };

    function getUserOpps (userId) {
      if ($scope.data.opportunities) {
        return $scope.data.opportunities.filter(function (opp) {
          if (opp.user_id === userId) { return true; }
        });
      }
      return [];
    }
    $scope.getUserOppCount = function (userId) {
      if ($scope.data.opportunities) {
        return getUserOpps(userId).length;
      }
      return 'loading...';
    };

    function getUserEntities (userId, entities) {
      var userOppsIds = getUserOpps(userId).map(function (opp) {
        return opp.id;
      });
      if (entities) {
        return entities.filter(function (el) {
          if (userOppsIds.includes(el.interview_id)) {
            return true;
          }
        });
      }
      return [];
    }
    $scope.getUserEventCount = function (userId) {
      if ($scope.data.events) {
        return getUserEntities(userId, $scope.data.events).length;
      }
      return 'loading...';
    };
    $scope.getUserFeedbackCount = function (userId) {
      if ($scope.data.events) {
        return getUserEntities(userId, $scope.data.events).filter(function (event) {
          if (eventHasFeedback(event)) {
            return true;
          }
        }).length;
      }
      return 'loading...';
    };
    $scope.getUserCollabCount = function (userId) {
      if ($scope.data.collaborations) {
        return getUserEntities(userId, $scope.data.collaborations).length;
      }
      return 'loading...';
    };
    $scope.getUserOfferCount = function (userId) {
      if ($scope.data.offers) {
        return getUserEntities(userId, $scope.data.offers).length;
      }
      return 'loading...';
    };

    $scope.getActiveUserCount = function () {
      if ($scope.data.opportunities) {
        var userIds = {};
        return $scope.data.opportunities.reduce(function (userCount, opp) {
          if (!userIds[opp.user_id]) {
            userIds[opp.user_id] = true;
            return userCount + 1;
          }
          return userCount;
        }, 0);
      }
      return 'loading...';
    };
    $scope.getPerActiveUser = function (entities) {
      if ($scope.data.opportunities && entities) {
        return _.round(entities.length / $scope.getActiveUserCount(), 2) || 0;
      }
      return 'loading...';
    };

    function containsString (arr, str) {
      str = str.toLowerCase();
      return arr.some(function (el) {
        if (el && el.toLowerCase().indexOf(str) > -1) {
          return true;
        }
      });
    }
    $scope.userFilter = function (user) {
      if ($scope.userSearch) {
        var strings = [
          user.name,
          user.email,
          user.provider,
          $scope.getDate(user.created_at),
          $scope.getLastUserUpdate(user),
          '' + $scope.getUserOppCount(user.id),
          '' + $scope.getUserEventCount(user.id),
          '' + $scope.getUserFeedbackCount(user.id),
          '' + $scope.getUserCollabCount(user.id),
          '' + $scope.getUserOfferCount(user.id),
          $scope.getUserTrackingTags(user)
        ];
        return containsString(strings, $scope.userSearch);
      } else {
        return true;
      }
    };
    $scope.opportunityFilter = function (opp) {
      if ($scope.opportunitySearch) {
        var strings = [
          $scope.getUser(opp.user_id).name,
          $scope.getUser(opp.user_id).email,
          $scope.getDate(opp.created_at),
          opp.company.name,
          opp.job_title,
          opp.role,
          '' + opp.experiences.length,
          '' + opp.collaborator_feedbacks.length,
          opp.offer ? opp.offer.status : 'none',
          opp.source
        ];
        return containsString(strings, $scope.opportunitySearch);
      } else {
        return true;
      }
    };
    $scope.eventFilter = function (event) {
      if ($scope.eventSearch) {
        var strings = [
              $scope.getEventUserName(event),
              $scope.getEventEmail(event),
              $scope.getEventCompany(event),
              $scope.getDate(event.date),
              event.style,
              event.interviewer.name,
              event.interviewer.email,
              event.interviewer.relationship,
              $scope.getEventFeedbackGiven(event)
        ];
        return containsString(strings, $scope.eventSearch);
      } else {
        return true;
      }
    };
    $scope.feedbackFilter = function (exp) {
      if ($scope.feedbackSearch) {
        var strings = [
          $scope.getExperienceUserName(exp),
          $scope.getExperienceEmail(exp),
          $scope.getExperienceCompany(exp),
          $scope.getDate(exp.date),
          '' + exp.duration_minutes,
          '' + exp.culture_val,
          '' + exp.excited,
          exp.one_word
        ];
        return containsString(strings, $scope.feedbackSearch);
      } else {
        return true;
      }
    };
    $scope.offerFilter = function (offer) {
      if ($scope.offerSearch) {
        var strings = [
          $scope.getExperienceUserName(offer),
          $scope.getExperienceEmail(offer),
          $scope.getExperienceCompany(offer),
          offer.status,
          '$' + offer.base_salary,
          offer.additional_compensation,
          '$' + offer.total_target_compensation,
          $scope.getDate(offer.expiration_date)
        ];
        return containsString(strings, $scope.offerSearch);
      } else {
        return true;
      }
    };
    $scope.collaborationFilter = function (collab) {
      if ($scope.collaborationSearch) {
        var strings = [
          $scope.getExperienceUserName(collab),
          $scope.getExperienceEmail(collab),
          $scope.getExperienceCompany(collab),
          $scope.getDate(collab.date_asked),
          $scope.getDate(collab.date_completed),
          collab.collaborator.name,
          collab.collaborator.email,
          '' + collab.rating,
          collab.feedback,
        ];
        return containsString(strings, $scope.collaborationSearch);
      } else {
        return true;
      }
    };
    $scope.companiesFilter = function (company) {
      if ($scope.companiesSearch) {
        var strings = [
          company.name || '',
          company.gdData.company_ratings.name || '',
          company.cbData.name || '',
          company.domain || '',
          company.gdData.company_ratings.website || '',
          company.cbData.url || '',
          company.reviews_last_processed || '',
          company.cbData.twitter.handle || '',
          company.cbData.facebook.handle || '',
          company.cbData.linkedin.handle || '',
          company.cbData.ticker || '',
          company.cbData.geo.city || '',
          company.cbData.geo.stateCode || '',
          company.cbData.geo.country || ''
        ];
        return containsString(strings, $scope.companiesSearch);
      } else {
        return true;
      }
    };

    function setAdmin (response) {
      if (response.data.error === 'nope') {
        $scope.auth = 'notadmin';
      } else if (response.data.success) {
        $scope.auth = 'admin';
      }
    }
    function getAllUsers () {
      return $http({
        method: 'GET',
        url: '/api/admin/users'
      }).then(function successCallback(response) {
        $scope.data.users = response.data.users.filter(function (user) {
          return isRealUser(user.id);
        });
        $scope.data.testUsers = response.data.users.filter(function (user) {
          return !isRealUser(user.id);
        });
        setAdmin(response);
      }, function errorCallback(response) {
        setAdmin(response);
      });
    }
    function getAllInterviews () {
      return $http({
        method: 'GET',
        url: '/api/admin/interviews'
      }).then(function successCallback(response) {
        $scope.data.opportunities = response.data.interviews.filter(function (opp) {
          return isRealUser(opp.user_id);
        });
        setAdmin(response);
      }, function errorCallback(response) {
        setAdmin(response);
      });
    }
    function getAllEvents () {
      return $http({
        method: 'GET',
        url: '/api/admin/events'
      }).then(function successCallback(response) {
        $scope.data.events = response.data.events.filter(function (event) {
          return isRealUser(getUserFromOppId(event.interview_id));
        });
        setAdmin(response);
      }, function errorCallback(response) {
        setAdmin(response);
      });
    }
    // function getAllExperiences () {
    //   return $http({
    //     method: 'GET',
    //     url: '/api/admin/experiences'
    //   }).then(function successCallback(response) {
    //     $scope.data.experiences = response.data.experiences.filter(function (exp) {
    //       return isRealUser(getUserFromOppId(exp.interview_id));
    //     });
    //     $scope.data.experiencesWithFeedback = $scope.data.experiences.filter(function (exp) {
    //       if (expHasFeedback(exp)) {
    //         return true;
    //       }
    //     });
    //     setAdmin(response);
    //   }, function errorCallback(response) {
    //     setAdmin(response);
    //   });
    // }
    function getAllCollaborations () {
      return $http({
        method: 'GET',
        url: '/api/admin/collaborations'
      }).then(function successCallback(response) {
        $scope.data.collaborations = response.data.collaborations.filter(function (collab) {
          return isRealUser(getUserFromOppId(collab.interview_id));
        });
        setAdmin(response);
      }, function errorCallback(response) {
        setAdmin(response);
      });
    }
    function getAllOffers () {
      return $http({
        method: 'GET',
        url: '/api/admin/offers'
      }).then(function successCallback(response) {
        $scope.data.offers = response.data.offers.filter(function (offer) {
          return isRealUser(getUserFromOppId(offer.interview_id));
        });
        setAdmin(response);
      }, function errorCallback(response) {
        setAdmin(response);
      });
    }
    function getAllCompanies () {
      if ($scope.userIsHirepoolAdmin()) {
        return $http({
          method: 'GET',
          url: '/api/companies/all'
        }).then(function successCallback (response) {
          $scope.data.companies = response.data.companies;
          setAdmin(response);
          setupCompanyData();
        }, function errorCallback (response) {
          setAdmin(response);
        });
      }
    }
    var allCompanyDetails = [];
    var allCompanyRatings = [];
    function getAllCompanyData () {
      if ($scope.userIsHirepoolAdmin()) {
        $http({
          url: '/api/company_details/all'
        }).then(function successCallback (response) {
          allCompanyDetails = response.data;
          setupCompanyData();
        }, function errorCallback (err) {
          console.log('error getting all company data');
          console.log(err);
        });
        $http({
          url: '/api/company_ratings/all'
        }).then(function successCallback (response) {
          allCompanyRatings = response.data;
          setupCompanyData();
        }, function errorCallback (err) {
          console.log('error getting all company ratings');
          console.log(err);
        });
      }
    }
    function setupCompanyData () {
      var dummyGdRatings = {
        company_ratings: {
          name: 'NO GLASSDOOR DATA RETURNED'
        }
      };
      var dummyCbDetails = {
        name: 'NO CB DATA RETURNED',
        twitter: {},
        linkedin: {},
        facebook: {},
        geo: {}
      };
      if ($scope.data.companies.length > 0 && allCompanyRatings.length > 0 && allCompanyDetails.length > 0) {
        $scope.data.companies.forEach(function (company) {
          var domain = company.domain;
          var gdData = allCompanyRatings.find(function (rating) {
            return rating.domain === domain;
          });
          if (gdData && gdData.company_ratings) {
            company.gdData = gdData;
          } else {
            company.gdData = dummyGdRatings;
          }
          var cbData = allCompanyDetails.find(function (details) {
            return details.domain === domain;
          });
          if (cbData) {
            company.cbData = cbData;
          } else {
            company.cbData = dummyCbDetails;
          }
        });
      }
    }

    getAllUsers().then(function () {
      getAllInterviews().then(function () {
        getAllEvents();
        getAllCollaborations();
        getAllOffers();
      });
    });
    getAllCompanies();
    getAllCompanyData();

  });
