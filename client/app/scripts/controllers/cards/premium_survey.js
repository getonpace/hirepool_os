'use strict';

angular.module('hirepoolApp')
  .controller('PremiumSurveyCtrl', function ($rootScope, $scope, $http, userProperties, $location, _, $timeout, jQuery, eventRecorder, ConstantsFactory) {

    eventRecorder.trackEvent({
      action: 'load-page',
      page: 'premium_survey'
    });

    var surveyAnswers = userProperties.getPremiumSurvey();

    $scope.view = {};
    $scope.user = userProperties.get();
    $scope.goToResume = $location.search().upload_resume === 'true';

    $scope.clicks = 0;
    $scope.totalcards = jQuery('.card-step').length - 1;
    $scope.nextButtonHandler = function (e) {
      var card = jQuery(e.target).parents("li");
      card.addClass('card-removed').next().addClass('card-active');
      $scope.clicks++;
      jQuery('.progress').css('width' , $scope.clicks / $scope.totalcards * 100 + '%');
      $timeout(function () {
        card.remove();
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
    // WHERE? : current state : "Where are you currently"
    // ////////////////////////////////////////////
    $scope.question1 = {
      question_number: 1,
      question_desc: 'where_are_you',
      question_type: 'mult_choice_single',
      title: 'Where are you currently?',
      possible_answers: [
        {
          id: 1,
          answer_desc: 'thinking',
          answer: 'Thinking about my next career move and want to get feedback.',
        },
        {
          id: 2,
          answer_desc: 'applying',
          answer: 'Applying actively and want to land interviews.',
        },
        {
          id: 3,
          answer_desc: 'interviewing',
          answer: 'Interviewing and want to crack the code.',
        },
      ],
      answer: ''
    };

    // ////////////////////////////////////////////
    // JOB TITLE : "What job title best matches your next career move?"
    // ////////////////////////////////////////////
    $scope.getJobTitleAutoCompleteOptions = function () {
      return ConstantsFactory.JobTitleAutoCompleteOptions;
    };
    $scope.question2 = {
      question_number: 2,
      question_type: 'one_input',
      question_desc: 'job_title',
      title: 'What job title best matches your next career move?',
      job_title: null,
    };

    // ////////////////////////////////////////////
    // SUBMIT
    // ////////////////////////////////////////////
    $scope.submitSurvey1 = function (e) {
      $scope.view.submittingSurvey = true;
      $scope.nextButtonHandler(e);
      var allQuestions = [
        $scope.question1,
        $scope.question2
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
          if (question.question_number === 2) {
            answerArray = [{answer_text: question.job_title}];
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

    function goToNextPage () {
      eventRecorder.trackEvent({
        action: 'complete-survey',
        page: 'premium_survey'
      });
      eventRecorder.trackEvent('completed-survey');
      var routeUponCompletion = $scope.goToResume ? '/resume_upload?profile_setup=true' : '/';
      $location.url(routeUponCompletion);
    }

    function saveSurvey (questions) {
      questions.unshift({user: $scope.user});
      $http({
        method: 'POST',
        url: '/api/premium_surveys',
        data: questions
      }).then(function successCallback() {
        surveyAnswers = questions;
        userProperties.setPremiumSurvey(questions);
        goToNextPage();
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
        questions[$scope.question2.question_desc] = $scope.question2;
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
              if (response.question_desc === 'job_title') {
                question.job_title = response.answers[0].answer_text;
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

    updateAnswers(surveyAnswers);
    var setPremiumSurveyAnswersCleanupFunc = $rootScope.$on('setPremiumSurveyAnswers', function () {
      surveyAnswers = userProperties.getPremiumSurvey();
      updateAnswers(surveyAnswers);
    });

    $scope.$on('destroy', function () {
      setPremiumSurveyAnswersCleanupFunc();
    });

  });
