(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('OpportunityDetailsEventCtrl', OpportunityDetailsEventCtrl);

OpportunityDetailsEventCtrl.$inject = ['scoreHelpers', '$rootScope', 'currentlySelectedEvent', '$scope', '_', 'moment', 'jQuery', '$timeout', '$http', 'eventRecorder'];
function OpportunityDetailsEventCtrl (scoreHelpers, $rootScope, currentlySelectedEvent, $scope, _, moment, jQuery, $timeout, $http, eventRecorder) {
  var vm = this;
  vm.view = {};
  vm.data = {};

  vm.data.event = $scope.$parent.event;

  vm.getRating = getRating;
  vm.needsFeedback = needsFeedback;
  vm.getDay = getDay;
  vm.getMonth = getMonth;
  vm.openAccordionModal = openAccordionModal;
  vm.saveEvent = saveEvent;
  vm.getPocName = getPocName;
  vm.getPocRelationship = getPocRelationship;
  vm.getPocEmail = getPocEmail;
  vm.showEventDetails = showEventDetails;
  vm.showInteractionDetails = showInteractionDetails;
  vm.eventIsInPast = eventIsInPast;
  vm.feedbackChanged = feedbackChanged;
  vm.getEventStyleHeading = getEventStyleHeading;

  function getEventStyleHeading (event) {
    var str = '';
    if (event.style) {
      str = event.style.toLowerCase();
      if (event.substyle) {
        str = event.substyle.toLowerCase() + ' ' + str;
      }
    }
    return str;
  }

  function feedbackChanged () {
    vm.view.addingFeedback = true;
  }

  function showEventDetails () {
    if (eventIsInPast()) {
      return true;
    }
    if (vm.data.event.interviewers && vm.data.event.interviewers.length > 1) {
      return true;
    }
    return false;
  }
  function showInteractionDetails () {
    if (vm.data.event.interactions && vm.data.event.interactions.length) {
      return true;
    }
    return false;
  }

  function getPocName () {
    var poc = getPoc();
    if (poc && poc.interviewer && poc.interviewer.name) {
      return poc.interviewer.name;
    }
    return '';
  }
  function getPocRelationship () {
    var poc = getPoc();
    if (poc && poc.interviewer && poc.interviewer.relationship) {
      return poc.interviewer.relationship;
    }
    return '';
  }
  function getPocEmail () {
    var poc = getPoc();
    if (poc && poc.interviewer && poc.interviewer.email) {
      return poc.interviewer.email;
    }
    return '';
  }
  function getPoc () {
    if (vm.data.event && vm.data.event.interviewers && vm.data.event.interviewers.length) {
      var poc = vm.data.event.interviewers.find(function (interviewer) {
        return interviewer.is_poc;
      });
      return poc;
    }
  }

  function saveEvent () {
    _.each(vm.data.event.interactions, function (interaction) {
      var participants = [];
      _.each(interaction.interviewers, function (interviewer) {
        participants.push({
          name: interviewer.interviewer.name,
          email: interviewer.interviewer.email,
          excited: interviewer.excited,
          relationship: interviewer.interviewer.relationship,
          user_id: interviewer.interviewer.user_id,
          company_id: interviewer.interviewer.company_id,
        });
      });
      interaction.interviewers = participants;
    });
    var eventParticipants = [];
    _.each(vm.data.event.interviewers, function (interviewer) {
      eventParticipants.push({
        name: interviewer.interviewer.name,
        email: interviewer.interviewer.email,
        excited: interviewer.excited,
        relationship: interviewer.interviewer.relationship,
        is_poc: interviewer.is_poc,
        user_id: interviewer.interviewer.user_id,
        company_id: interviewer.interviewer.company_id,
      });
    });
    vm.data.event.interviewers = eventParticipants;
    $http({
      method: 'PUT',
      url: '/api/events/' + vm.data.event.id,
      data: {
        interview: {
          id: vm.data.event.interview_id
        },
        event: vm.data.event
      }
    }).then(function successCallback (response) {
      eventRecorder.trackEvent({
        action: 'updated-event',
        page: 'opportunity-details',
        interviews: [response.data.event.interview_id],
        event_id: response.data.event.id
      });
      $rootScope.$broadcast('cardUpdated', {id: response.data.event.interview_id});
      $rootScope.$broadcast('updated-existing-event', response.data.event, response.data.event.interview_id);
      eventRecorder.trackEvent('user-added-feedback');
    }, function errorCallback (error) {
      console.log(error);
    });
  }

  function getRating () {
    return scoreHelpers.getOneEventScore(vm.data.event);
  }

  function needsFeedback () {
    return eventIsInPast() && eventNeedsFeedback();
  }

  function eventNeedsFeedback () {
    var hasFeedback = false;
    if (vm.data.event.one_word || vm.data.event.culture_val) {
      hasFeedback = true;
    } else {
      var interactionWithFeedback = _.find(vm.data.event.interactions, function (interaction) {
        if (interaction.one_word || interaction.culture_val) {
          return true;
        } else {
          var participantWithFeedback = _.find(interaction.interviewers, function (participant) {
            if (participant.excited) {
              return true;
            }
          });
          return participantWithFeedback;
        }
      });
      if (interactionWithFeedback) {
        hasFeedback = true;
      }
    }
    if (!hasFeedback) {
      var participantWithFeedback = _.find(vm.data.event.interviewers, function (participant) {
        if (participant.excited) {
          return true;
        }
      });
      if (participantWithFeedback) {
        hasFeedback = true;
      }
    }
    return !hasFeedback;
  }

  function eventIsInPast () {
    return moment().isAfter(vm.data.event.date);
  }

  function getDay () {
    return moment(vm.data.event.date).format('D');
  }

  function getMonth () {
    return moment(vm.data.event.date).format('MMM');
  }

  function setEventData () {
    currentlySelectedEvent.set(vm.data.event);
    $rootScope.$broadcast('settingCurrentlySelectedEvent');
  }

  function openAccordionModal ($event) {
    $event.stopPropagation();
    setEventData();
    window.openModal(jQuery($event.currentTarget).data('modal'));
  }

  var currentOpportunityUpdatedCleanupFunc = $rootScope.$on('opportunity_details_page_opportunity_updated', function () {
    $timeout(function () {
      $scope.$digest();
    }, 100);
  });
  $scope.$on('$destroy', function() {
    currentOpportunityUpdatedCleanupFunc();
  });
  $scope.$on('colorRatingChanged', function () {
    vm.view.addingFeedback = true;
  });

}
})();
