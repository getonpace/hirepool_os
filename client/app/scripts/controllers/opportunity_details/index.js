'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:OpportunityDetailsIndexCtrl
 * @description
 * # OpportunityDetailsIndexCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('OpportunityDetailsIndexCtrl', function ($scope, $rootScope, $routeParams, $http, opportunityDetails, _, jQuery, $location, $timeout, ConstantsFactory, moment, eventRecorder, translateHelper, opportunityHelpers, opportunitiesData, currentlySelectedEvent, userProperties) {

    var openedEventNotesModal = false;
    var openedGuideModal = false;
    var scrolledToFeedback = false;
    var scrolledToNewEvent = false;
    $scope.userData = userProperties.get();
    $scope.opportunityConstants = ConstantsFactory;
    $scope.waitingForOpportunity = true;

    $scope.view = {};
    $scope.view.updatingArchived = false;

    $scope.getAppliedOnDate = function () {
      return opportunityHelpers.getShortDateApplied($scope.opportunity);
    };

    $scope.showAppliedOn = function () {
      return opportunityHelpers.getStatus($scope.opportunity) === 'Applied' && $scope.opportunity.applied_on;
    };

    $scope.archiveOpportunity = function () {
      $scope.view.updatingArchived = true;
      var url = '/api/interviews/' + $scope.opportunity.id;
      var data = { archived: true };
      $http.put(url, data).then(function successCallback (response) {
        $scope.opportunity.archived = true;
        $rootScope.$broadcast('opportunityUpdated', {
          id: response.data.interview.id,
          opportunity: response.data.interview,
        });
        $scope.view.updatingArchived = false;
      }, function errorCallback () {
        console.error('Archive Opportunity Failed');
        $scope.view.updatingArchived = false;
      });
    };

    $scope.unarchiveOpportunity = function () {
      $scope.view.updatingArchived = true;
      var url = '/api/interviews/' + $scope.opportunity.id;
      var data = { archived: false };
      $http.put(url, data).then(function successCallback (response) {
        $scope.opportunity.archived = false;
        $rootScope.$broadcast('opportunityUpdated', {
          id: response.data.interview.id,
          opportunity: response.data.interview,
        });
        $scope.view.updatingArchived = false;
      }, function errorCallback () {
        console.error('Unarchive Opportunity Failed');
        $scope.view.updatingArchived = false;
      });
    };

    $scope.getStatus = function () {
      return opportunityHelpers.getStatus($scope.opportunity);
    };

    function setCurrentOpportunity () {
      opportunityDetails.set($scope.opportunity);
      $rootScope.$broadcast('currentOpportunityUpdatedBySystem');
    }
    $scope.setCurrentOpportunity = setCurrentOpportunity;

    function broadcastOpportunityUpdated () {
      $rootScope.$broadcast('opportunity_details_page_opportunity_updated');
    }

    $scope.openingAddOfferModal = function () {
      var modal = $scope.opportunity.offer ? 'edit-offer' : 'add-offer';
      eventRecorder.trackEvent({
        action: 'open-modal',
        page: 'opportunity-details',
        modal: modal,
        interviews: [$scope.opportunity.id]
      });
      setCurrentOpportunity();
    };

    $scope.setupAndTrackGuideModal = function () {
      $scope.setCurrentOpportunity();
      $rootScope.$broadcast('openGuide', 'opportunityDetails');
      eventRecorder.trackEvent('open-guide-modal');
    };

    $scope.openAddEventFodal = function () {
      eventRecorder.trackEvent({
        action: 'open-modal',
        page: 'opportunity-details',
        modal: 'add-event',
        interviews: [$scope.opportunity.id]
      });
      setCurrentOpportunity();
      eventRecorder.trackEvent('open-add-event-modal');
      window.openModal('add-event-and-opportunity-fodal');
    };

    $scope.openAccordionModal = function ($event) {
      $event.stopPropagation();
      window.openModal(jQuery($event.currentTarget).data('modal'));
    };

    $scope.collabAccordionOpen = true;
    $scope.collabAccordionClosed = false;
    $scope.setCollabAccordionOpen = function () {
      $timeout(function () {
        if (jQuery('#opp_collab_accordion').hasClass('is-active')) {
          $scope.collabAccordionOpen = true;
          $scope.collabAccordionClosed = false;
        } else {
          $scope.collabAccordionOpen = false;
          $scope.collabAccordionClosed = true;
        }
      }, 100);
    };

    var getOpportunity = function (interviewId) {
      return opportunitiesData.setData(interviewId);
    };

    var setupOppDetailsPage = function (updatedByUser, interviewId) {
      interviewId = interviewId || $routeParams.id;
      return getOpportunity(interviewId).then(function successCallback () {
        var opp = opportunitiesData.getOpp(interviewId);
        $scope.waitingForOpportunity = false;
        opp.data.events = _.sortBy(opp.data.events, function(o) {
          return 0 - new Date(o.date).getTime();
        });
        $scope.opportunity = opp.data;
        broadcastOpportunityUpdated();
        $timeout(function() {
          jQuery(document).foundation();
        });
      }, function errorCallback () {
        $location.path('/');
      });
    };
    setupOppDetailsPage(false).then(function () {
      opportunitiesData.setCbData({id: $scope.opportunity.id}).then(function successCallback () {
        $scope.opportunity.cbData = opportunitiesData.getCbData($scope.opportunity.id);
        setCurrentOpportunity();
      });
      opportunitiesData.setGdData({id: $scope.opportunity.id}).then(function successCallback () {
        $scope.opportunity.gdData = opportunitiesData.getGdData($scope.opportunity.id);
        setCurrentOpportunity();
      });
      eventRecorder.trackEvent({
        action: 'load-page',
        page: 'opportunity-details',
        interviews: [$scope.opportunity.id]
      });
      if ($scope.userData.need_ftu_opportunity_details) {
        window.openModal('opportunity_details_ftu_overlay');
        $rootScope.$broadcast('ftuOverlayModalOpened', 'opportunity_details_ftu_overlay');
        $http({
          method: 'PUT',
          url: '/api/users/need_ftu_opportunity_details'
        }).then(function (resp) {
          if (resp && resp.data && resp.data.user) {
            userProperties.set(resp.data.user);
          }
        });
      }
      if ($routeParams.event_notes && !openedEventNotesModal) {
        openedEventNotesModal = true;
        var event = _.find($scope.opportunity.events, function (event) {
          return event.id == $routeParams.event_notes; // jshint ignore:line
        });
        if (event) {
          currentlySelectedEvent.set(event);
          $rootScope.$broadcast('settingCurrentlySelectedEvent');
          window.openModal('event-notes-modal');
        }
      } else if ($routeParams.show_guide && !openedGuideModal) {
        openedGuideModal = true;
        $scope.setupAndTrackGuideModal();
        window.openModal('guide-modal');
      } else if ($routeParams.update_feedback && !scrolledToFeedback) {
        scrolledToFeedback = true;
        $timeout(function () {
          jQuery('#event_container_' + $routeParams.update_feedback + ' .event-accordion .accordion-title').click();
          jQuery('body').scrollTop(jQuery('#event_container_' + $routeParams.update_feedback + ' .event-accordion').offset().top - 170);
        }, 300);
      } else if ($routeParams.new_event && !scrolledToNewEvent) {
        scrolledToNewEvent = true;
        $timeout(function () {
          if ($scope.opportunity.events.length > 1) {
            jQuery('html, body').animate({ scrollTop: jQuery('#event_container_' + $routeParams.new_event).offset().top - 80}, 300);
          }
        }, 300);
      }
    });

    var getNewInterviewIndex = function (interview) {
      return $scope.opportunity.events.findIndex(function (el) {
        if (moment(interview.date).isAfter(el.date)) {
          return true;
        }
        return false;
      });
    };
    var collabCleanupFunc = $rootScope.$on('newCollabFeedback', function (ev, collabFeedback) {
      if (collabFeedback) {
        $scope.opportunity.collaborator_feedbacks.push(collabFeedback);
        broadcastOpportunityUpdated();
      }
    });
    var updatedOfferCleanupFunc = $rootScope.$on('updatedOffer', function (ev, offer) {
      $scope.opportunity.offer = offer;
      broadcastOpportunityUpdated();
    });
    var addedNewEventCleanupFunc = $rootScope.$on('added-new-event', function (ev, interview) {
      if (interview) {
        var newIndex = getNewInterviewIndex(interview);
        if (newIndex > -1) {
          $scope.opportunity.events.splice(newIndex, 0, interview);
        } else {
          $scope.opportunity.events.push(interview);
        }
        broadcastOpportunityUpdated();
        // $timeout(function() {
        //   // https://github.com/zurb/foundation-sites/issues/8021
        //   jQuery('.accordion').foundation('_init');
        // });
      }
    });
    var updatedExistingEventCleanupFunc = $rootScope.$on('updated-existing-event', function (ev, interview) {
      if (interview) {
        var originalIndex;
        var matchIndex = $scope.opportunity.events.findIndex(function (el, i) {
          if (el.id === interview.id) {
            if (el.date !== interview.date) {
              originalIndex = i;
            }
            return true;
          }
        });
        if (matchIndex > -1) {
          $scope.opportunity.events[matchIndex] = interview;
          if (typeof originalIndex === 'number') {
            $scope.opportunity.events.splice(originalIndex, 1);
            var newIndex = getNewInterviewIndex(interview);
            $scope.opportunity.events.splice(newIndex, 0, interview);
          }
        } else {
          console.error('SHOULD ALWAYS FIND AN INTERVIEW THAT MATCHES');
        }
        broadcastOpportunityUpdated();
      }
    });
    var deletedInterviewCleanupFunc = $rootScope.$on('deletedInterview', function (ev, interviewId) {
      var index = $scope.opportunity.events.findIndex(function (el) {
        if (el.id === interviewId) {
          return true;
        }
      });
      if (index > -1) {
        $scope.opportunity.events.splice(index, 1);
      }
      broadcastOpportunityUpdated();
    });
    var aggregatedEventNotesCleanupFunc = $rootScope.$on('aggregatedEventNotesChanged', function (ev, notes) {
      if (notes) {
        _.each($scope.opportunity.events, function (event) {
          if (event.id === notes.event.id) {
            event.notes = notes.event.notes;
          }
          _.each(event.interviewers, function (interviewer) {
            var id = interviewer.interviewer.id;
            if (notes.interviewersHash[id]) {
              interviewer.interviewer.notes = notes.interviewersHash[id].notes;
            }
          });
          _.each(event.interactions, function (interaction) {
            _.each(interaction.interviewers, function (interviewer) {
              var id = interviewer.interviewer.id;
              if (notes.interviewersHash[id]) {
                interviewer.interviewer.notes = notes.interviewersHash[id].notes;
              }
            });
          });
        });
      }
      broadcastOpportunityUpdated();
    });
    var setOppCleanupFunc = $rootScope.$on('setOpp', function (ev, oppId) {
      if ($scope.opportunity && $scope.opportunity.id === oppId) {
        var opp = opportunitiesData.getOpp(oppId);
        $scope.opportunity.all_participants = opp.data.all_participants;
        broadcastOpportunityUpdated();
      }
    });
    var setUserPropertiesCleanupFunc = $rootScope.$on('setUserProperties', function () {
      $scope.userData = userProperties.get();
    });

    $scope.$on('$destroy', function() {
      jQuery('.tooltip').each(function () {
        var tooltip = jQuery(this);
        if (tooltip.attr('style')) {
            tooltip.remove();
          }
      });
      collabCleanupFunc();
      updatedOfferCleanupFunc();
      addedNewEventCleanupFunc();
      updatedExistingEventCleanupFunc();
      deletedInterviewCleanupFunc();
      aggregatedEventNotesCleanupFunc();
      setOppCleanupFunc();
      setUserPropertiesCleanupFunc();
    });

    var statusMessages = {};
    translateHelper.translate({ translateKey: 'opportunity_index.active-offer', containerObject: statusMessages, keyToGetResponse: 'active' });
    translateHelper.translate({ translateKey: 'opportunity_index.accepted-offer', containerObject: statusMessages, keyToGetResponse: 'accepted' });
    translateHelper.translate({ translateKey: 'opportunity_index.declined-offer', containerObject: statusMessages, keyToGetResponse: 'declined' });
    translateHelper.translate({ translateKey: 'opportunity_index.offer', containerObject: statusMessages, keyToGetResponse: 'default' });
    $scope.getStatusString = function () {
      if ($scope.opportunity.offer && $scope.opportunity.offer.status) {
        var status = $scope.opportunity.offer.status.toLowerCase();
        switch(status) {
          case 'active': return statusMessages.active;
          case 'verbal': return statusMessages.active;
          case 'written': return statusMessages.active;
          case 'accepted': return statusMessages.accepted;
          case 'declined': return statusMessages.decline;
          default: return statusMessages.default;
        }
      } else {
        return statusMessages.default;
      }
    };

    $scope.getOfferExpiration = function (date) {
      return moment(date).format('MMM D YYYY');
    };

  });
