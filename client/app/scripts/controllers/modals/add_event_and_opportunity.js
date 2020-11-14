(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('ModalsAddEventAndOpportunityCtrl', ModalsAddEventAndOpportunityCtrl);

ModalsAddEventAndOpportunityCtrl.$inject = ['ConstantsFactory', '$scope', '$rootScope', 'selectedCardData', 'opportunityDetails', '_', 'emailHelpers', 'jQuery', '$http', 'moment', '$timeout', 'eventRecorder', 'opportunitiesData', '$location', 'opportunityHelpers', 'currentlySelectedEvent', 'generalHelpers'];
function ModalsAddEventAndOpportunityCtrl (ConstantsFactory, $scope, $rootScope, selectedCardData, opportunityDetails, _, emailHelpers, jQuery, $http, moment, $timeout, eventRecorder, opportunitiesData, $location, opportunityHelpers, currentlySelectedEvent, generalHelpers) {
  var vm = this;

  vm.data = {};
  vm.view = {};
  vm.view.errors = {};
  vm.view.statesOrder = {
    'add_event_and_opportunity': 0,
    'opportunity_details': 1,
    'event_details': 2,
    'poc': 3,
    'add_interaction': 4,
  };

  vm.view.OpportunitySourceDropdownOptions = ConstantsFactory.OpportunitySourceDropdownOptions;
  vm.view.ParticipantRelationshipDropdownOptions = ConstantsFactory.ParticipantRelationshipDropdownOptions;
  vm.view.EventStyleDropdownOptions = ConstantsFactory.EventStyleDropdownOptions;
  vm.view.EventSubstyleDropdownOptions = ConstantsFactory.EventSubstyleDropdownOptions;
  vm.view.InteractionStyleDropdownOptions = ConstantsFactory.InteractionStyleDropdownOptions;

  vm.view.eventModalTitles = ConstantsFactory.EventModalTitles;
  vm.view.eventModalSubtitles = ConstantsFactory.EventModalSubtitles;
  vm.view.eventModalStrings = ConstantsFactory.EventModalStrings;
  vm.view.dataIsValid = true;

  vm.fullModalReset = fullModalReset;
  fullModalReset();
  function fullModalReset () {
    resetData();
    resetValidations();
    resetView();
  }

  function resetView () {
    vm.view.addedParticipants = [];
    vm.view.addInteractionDepth = null;
    vm.view.saveAndCloseText = 'Save and close';
    vm.view.saveAndCloseClass = '';
    vm.view.savingOpportunityText = 'Save and close';
    vm.view.savingOpportunityClass = '';

    // vm.view.mode :: decide which flow to offer the user
    // add_event_and_opportunity :: user chooses the opportunity to add the event to
    // add_event :: know the opportunity, add event to it
    // edit_event :: know the event, edit it
    vm.view.mode = 'add_event_and_opportunity';

    $rootScope.$broadcast('close-dateform-dropdown');
  }

  function resetData () {
    opportunitiesData.getAll().then(function (opps) {
      vm.data.allOpps = opps;
    });
    vm.data.opportunitySelected = '';
    vm.data.event = {};
    resetOpportunity();
    setState('add_event_and_opportunity');
  }

  function resetOpportunity () {
    vm.data.opportunity = {
      company: {
        name: '',
      },
      all_participants: [],
    };
    vm.data.opportunitySourceFromDropdown = '';
    vm.data.opportunitySourceFromText = '';
    vm.data.opportunityLocationFromAutocomplete = '';
  }

  vm.hasClientValidationErrors = hasClientValidationErrors;
  vm.stepNext = stepNext;
  vm.stepBack = stepBack;
  vm.createEvent = createEvent;
  vm.closeModal = closeModal;
  vm.getActiveProgressClass = getActiveProgressClass;
  vm.addInteraction = addInteraction;
  vm.addParticipant = addParticipant;
  vm.deleteInteraction = deleteInteraction;
  vm.deleteParticipant = deleteParticipant;
  vm.eventInPast = eventInPast;
  vm.getFormattedDate = getFormattedDate;
  vm.accordionTitleCancel = accordionTitleCancel;
  vm.selectInteractionTypeChanged = selectInteractionTypeChanged;
  vm.addEventParticipant = addEventParticipant;
  vm.deleteEventParticipant = deleteEventParticipant;
  vm.getAllParticipants = getAllParticipants;
  vm.updateAddedParticipants = updateAddedParticipants;
  vm.showOtherRelationshipInput = showOtherRelationshipInput;
  vm.showOtherStyleInput = showOtherStyleInput;
  vm.showOtherSubstyleInput = showOtherSubstyleInput;
  vm.getEventStyleText = getEventStyleText;
  vm.oppsExist = oppsExist;
  vm.opportunitySelectedFromDropdown = opportunitySelectedFromDropdown;
  vm.getOpportunityTextWithoutJobTitle = getOpportunityTextWithoutJobTitle;
  vm.showOtherOpportunityInput = showOtherOpportunityInput;
  vm.getOpportunityRoleAutoCompleteOptions = getOpportunityRoleAutoCompleteOptions;
  vm.skipToOpportunityDetails = skipToOpportunityDetails;
  vm.addOpportunityOnly = addOpportunityOnly;
  vm.canDoAddOpportunityOnly = canDoAddOpportunityOnly;
  vm.getOpportunityTextWithJobTitle = getOpportunityTextWithJobTitle;
  vm.getBackButtonDisabled = getBackButtonDisabled;
  vm.prependWithA = prependWithA;
  vm.showNewOpportunityOptions = showNewOpportunityOptions;
  vm.getInteractionStyles = getInteractionStyles;

  function getInteractionStyles () {
    if (vm.data.event.substyleFromDropdown && vm.data.event.substyleFromDropdown.toLowerCase() === 'interview') {
      return vm.view.InteractionStyleDropdownOptions;
    } else {
      return ['Other'];
    }
  }

  function zeroOpps () {
    return (vm.data.allOpps && _.size(vm.data.allOpps) === 0);
  }

  function showNewOpportunityOptions () {
    return (vm.data.opportunitySelected === 'new_opp' || zeroOpps());
  }

  function prependWithA (textToPrepend) {
    return generalHelpers.prependWithA(textToPrepend);
  }

  function getBackButtonDisabled () {
    if (vm.view.mode === 'add_event_and_opportunity') {
      return vm.view.state === 'add_event_and_opportunity';
    } else {
      return vm.view.state === 'event_details';
    }
  }

  function getOpportunityTextWithJobTitle (opp) {
    return opportunityHelpers.getOpportunityTextWithCompanyNameAndJobTitle(opp);
  }

  function canDoAddOpportunityOnly () {
    var zeroOpps = (vm.data.allOpps && _.size(vm.data.allOpps) === 0);
    return (vm.data.opportunitySelected === 'new_opp' || zeroOpps);
  }

  function addOpportunityOnly () {
    vm.view.errors.submitAttempted = true;
    vm.view.errors.submitOnlyOpportunity = true;
    resetValidations();
    var requiredErrors = $scope.addOpportunityAndEventForm.$error.required;
    if (requiredErrors) {
      var errorsForNewOpp = false;
      var errorsForOppFromDropdown = false;
      if (vm.data.opportunitySelected === 'new_opp' || zeroOpps()) {
        if (_.find(requiredErrors, function(e) { return e.$name === 'add_event_and_opportunity_company_name'; })) {
          vm.view.errors.company_name_req = true;
          errorsForNewOpp = true;
        }
        if (errorsForNewOpp) {
          vm.view.dataIsValid = false;
        }
      } else {
        if (_.find(requiredErrors, function(e) { return e.$name === 'add_event_and_opportunity_opportunity_select'; })) {
          vm.view.errors.opportunity_req = true;
          errorsForOppFromDropdown = true;
        }
        if (errorsForOppFromDropdown) {
          vm.view.dataIsValid = false;
        }
      }
    }
    if (vm.view.dataIsValid) {
      vm.view.savingOpportunityText = 'Saving...';
      saveNewOpportunity().then(function successCallback () {
        vm.view.savingOpportunityText = 'Success!';
        closeModal();
      }, function errorCallback () {
        vm.view.savingOpportunityText = 'Error saving';
        vm.view.savingOpportunityClass = 'alert';
      });
    }
  }

  function skipToOpportunityDetails () {
    eventRecorder.trackEvent('add-opportunity-and-event-to-opportunity-details');
    setState('opportunity_details');
  }

  function getOpportunityRoleAutoCompleteOptions () {
    return ConstantsFactory.OpportunityRoleAutoCompleteOptions;
  }

  function showOtherOpportunityInput () {
    if (vm.data.opportunitySourceFromDropdown && vm.data.opportunitySourceFromDropdown.toLowerCase() === 'other') {
      return true;
    }
    return false;
  }

  function getOpportunityTextWithoutJobTitle () {
    if (vm.data.opportunity.company && vm.data.opportunity.company.name) {
      return 'the opportunity at ' + vm.data.opportunity.company.name;
    } else {
      return 'this opportunity';
    }
  }

  function opportunitySelectedFromDropdown () {
    vm.hasClientValidationErrors();
    if (vm.data.opportunitySelected === 'new_opp') {
      resetOpportunity();
    } else if (vm.data.opportunitySelected) {
      setOpportunity(opportunitiesData.getOpp(vm.data.opportunitySelected).data);
    }
  }

  function oppsExist () {
    if (vm.data.allOpps && _.size(vm.data.allOpps) > 0) {
      return true;
    }
    return false;
  }

  function getEventStyleText (event) {
    var str = '';
    if (event.style || event.styleFromDropdown || event.styleFromText) {
      str = event.style || event.styleFromText || event.styleFromDropdown;
      if (event.substyle || event.substyleFromDropdown || event.substyleFromText) {
        str = ((event.substyle || event.substyleFromText || event.substyleFromDropdown) + ' ' + str).toLowerCase();
      }
    }
    return str;
  }

  function showOtherRelationshipInput (participant) {
    if (participant && participant.relationshipFromDropdown && participant.relationshipFromDropdown.toLowerCase() === 'other') {
      return true;
    }
    return false;
  }

  function showOtherStyleInput (item) {
    if (item && item.styleFromDropdown && item.styleFromDropdown.toLowerCase() === 'other') {
      return true;
    }
    return false;
  }

  function showOtherSubstyleInput (item) {
    if (item && item.substyleFromDropdown && item.substyleFromDropdown.toLowerCase() === 'other') {
      return true;
    }
    return false;
  }

  function participantIsNew (participant) {
    var participantEmail = participant.email || '';
    var foundParticipant = vm.data.opportunity.all_participants.find(function (existingParticipant) {
      var existingParticipantEmail = existingParticipant.email || '';
      return (existingParticipant.name === participant.name) && (existingParticipantEmail === participantEmail);
    });
    if (!foundParticipant) {
      foundParticipant = vm.view.addedParticipants.find(function (existingParticipant) {
        var existingParticipantEmail = existingParticipant.email || '';
        return (existingParticipant.name === participant.name) && (existingParticipantEmail === participantEmail);
      });
      if (!foundParticipant) {
        return true;
      }
    }
    return false;
  }

  function updateAddedParticipants () {
    vm.view.addedParticipants = [];
    if (vm.data.event) {
      if (vm.data.event.poc && vm.data.event.poc.name && participantIsNew(vm.data.event.poc)) {
        vm.view.addedParticipants.push(_.cloneDeep(vm.data.event.poc));
      }
      if (vm.data.event.participants) {
        _.each(vm.data.event.participants, function (participant) {
          if (participant.name && participantIsNew(participant)) {
            vm.view.addedParticipants.push(_.cloneDeep(participant));
          }
        });
      }
      if (vm.data.event.interactions) {
        _.each(vm.data.event.interactions, function (interaction) {
          _.each(interaction.participants, function (participant) {
            if (participant.name && participantIsNew(participant)) {
              vm.view.addedParticipants.push(_.cloneDeep(participant));
            }
          });
        });
      }
    }
  }

  function formatAllParticipants () {
    if (vm.data.opportunity.all_participants && vm.data.opportunity.all_participants.length) {
      var allParticipants = vm.data.opportunity.all_participants;
      if (allParticipants[0].sourceFromDropdown) {
        //do nothing
      } else {
        _.each(allParticipants, function (participant) {
          setRelationshipValues(participant);
        });
      }
    }
  }

  function getAllParticipants () {
    formatAllParticipants();
    return vm.data.opportunity.all_participants.concat(vm.view.addedParticipants);
  }

  var lastAccordionClickEvent;
  function selectInteractionTypeChanged () {
    vm.hasClientValidationErrors();
    openAccordion(lastAccordionClickEvent);
  }
  function openAccordion ($event) {
    var $title = jQuery($event.currentTarget).parents('.accordion-title');
    if ($title.attr('aria-expanded') === 'false') {
      $timeout(function () {
        $title.click();
      }, 100);
    }
  }
  function accordionTitleCancel ($event) {
    lastAccordionClickEvent = $event;
    $event.stopPropagation();
  }

  function getFormattedDate (date) {
    return moment(date).format('MMMM D, YYYY');
  }

  function eventInPast () {
    if (vm.data.event.date) {
      return moment(vm.data.event.date).isBefore(new Date());
    }
  }

  function addInteraction () {
    if (vm.data.event.interactions) {
      vm.data.event.interactions.push({});
      vm.view.errors.interactions.push({});
    } else {
      vm.data.event.interactions = [{}];
      vm.view.errors.interactions = [{}];
    }
    addParticipant(vm.data.event.interactions.length - 1);
    initAccordion();
  }

  function addParticipant (interactionIndex) {
    var interaction = vm.data.event.interactions[interactionIndex];
    if (interaction.participants) {
      interaction.participants.push({company_id: vm.data.opportunity.company_id, user_id: vm.data.opportunity.user_id});
      vm.view.errors.interactions[interactionIndex].participants.push({});
    } else {
      interaction.participants = [{company_id: vm.data.opportunity.company_id, user_id: vm.data.opportunity.user_id}];
      vm.view.errors.interactions[interactionIndex].participants = [{}];
    }
  }

  function addEventParticipant () {
    if (vm.data.event.participants) {
      vm.data.event.participants.push({company_id: vm.data.opportunity.company_id, user_id: vm.data.opportunity.user_id});
      vm.view.errors.participants.push({});
    } else {
      vm.data.event.participants = [{company_id: vm.data.opportunity.company_id, user_id: vm.data.opportunity.user_id}];
      vm.view.errors.participants = [{}];
    }
    initAccordion();
  }

  function deleteInteraction (interactionIndex) {
    vm.data.event.interactions.splice(interactionIndex, 1);
    vm.view.errors.interactions.splice(interactionIndex, 1);
  }

  function deleteParticipant (interactionIndex, participantIndex) {
    var interaction = vm.data.event.interactions[interactionIndex];
    interaction.participants.splice(participantIndex, 1);
    var interactionErrors = vm.view.errors.interactions[interactionIndex];
    interactionErrors.participants.splice(participantIndex, 1);
  }

  function deleteEventParticipant (participantIndex) {
    vm.data.event.participants.splice(participantIndex, 1);
    vm.view.errors.participants.splice(participantIndex, 1);
  }

  function resetValidations () {
    vm.view.dataIsValid = true;
    vm.view.errors.opportunity_req = false;
    vm.view.errors.company_name_req = false;
    vm.view.errors.opportunity_ref_email_invalid = false;
    vm.view.errors.opportunity_source_req = false;
    vm.view.errors.event_style_req = false;
    vm.view.errors.event_date_req = false;
    vm.view.errors.poc_name_req = false;
    vm.view.errors.poc_relationship_req = false;
    vm.view.errors.poc_email_inv = false;
    if (vm.view.errors.interactions) {
      _.each(vm.view.errors.interactions, function (interactionErrors) {
        interactionErrors.interaction_style_req = false;
        _.each(interactionErrors.participants, function (participantErrors) {
          participantErrors.participant_relationship_req = false;
          participantErrors.participant_name_req = false;
          participantErrors.participant_email_inv = false;
        });
      });
    }
    if (vm.view.errors.participants) {
      _.each(vm.view.errors.participants, function (participantErrors) {
          participantErrors.participant_relationship_req = false;
          participantErrors.participant_name_req = false;
          participantErrors.participant_email_inv = false;
      });
    }
  }

  function createValidationsStructure () {
    resetValidations();
    vm.view.errors.interactions = [];
    _.each(vm.data.event.interactions, function (interaction) {
      var participants = [];
      _.each(interaction.participants, function () {
        participants.push({});
      });
      vm.view.errors.interactions.push({ participants: participants });
    });
    vm.view.errors.participants = [];
    _.each(vm.data.event.participants, function () {
      vm.view.errors.participants.push({});
    });
  }

  function hasClientValidationErrors (options) {
    if (options && options.submitting) {
      vm.view.errors.submitAttempted = true;
      vm.view.errors.submitOnlyOpportunity = false;
    }
    var state = vm.view.state;
    var submitAttempted = vm.view.errors.submitAttempted;
    var requiredErrors;
    if (submitAttempted) {
      resetValidations();
      if (state === 'add_event_and_opportunity') {
        requiredErrors = $scope.addOpportunityAndEventForm.$error.required;
        if (requiredErrors) {
          var errorsForNewOpp = false;
          var errorsForOppFromDropdown = false;
          if (_.find(requiredErrors, function(e) { return e.$name === 'event-style'; }) && !vm.view.errors.submitOnlyOpportunity) {
            vm.view.errors.event_style_req = true;
            errorsForNewOpp = true;
            errorsForOppFromDropdown = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'event-date'; }) && !vm.view.errors.submitOnlyOpportunity) {
            vm.view.errors.event_date_req = true;
            errorsForNewOpp = true;
            errorsForOppFromDropdown = true;
          }
          if (vm.data.opportunitySelected === 'new_opp' || zeroOpps()) {
            if (_.find(requiredErrors, function(e) { return e.$name === 'add_event_and_opportunity_company_name'; })) {
              vm.view.errors.company_name_req = true;
              errorsForNewOpp = true;
            }
            if (errorsForNewOpp) {
              vm.view.dataIsValid = false;
            }
          } else {
            if (_.find(requiredErrors, function(e) { return e.$name === 'add_event_and_opportunity_opportunity_select'; })) {
              vm.view.errors.opportunity_req = true;
              errorsForOppFromDropdown = true;
            }
            if (errorsForOppFromDropdown) {
              vm.view.dataIsValid = false;
            }
          }
        }
      } else if (state === 'opportunity_details') {
        requiredErrors = $scope.opportunityDetailsForm.$error.required;
        if (requiredErrors) {
          vm.view.dataIsValid = false;
          if (_.find(requiredErrors, function(e) { return e.$name === 'opportunity_details_company_name'; })) {
            vm.view.errors.company_name_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'opportunity_source'; })) {
            vm.view.errors.opportunity_source_req = true;
          }
        }
        if ($scope.opportunityDetailsForm.opportunity_referrer_email.$viewValue && !emailHelpers.regexp.test($scope.opportunityDetailsForm.opportunity_referrer_email.$viewValue)) {
          vm.view.dataIsValid = false;
          vm.view.errors.opportunity_ref_email_invalid = true;
        }
      } else if (state === 'event_details') {
        requiredErrors = $scope.eventDetailsForm.$error.required;
        if (requiredErrors) {
          vm.view.dataIsValid = false;
          if (_.find(requiredErrors, function(e) { return e.$name === 'details-event-style'; })) {
            vm.view.errors.event_style_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'details-event-date'; })) {
            vm.view.errors.event_date_req = true;
          }
        }
      } else if (state === 'poc') {
        requiredErrors = $scope.addPocForm.$error.required;
        if (requiredErrors) {
          vm.view.dataIsValid = false;
          if (_.find(requiredErrors, function(e) { return e.$name === 'poc-name'; })) {
            vm.view.errors.poc_name_req = true;
          }
          if (_.find(requiredErrors, function(e) { return e.$name === 'poc-relationship'; })) {
            vm.view.errors.poc_relationship_req = true;
          }
        }
        if ($scope.addPocForm['poc-email'].$viewValue && !emailHelpers.regexp.test($scope.addPocForm['poc-email'].$viewValue)) {
          vm.view.errors.poc_email_inv = true;
          vm.view.dataIsValid = false;
        }
      } else if (state === 'add_interaction') {
        var eventDetailLevel = vm.view.addInteractionDepth;
        if (eventDetailLevel === 'add_participants') {
          _.each(vm.data.event.participants, function (participant, pIndex) {
            if (!participant.relationshipFromDropdown) {
              vm.view.dataIsValid = false;
              vm.view.errors.participants[pIndex].participant_relationship_req = true;
            }
            if (!participant.name) {
              vm.view.dataIsValid = false;
              vm.view.errors.participants[pIndex].participant_name_req = true;
            }
            if (participant.email && !emailHelpers.regexp.test(participant.email)) {
              vm.view.dataIsValid = false;
              vm.view.errors.participants[pIndex].participant_email_inv = true;
            }
          });
        }
        if (eventDetailLevel === 'add_interactions') {
          _.each(vm.data.event.interactions, function (interaction, iIndex) {
            if (!interaction.styleFromDropdown) {
              vm.view.dataIsValid = false;
              vm.view.errors.interactions[iIndex].interaction_style_req = true;
            }
            _.each(interaction.participants, function (participant, pIndex) {
              if (!participant.relationshipFromDropdown) {
                vm.view.dataIsValid = false;
                vm.view.errors.interactions[iIndex].participants[pIndex].participant_relationship_req = true;
              }
              if (!participant.name) {
                vm.view.dataIsValid = false;
                vm.view.errors.interactions[iIndex].participants[pIndex].participant_name_req = true;
              }
              if (participant.email && !emailHelpers.regexp.test(participant.email)) {
                vm.view.dataIsValid = false;
                vm.view.errors.interactions[iIndex].participants[pIndex].participant_email_inv = true;
              }
            });
          });
        }
      }
    }
  }

  function ensureOneInteraction () {
    if (vm.data.event.interactions && vm.data.event.interactions.length > 0) {
      // do nothing?
    } else {
      addInteraction();
    }
  }

  function ensureOneParticipant () {
    if (vm.data.event.participants && vm.data.event.participants.length > 0) {
      // do nothing?
    } else {
      addEventParticipant();
    }
  }

  function setState (state) {
    if (state === 'add_interaction') {
      ensureOneInteraction();
      ensureOneParticipant();
    }
    vm.view.state = state;
    vm.view.title = vm.view.eventModalTitles[state];
    vm.view.subtitle = vm.view.eventModalSubtitles[state];
    vm.view.errors.submitAttempted = false;
    vm.view.errors.submitOnlyOpportunity = false;
  }

  function stepNext () {
    var state = vm.view.state;
    hasClientValidationErrors({submitting: true});
    if (vm.view.dataIsValid) {
      if (state === 'add_event_and_opportunity') {
        eventRecorder.trackEvent('add-opportunity-and-event-to-poc');
        setState('poc');
      } else if (state === 'opportunity_details') {
        eventRecorder.trackEvent('opportunity-details-to-event-details');
        setState('event_details');
      } else if (state === 'event_details') {
        eventRecorder.trackEvent('event-details-to-poc');
        setState('poc');
      } else if (state === 'poc') {
        eventRecorder.trackEvent('add-event-to-add-interaction');
        updateAddedParticipants();
        setState('add_interaction');
        initAccordion();
      }
    }
  }

  function stepBack () {
    var state = vm.view.state;
    resetValidations();
    if (state === 'opportunity_details') {
      setState('add_event_and_opportunity');
    } else if (state === 'event_details') {
      setState('opportunity_details');
    } else if (state === 'poc') {
      setState('event_details');
    } else if (state === 'add_interaction') {
      setState('poc');
    }
  }

  function initAccordion () {
    $timeout(function () {
      var elems = jQuery('.accordion');
      if (elems.length > 0) {
        elems.foundation();
        elems.foundation('_init');
      }
    }, 100);
  }

  function saveOpportunity () {
    if (vm.data.opportunity.id) {
      return saveExistingOpportunity();
    } else {
      return saveNewOpportunity();
    }
  }

  function saveExistingOpportunity () {
    return new Promise(function (resolve, reject) {
      if (vm.view.dataIsValid && vm.data.opportunity.id) {
        $http({
          method: 'GET',
          url: '/api/interviews/notes/' + vm.data.opportunity.id
        }).then(function successCallback (response) {
          vm.data.opportunity.notes = response.data.notes;
          updateOpportunityDataFromUI();
          $http({
            method: 'PUT',
            url: '/api/interviews/' + vm.data.opportunity.id,
            data: vm.data.opportunity,
          }).then(function successCallback (response) {
            eventRecorder.trackEvent({
              action: 'updated-opportunity',
              modal: 'add-opportunity-and-event',
              interviews: [response.data.interview.id]
            });
            eventRecorder.trackEvent('updated-opportunity');
            $rootScope.$broadcast('opportunityUpdated', {
              id: response.data.interview.id,
              opportunity: response.data.interview,
            });
            setOpportunity(response.data.interview);
            resolve();
          }, function errorCallback (err) {
            reject(err);
          });
        }, function errorCallback (err) {
          reject(err);
        });
      } else {
        reject();
      }
    });
  }

  function saveNewOpportunity () {
    return new Promise(function (resolve, reject) {
      if (vm.view.dataIsValid) {
        updateOpportunityDataFromUI();
        $http({
          method: 'POST',
          url: '/api/interviews',
          data: {
            interview: vm.data.opportunity,
            company: vm.data.opportunity.company,
          }
        }).then(function successCallback (response) {
          eventRecorder.trackEvent({
            action: 'created-opportunity',
            modal: 'add-opportunity-and-event',
            interviews: [response.data.interview.id]
          });
          eventRecorder.trackEvent('added-opportunity');
          $rootScope.$broadcast('opportunityCreated', {
            id: response.data.interview.id,
            opportunity: response.data.interview,
          });
          setOpportunity(response.data.interview);
          resolve();
        }, function errorCallback (err) {
          reject(err);
        });
      } else {
        reject();
      }
    });
  }

  function createEvent () {
    hasClientValidationErrors({submitting: true});
    if (vm.view.dataIsValid) {
      vm.view.saveAndCloseText = 'Saving...';
      saveOpportunity().then(function successCallback () {
        saveEvent().then(function successCallback () {
          vm.view.saveAndCloseText = 'Success!';
          closeModal();
        }, function errorCallback () {
          vm.view.saveAndCloseText = 'Error saving';
          vm.view.saveAndCloseClass = 'error';
        });
      }, function errorCallback () {
        vm.view.saveAndCloseText = 'Error saving';
        vm.view.saveAndCloseClass = 'error';
      });
    } else {
      $timeout(function () {
        var topFormWithErrors = jQuery('.add-event-container .accordion-item .ac-form.error')[0];
        var $accordionItem = jQuery(topFormWithErrors).parents('.accordion-item');
        var $accordionTitle = $accordionItem.find('.accordion-title');
        if ($accordionTitle.attr('aria-expanded') !== 'true') {
          $accordionTitle.click();
        }
        jQuery($accordionItem.find('.ac-form.error input, .ac-form.error select')[0]).focus();
      });
    }
  }

  function saveExistingEvent (participants, interactions) {
    return $http({
      method: 'PUT',
      url: '/api/events/' + vm.data.event.id,
      data: {
        interview: {
          id: vm.data.opportunity.id
        },
        event: {
          style: getStyle(vm.data.event),
          substyle: getSubstyle(vm.data.event),
          date: vm.data.event.date,
          time_specified: false,
          culture_val: vm.data.event.culture_val,
          one_word: vm.data.event.one_word,
          interviewers: participants,
          interactions: interactions
        }
      }
    });
  }

  function saveNewEvent (participants, interactions) {
    return $http({
      method: 'POST',
      url: '/api/events/',
      data: {
        interview: {
          id: vm.data.opportunity.id
        },
        event: {
          style: getStyle(vm.data.event),
          substyle: getSubstyle(vm.data.event),
          date: vm.data.event.date,
          time_specified: false,
          culture_val: vm.data.event.culture_val,
          one_word: vm.data.event.one_word,
          interviewers: participants,
          interactions: interactions
        }
      }
    });
  }

  function saveEvent () {
    return new Promise(function (resolve, reject) {
      if (vm.view.dataIsValid) {
        var interactions = [];
        if (vm.view.addInteractionDepth === 'add_interactions') {
          _.each(vm.data.event.interactions, function (interaction) {
            var participants = [];
            _.each(interaction.participants, function (participant) {
              participants.push({
                name: participant.name,
                email: participant.email,
                excited: participant.excited,
                relationship: getRelationship(participant),
                company_id: participant.company_id,
                user_id: participant.user_id,
              });
            });
            interactions.push({
              style: getStyle(interaction),
              culture_val: interaction.culture_val,
              one_word: interaction.one_word,
              interviewers: participants
            });
            if (interaction.id) {
              interactions[interactions.length - 1].id = interaction.id;
            }
          });
        } else {
          vm.data.event.interactions = [];
        }
        var participants = [{
          name: vm.data.event.poc.name,
          email: vm.data.event.poc.email,
          excited: vm.data.event.poc.excited,
          relationship: getRelationship(vm.data.event.poc),
          company_id: vm.data.opportunity.company_id,
          user_id: vm.data.opportunity.user_id,
          is_poc: true
        }];
        if (vm.view.addInteractionDepth === 'add_participants') {
          _.each(vm.data.event.participants, function (participant) {
            participants.push({
              name: participant.name,
              email: participant.email,
              excited: participant.excited,
              relationship: getRelationship(participant),
              company_id: participant.company_id,
              user_id: participant.user_id,
            });
          });
        } else {
          vm.data.event.participants = [];
        }
        if (vm.data.event.id) {
          saveExistingEvent(participants, interactions).then(function successCallback (response) {
            eventRecorder.trackEvent({
            action: 'updated-event',
            modal: 'add-event',
            interviews: [response.data.event.interview_id],
            event_id: response.data.event.id
            });
            $rootScope.$broadcast('updated-existing-event', response.data.event, response.data.event.interview_id);
            updateEvent(response.data.event);
            resolve();
          }, function errorCallback (error) {
            console.error(error);
            reject();
          });
        } else {
          saveNewEvent(participants, interactions).then(function successCallback (response) {
            eventRecorder.trackEvent({
              action: 'created-event',
              modal: 'add-event',
              interviews: [response.data.event.interview_id],
              event_id: response.data.event.id
            });
            $rootScope.$broadcast('added-new-event', response.data.event, response.data.event.interview_id);
            updateEvent(response.data.event);
            eventRecorder.trackEvent('added-event');
            var style = getStyle(vm.data.event);
            var substyle = getSubstyle(vm.data.event);
            if (substyle && substyle.toLowerCase() === 'interview') {
              eventRecorder.trackEvent('added-interview-event');
              if (style && style.toLowerCase() === 'in-person') {
                eventRecorder.trackEvent('added-in-person-interview-event');
              }
            }
            resolve();
          }, function errorCallback (error) {
            console.error(error);
            reject();
          });
        }
      } else {
        reject();
      }
    });
  }

  function updateOpportunityDataFromUI () {
    if (vm.data.opportunitySourceFromDropdown.toLowerCase() === 'other' && vm.data.opportunitySourceFromText) {
      vm.data.opportunity.source = vm.data.opportunitySourceFromText;
    } else {
      vm.data.opportunity.source = vm.data.opportunitySourceFromDropdown;
    }
    if (vm.data.opportunityLocationFromAutocomplete) {
      vm.data.opportunity.location = vm.data.opportunityLocationFromAutocomplete;
    }
  }

  function closeModal () {
    $timeout(function () {
      jQuery('.modal .close-button').trigger('click');
    }, 100);
    if (vm.data.opportunity.id) {
      $location.path('/opportunity/' + vm.data.opportunity.id);
      if (vm.data.event.id) {
        $location.search('new_event', vm.data.event.id);
      }
    }
  }

  function getActiveProgressClass (elementState) {
    if (vm.view.statesOrder[elementState] <= vm.view.statesOrder[vm.view.state]) {
      return 'active';
    }
    return '';
  }

  function updateEvent (event) {
    vm.data.event = event;
    setStyleValues(vm.data.event);
    setSubstyleValues(vm.data.event);
    _.each(vm.data.event.interactions, function (interaction) {
      interaction.participants = interaction.interviewers;
      setInteractionStyleValues(interaction);
      _.each(interaction.participants, function (participant) {
        participant.name = participant.interviewer.name;
        participant.email = participant.interviewer.email;
        participant.relationship = participant.interviewer.relationship;
        participant.company_id = participant.interviewer.company_id || vm.data.opportunity.company_id;
        participant.user_id = participant.interviewer.user_id || vm.data.opportunity.user_id;
        setRelationshipValues(participant);
      });
    });
    vm.data.event.participants = [];
    _.each(vm.data.event.interviewers, function (interviewer) {
      if (interviewer.is_poc) {
        vm.data.event.poc = {
          name: interviewer.interviewer.name,
          email: interviewer.interviewer.email,
          relationship: interviewer.interviewer.relationship,
          excited: interviewer.excited,
          company_id: interviewer.company_id || vm.data.opportunity.company_id,
          user_id: interviewer.user_id || vm.data.opportunity.user_id,
        };
        setRelationshipValues(vm.data.event.poc);
      } else {
        var newParticipant = {
          name: interviewer.interviewer.name,
          email: interviewer.interviewer.email,
          relationship: interviewer.interviewer.relationship,
          excited: interviewer.excited,
          company_id: interviewer.company_id || vm.data.opportunity.company_id,
          user_id: interviewer.user_id || vm.data.opportunity.user_id,
        };
        setRelationshipValues(newParticipant);
        vm.data.event.participants.push(newParticipant);
      }
    });
    setInteractionDepth();
    createValidationsStructure();
  }

  function setInteractionDepth () {
    if (vm.data.event.interactions && vm.data.event.interactions.length) {
      vm.view.addInteractionDepth = 'add_interactions';
    } else if (vm.data.event.participants && vm.data.event.participants.length) {
      vm.view.addInteractionDepth = 'add_participants';
    } else {
      vm.view.addInteractionDepth = 'event_only';
    }
  }

  function getSubstyle (item) {
    if (item.substyleFromDropdown && item.substyleFromDropdown !== 'Other') {
      return item.substyleFromDropdown;
    } else {
      return item.substyleFromText || item.substyleFromDropdown;
    }
  }

  function getStyle (item) {
    if (item.styleFromDropdown && item.styleFromDropdown !== 'Other') {
      return item.styleFromDropdown;
    } else {
      return item.styleFromText || item.styleFromDropdown;
    }
  }

  function getRelationship (participant) {
    if (participant.relationshipFromDropdown && participant.relationshipFromDropdown !== 'Other') {
      return participant.relationshipFromDropdown;
    } else {
      return participant.relationshipFromText || participant.relationshipFromDropdown;
    }
  }

  function setInteractionStyleValues (interaction) {
    if (interaction.style) {
      var index = vm.view.InteractionStyleDropdownOptions.indexOf(interaction.style);
      if (index > -1 && vm.data.event.substyleFromDropdown && vm.data.event.substyleFromDropdown.toLowerCase() === 'interview') {
        interaction.styleFromDropdown = interaction.style;
      } else {
        interaction.styleFromDropdown = 'Other';
        interaction.styleFromText = interaction.style;
      }
    } else {
      interaction.styleFromDropdown = '';
      interaction.styleFromText = '';
    }
  }

  function setStyleValues (item) {
    if (item.style) {
      var index = vm.view.EventStyleDropdownOptions.indexOf(item.style);
      if (index > -1) {
        item.styleFromDropdown = item.style;
      } else {
        item.styleFromDropdown = 'Other';
        item.styleFromText = item.style;
      }
    } else {
      item.styleFromDropdown = '';
      item.styleFromText = '';
    }
  }

  function setSubstyleValues (item) {
    if (item.substyle) {
      var index = vm.view.EventSubstyleDropdownOptions.indexOf(item.substyle);
      if (index > -1) {
        item.substyleFromDropdown = item.substyle;
      } else {
        item.substyleFromDropdown = 'Other';
        item.substyleFromText = item.substyle;
      }
    } else {
      item.substyleFromDropdown = '';
      item.substyleFromText = '';
    }
  }

  function setRelationshipValues (participant) {
    if (participant.relationship) {
      var index = vm.view.ParticipantRelationshipDropdownOptions.indexOf(participant.relationship);
      if (index > -1) {
        participant.relationshipFromDropdown = participant.relationship;
      } else {
        participant.relationshipFromDropdown = 'Other';
        participant.relationshipFromText = participant.relationship;
      }
    } else {
      participant.relationshipFromDropdown = '';
      participant.relationshipFromText = '';
    }
  }

  function setOpportunity (opp) {
    vm.data.opportunity = opp;
    setSourceValues();
    $scope.setLocationModelValue(vm.data.opportunity.location);
  }

  function setSourceValues () {
    if (vm.data.opportunity.source) {
      var found = _.find(vm.view.OpportunitySourceDropdownOptions, function (sourceContainer) {
        var index = sourceContainer.options.indexOf(vm.data.opportunity.source);
        return index > -1;
      });
      if (found) {
        vm.data.opportunitySourceFromDropdown = vm.data.opportunity.source;
      } else {
        vm.data.opportunitySourceFromDropdown = 'Other';
        vm.data.opportunitySourceFromText = vm.data.opportunity.source;
      }
    }
  }

  var setOppCleanupFunc = $rootScope.$on('setOpp', function () {
    opportunitiesData.getAll().then(function (opps) {
      vm.data.allOpps = opps;
    });
  });
  var eventCleanupFunc = $rootScope.$on('settingCurrentlySelectedEvent', function () {
    fullModalReset();
    var event = currentlySelectedEvent.get();
    if (event && event.interview_id) {
      updateEvent(event);
      setOpportunity(opportunitiesData.getOpp(event.interview_id).data);
      vm.data.opportunitySelected = vm.data.opportunity.id;
      vm.view.mode = 'edit_event';
      setState('event_details');
    }
  });
  var cardCleanupFunc = $rootScope.$on('updatingCard', function () {
    fullModalReset();
    var opp = selectedCardData.get();
    if (opp) {
      setOpportunity(opp);
      vm.data.opportunitySelected = opp.id;
      vm.view.mode = 'add_event';
      setState('event_details');
    }
  });
  var oppCleanupFunc = $rootScope.$on('currentOpportunityUpdatedBySystem', function () {
    fullModalReset();
    var opp = opportunityDetails.get();
    if (opp) {
      setOpportunity(opp);
      vm.data.opportunitySelected = opp.id;
      vm.view.mode = 'add_event';
      setState('event_details');
    }
  });
  var resetAddEventAndOpportunityFodalCleanupFunc = $rootScope.$on('reset-add-event-and-opportunity-fodal', function () {
    fullModalReset();
  });

  $scope.$on('$destroy', function() {
    setOppCleanupFunc();
    eventCleanupFunc();
    oppCleanupFunc();
    cardCleanupFunc();
    resetAddEventAndOpportunityFodalCleanupFunc();
  });
}
})();
