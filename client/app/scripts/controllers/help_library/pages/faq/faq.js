(function () {
  'use strict';

  angular
    .module('hirepoolApp')
    .controller('FaqController', FaqController);

  FaqController.$inject = ['$sce', 'eventRecorder'];
  function FaqController ($sce, eventRecorder) {

    eventRecorder.trackEvent({
      action: 'load-page',
      page: 'faq'
    });

    var vm = this;

    vm.data = {
      questions: {},
    };

    var contactInfoText = '' +
      '<div class="faq-contact-question-container">' +
        '<img src="images/intercom.png" alt="intercom">' +
        '<span>If you’ve found a bug or have questions try our customer support line via Intercom which can be found in-app in the bottom right hand corner of any page.</span>' +
      '</div>' +
      '<div class="faq-contact-question-container">' +
        '<img src="images/mail.png" alt="email">' +
        '<span>If you prefer email please do not hesitate to reach out any time for any reason to <a href="mailto:support@hirepool.io">support@hirepool.io</a>.</span>' +
      '</div>';

    vm.data.questions.what_is = {
      question_desc: 'v2.what_is',
      question_text: 'What is hirepool?',
      answer_text: 'Hirepool is the first interview preparation software 100% designed for the job seeker.',
    };
    vm.data.questions.match_jobs = {
      question_desc: 'v2.match_jobs',
      question_text: 'Does hirepool match me to jobs, or recommend them to me?',
      answer_text: $sce.trustAsHtml('Nope. Hirepool is not a job board or a search engine. We do have a <a href="https://chrome.google.com/webstore/detail/hirepool/lkjednocgkigbmobchclobdpolpmgcha">Chrome Extension</a>, however, so no matter where you find a job opportunity you can easily add it to your hirepool dashboard.'),
    };
    vm.data.questions.how_to = {
      question_desc: 'v2.how_to',
      question_text: 'How do I set up hirepool?',
      answer_text: $sce.trustAsHtml('After creating an account you get started by adding your first event. An event is a networking or interview-based interaction tied to a specific job opportunity. Check out our <a href="#/help_library/adding_events" onclick="window.scrollTo(0,0)">video on events</a>.'),
    };
    vm.data.questions.import_data = {
      question_desc: 'v2.import_data',
      question_text: 'Can I import data from other job sites?',
      answer_text: $sce.trustAsHtml('Yes! With our CSV upload, it’s easy for you to consolidate all of your previous and existing job search activity from other sites. Check out <a href="#/help_library/csv_upload" onclick="window.scrollTo(0,0)">this video</a> about the uploading a CSV in our help library.'),
    };
    vm.data.questions.export_data = {
      question_desc: 'v2.export_data',
      question_text: 'Can I export my data from hirepool?',
      answer_text: $sce.trustAsHtml('Piece of cake. If you ever want to export your data go to your user profile and you should be able to download all of your data there. If you have problems with that flow, send an email to <a href="mailto:support@hirepool.io">support@hirepool.io</a> asking for your data and we’ll send it to you promptly.'),
    };
    vm.data.questions.archive = {
      question_desc: 'v2.archive',
      question_text: 'What does it mean to archive an opportunity?',
      answer_text: $sce.trustAsHtml('When you archive an opportunity you are removing it from your dashboard. You can always toggle to see your archived opportunities or unarchive an individual job opportunity should the interview process resume. Check out <a href="#/help_library/archiving_opportunities" onclick="window.scrollTo(0,0)">this video</a> about archiving opportunities in our help library.'),
    };
    vm.data.questions.my_data = {
      question_desc: 'v2.my_data',
      question_text: 'What do you do with all the data I’m entering?',
      answer_text: $sce.trustAsHtml('Your data is safe with hirepool. We don’t email any contacts you add to hirepool unless you ask us to. We don’t sell any of your data. Check out our <a href="#/privacy_for_humans" onclick="window.scrollTo(0,0)">data policy</a> to see how we protect your data and who has access to it.'),
    };
    vm.data.questions.email_address = {
      question_desc: 'v2.email_address',
      question_text: 'How do I change my email address?',
      answer_text: $sce.trustAsHtml('We can update your email address for you. All you need to do is send us an email at <a href="mailto:support@hirepool.io">support@hirepool.io</a> and we’ll handle it.'),
    };
    vm.data.questions.contact_info = {
      question_desc: 'v2.contact_info',
      question_text: 'Help! How can I reach you?',
      answer_text: $sce.trustAsHtml(contactInfoText),
    };

  }
})();
