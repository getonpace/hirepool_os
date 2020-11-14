'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:CardsSurvey1Ctrl
 * @description
 * # CardsSurvey1Ctrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('CardsSurvey1Ctrl', function ($translate, translateHelper, $rootScope, $scope, $http, userProperties, $location, _, $timeout, jQuery, eventRecorder, ConstantsFactory) {

    function translate (options) {
      translateHelper.translate(options);
    }

    eventRecorder.trackEvent({
      action: 'load-page',
      page: 'survey1'
    });

    $scope.user = userProperties.get();
    $scope.surveyAnsers = userProperties.getSurvey();

    $scope.clicks = 0;
    $scope.totalcards = jQuery('.card-step').length - 1;
    $scope.nextButtonHandler = function (e) {
      var card = jQuery(e.target).parents("li");
      card.addClass('card-removed').next().addClass('card-active');
      $scope.clicks++;
      jQuery('.progress').css('width' , $scope.clicks / $scope.totalcards * 100 + '%');
      $timeout(function () {
        card.remove();
        $scope.setAddress($scope.question3.answer);
      }, 200);
    };

    $scope.questionCheckChanged = function (answer, question) {
      var questionScopeObj = $scope['question' + question.question_number];
      if (answer.value) {
        questionScopeObj.checked++;
      } else {
        questionScopeObj.checked--;
      }
    };

    //TODO: separate each card out into its own controller

    // ////////////////////////////////////////////
    // GOALS : goals affected by work : "My next job will..."
    // ////////////////////////////////////////////
    $scope.question1 = {
      question_number: 1,
      question_desc: 'next_job_goals',
      question_type: 'mult_choice_mult',
      possible_answers: [
        {id: 1, answer_desc: 'people'},
        {id: 2, answer_desc: 'product'},
        {id: 3, answer_desc: 'money'},
        {id: 4, answer_desc: 'career'},
        {id: 5, answer_desc: 'commute'}
      ],
      checked: 0
    };
    translate({ translateKey: 'survey.question1', containerObject: $scope.question1, keyToGetResponse: 'title' });
    translate({ translateKey: 'survey.question1.subtitle', containerObject: $scope.question1, keyToGetResponse: 'subtitle' });
    translate({ translateKey: 'survey.question1.answer1', containerObject: $scope.question1.possible_answers[0], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question1.answer2', containerObject: $scope.question1.possible_answers[1], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question1.answer3', containerObject: $scope.question1.possible_answers[2], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question1.answer4', containerObject: $scope.question1.possible_answers[3], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question1.answer5', containerObject: $scope.question1.possible_answers[4], keyToGetResponse: 'answer' });

    // ////////////////////////////////////////////
    // ADDRESS
    // ////////////////////////////////////////////
    $scope.question3 = {
      question_number: 3,
      question_type: 'one_input',
      question_desc: 'location',
      answer: '',
      locating: false
    };
    translate({ translateKey: 'survey.question3', containerObject: $scope.question3, keyToGetResponse: 'title' });
    translate({ translateKey: 'survey.question3.subtitle', containerObject: $scope.question3, keyToGetResponse: 'subtitle' });

    $scope.getCurrLocation = function () {
      $scope.question3.locating = true;
      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      window.navigator.geolocation.getCurrentPosition(success, error, options);

      function success(pos) {
        var crd = pos.coords;
        var geocoder = new window.google.maps.Geocoder();
        var latLng = new window.google.maps.LatLng(crd.latitude, crd.longitude);
        geocoder.geocode( { 'latLng': latLng}, function(results, status) {
          if (status === window.google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              $scope.setAddress(results[0].formatted_address);
            }
          } else {
            $scope.question3.locating = false;
            if(!$scope.$$phase) {
              $scope.$digest();
            }
            console.log("Geocode was not successful for the following reason: " + status);
          }
        });
      }

      function error(err) {
        $scope.question3.locating = false;
        if(!$scope.$$phase) {
          $scope.$digest();
        }
        $translate('survey.no-gps').then(function successCallback (resp) {
          window.alert(resp);
        }, function errorCallback (key) {
          window.alert(key);
        });
        console.warn('ERROR(' + err.code + '): ' + err.message);
      }
    };

    $scope.setAddress = function (address) {
      $scope.setLocationModelValue(address);
      $scope.question3.locating = false;
      if(!$scope.$$phase) {
        $scope.$digest();
      }
    };

    // ////////////////////////////////////////////
    // COMMUTE : length in time : "The longest (one-way) commute I want is..."
    // ////////////////////////////////////////////
    $scope.question4 = {
      question_number: 4,
      question_type: 'mult_choice_single',
      question_desc: 'commute',
      possible_answers: [
        {id: 1, answer_desc: '30min'},
        {id: 2, answer_desc: '1hr'},
        {id: 3, answer_desc: '2hr'},
        {id: 4, answer_desc: 'long'}
      ],
      answer: ''
    };
    translate({ translateKey: 'survey.question4', containerObject: $scope.question4, keyToGetResponse: 'title' });
    translate({ translateKey: 'survey.question4.subtitle', containerObject: $scope.question4, keyToGetResponse: 'subtitle' });
    translate({ translateKey: 'survey.question4.answer1', containerObject: $scope.question4.possible_answers[0], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question4.answer2', containerObject: $scope.question4.possible_answers[1], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question4.answer3', containerObject: $scope.question4.possible_answers[2], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question4.answer4', containerObject: $scope.question4.possible_answers[3], keyToGetResponse: 'answer' });


    // ////////////////////////////////////////////
    // FIELD : "The field I'm most passionate about is:"
    // ////////////////////////////////////////////
    $scope.getOpportunityRoleAutoCompleteOptions = function () {
      return ConstantsFactory.OpportunityRoleAutoCompleteOptions;
    };
    $scope.question5 = {
      question_number: 5,
      question_type: 'one_input',
      question_desc: 'field',
      role: null,
    };
    translate({ translateKey: 'survey.question5', containerObject: $scope.question5, keyToGetResponse: 'title' });
    translate({ translateKey: 'survey.question5.subtitle', containerObject: $scope.question5, keyToGetResponse: 'subtitle' });

    // ////////////////////////////////////////////
    // GOALS #2: goals you choose by : "How would you decide between two offers?"
    // ////////////////////////////////////////////
    $scope.question6 = {
      question_number: 6,
      question_type: 'mult_choice_mult',
      question_desc: 'deciding_goals',
      possible_answers: [
        {id: 1, answer_desc: 'people'},
        {id: 2, answer_desc: 'product'},
        {id: 3, answer_desc: 'commute'},
        {id: 4, answer_desc: 'money'},
        {id: 5, answer_desc: 'career'}
      ],
      checked: 0
    };
    translate({ translateKey: 'survey.question6', containerObject: $scope.question6, keyToGetResponse: 'title' });
    translate({ translateKey: 'survey.question6.subtitle', containerObject: $scope.question6, keyToGetResponse: 'subtitle' });
    translate({ translateKey: 'survey.question6.answer1', containerObject: $scope.question6.possible_answers[0], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question6.answer2', containerObject: $scope.question6.possible_answers[1], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question6.answer3', containerObject: $scope.question6.possible_answers[2], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question6.answer4', containerObject: $scope.question6.possible_answers[3], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question6.answer5', containerObject: $scope.question6.possible_answers[4], keyToGetResponse: 'answer' });

    // ////////////////////////////////////////////
    // TIMELINE : for starting new job : "How soon can you start after accepting an offer?"
    // ////////////////////////////////////////////
    $scope.question7 = {
      question_number: 7,
      question_type: 'mult_choice_single',
      question_desc: 'urgency',
      possible_answers: [
        {id: 1, answer_desc: 'high'},
        {id: 2, answer_desc: 'medium'},
        {id: 3, answer_desc: 'low'},
        {id: 4, answer_desc: 'none'},
      ],
      answer: ''
    };
    translate({ translateKey: 'survey.question7', containerObject: $scope.question7, keyToGetResponse: 'title' });
    translate({ translateKey: 'survey.question7.subtitle', containerObject: $scope.question7, keyToGetResponse: 'subtitle' });
    translate({ translateKey: 'survey.question7.answer1', containerObject: $scope.question7.possible_answers[0], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question7.answer2', containerObject: $scope.question7.possible_answers[1], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question7.answer3', containerObject: $scope.question7.possible_answers[2], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question7.answer4', containerObject: $scope.question7.possible_answers[3], keyToGetResponse: 'answer' });

    // ////////////////////////////////////////////
    // COLLABORATORS : people you listen trust : "Who do you trust to help you decide between two offers?"
    // ////////////////////////////////////////////
    $scope.question8 = {
      question_number: 8,
      question_type: 'mult_choice_mult',
      question_desc: 'collaborators',
      possible_answers: [
        {id: 1, answer_desc: 'self'},
        {id: 2, answer_desc: 'friends_fam'},
        {id: 3, answer_desc: 'peers'},
        {id: 4, answer_desc: 'mentors'}
      ],
      checked: 0
    };
    translate({ translateKey: 'survey.question8', containerObject: $scope.question8, keyToGetResponse: 'title' });
    translate({ translateKey: 'survey.question8.subtitle', containerObject: $scope.question8, keyToGetResponse: 'subtitle' });
    translate({ translateKey: 'survey.question8.answer1', containerObject: $scope.question8.possible_answers[0], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question8.answer2', containerObject: $scope.question8.possible_answers[1], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question8.answer3', containerObject: $scope.question8.possible_answers[2], keyToGetResponse: 'answer' });
    translate({ translateKey: 'survey.question8.answer4', containerObject: $scope.question8.possible_answers[3], keyToGetResponse: 'answer' });

    // ////////////////////////////////////////////
    // SUBMIT
    // ////////////////////////////////////////////
    $scope.submitSurvey1 = function (e) {
      $scope.nextButtonHandler(e);
      var allQuestions = [
        $scope.question1,
        $scope.question3,
        $scope.question4,
        $scope.question5,
        $scope.question6,
        $scope.question7,
        $scope.question8
      ];
      var processedQuestions = processForApiStandard(allQuestions);
      saveSurvey(processedQuestions);
    };

    function getAnswerDetails (answer) {
      return {
        answer_desc: answer.answer_desc,
        answer_text: answer.answer
      };
    }

    var processForApiStandard = function (questions) {
      var resultingQuestions = [];
      _.forEach(questions, function (question) {
        var answerArray;
        if (question.question_type === 'mult_choice_mult') {
          answerArray = _.map(_.filter(question.possible_answers, 'value'), getAnswerDetails);
        } else if (question.question_type === 'mult_choice_single') {
          answerArray = _.map(_.filter(question.possible_answers, { 'answer_desc' : question.answer }), getAnswerDetails);
        } else if (question.question_type === 'one_input') {
          if (question.question_number === 5) {
            answerArray = [{answer_text: question.role}];
          } else {
            answerArray = [{answer_text: question.answer}];
          }
        }
        if (answerArray) {
          resultingQuestions.push({
            question_text: question.title,
            question_desc: question.question_desc,
            question_type: question.question_type,
            answers: answerArray
          });
        }
      });
      return resultingQuestions;
    };

    function goToRoot (timeToContinue) {
      var now = new Date().getTime();
      if (now > timeToContinue) {
        eventRecorder.trackEvent({
          action: 'complete-survey',
          page: 'survey1'
        });
        eventRecorder.trackEvent('completed-survey');
        $location.path('/');
      } else {
        $timeout(function () {
          goToRoot(timeToContinue);
        }, 500);
      }
    }

    function saveSurvey (questions) {
      questions.unshift({user: $scope.user});
      var timeToContinue = new Date().getTime() + 3000;
      $http({
        method: 'POST',
        url: '/api/surveys',
        data: questions
      }).then(function successCallback() {
        $scope.surveyAnsers = questions;
        userProperties.setSurvey(questions);
        goToRoot(timeToContinue);
      }, function errorCallback() {
      });
    }

    // ////////////////////////////////////////////
    // LOAD EXISTING RESPONSES
    // ////////////////////////////////////////////
    function updateAnswers (loadedAnswers) {
      if (loadedAnswers && loadedAnswers.length > 0) {
        var questions = {};
        questions[$scope.question1.question_desc] = $scope.question1;
        questions[$scope.question3.question_desc] = $scope.question3;
        questions[$scope.question4.question_desc] = $scope.question4;
        questions[$scope.question5.question_desc] = $scope.question5;
        questions[$scope.question6.question_desc] = $scope.question6;
        questions[$scope.question7.question_desc] = $scope.question7;
        questions[$scope.question8.question_desc] = $scope.question8;
        _.each(loadedAnswers, function (response) {
          var answer;
          if (questions[response.question_desc] && response.answers) {
            var question = questions[response.question_desc];
            if (question.question_type === 'mult_choice_single') {
              if (response.question_type === 'mult_choice_single') {
                answer = _.find(question.possible_answers, {'answer_desc' : response.answers[0].answer_desc});
                if (answer) {
                  question.answer = response.answers[0].answer_desc;
                }
              }
            } else if (question.question_type === 'mult_choice_mult') {
              if (response.question_type === 'mult_choice_mult') {
                _.each(response.answers, function (answer) {
                  var answerExists = _.find(question.possible_answers, {'answer_desc' : answer.answer_desc});
                  if (answerExists) {
                    answerExists.value = true;
                    question.checked++;
                  }
                });
              }
            } else if (question.question_type === 'one_input') {
              if (response.question_desc === 'field') {
                question.role = response.answers[0].answer_text;
              } else {
                if (response.question_type === 'one_input') {
                  question.answer = response.answers[0].answer_text;
                }
              }
            }
          }
        });
      }
    }

    updateAnswers($scope.surveyAnsers);
    var setSurveyAnswersCleanupFunc = $rootScope.$on('setSurveyAnswers', function () {
      $scope.surveyAnsers = userProperties.getSurvey();
      updateAnswers($scope.surveyAnsers);
    });

    $scope.$on('destroy', function () {
      setSurveyAnswersCleanupFunc();
    });

  });
