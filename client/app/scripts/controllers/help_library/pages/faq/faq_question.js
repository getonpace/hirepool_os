(function () {

  'use strict';

  angular.module('hirepoolApp').component('faqQuestion', {
    templateUrl: 'views/help_library/pages/faq/faq_question.html',
    controller: FaqQuestionController,
    controllerAs: 'vm',
    bindings: {
      question: '<',
    }
  });

  FaqQuestionController.$inject = ['$http', 'userProperties', 'eventRecorder'];
  function FaqQuestionController ($http, userProperties, eventRecorder) {
    var vm = this;

    vm.vote = vote;
    vm.user = userProperties.get();

    function vote (useful) {
      if (vm.useful !== useful) {
        vm.useful = useful;
        if (vm.user.id) {
          var question = vm.question;
          if (vm.question.answer_text.$$unwrapTrustedValue) {
            question = angular.copy(vm.question);
            question.answer_text = vm.question.answer_text.$$unwrapTrustedValue();
          }
          var faqQuestion = {
            user_id: vm.user.id,
            question: question,
            useful: vm.useful
          };
          $http({
            method: 'POST',
            url: '/api/faq_questions',
            data: faqQuestion
          }).then(function successCallback() {
            var action = vm.useful ? 'faq-thumbs-up' : 'faq-thumbs-down';
            eventRecorder.trackEvent({
              action: action,
              page: 'faq'
            });
          }, function errorCallback() {
          });
        }
      }
    }
  }

})();
