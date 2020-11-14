(function () {
  'use strict';

  angular
    .module('hirepoolApp')
    .controller('ResumeUploadCtrl', ResumeUploadCtrl);

  ResumeUploadCtrl.$inject = ['eventRecorder', 'userProperties', 'Upload', '$location'];
  function ResumeUploadCtrl (eventRecorder, userProperties, Upload, $location) {

    var vm = this;

    vm.view = {};
    vm.view.inProfileSetup = $location.search().profile_setup === 'true';

    vm.data = {};
    vm.data.user = userProperties.get();

    eventRecorder.trackEvent({
      action: 'load-page',
      page: 'resume_upload'
    });

    vm.upload = upload;

    function upload (file) {
      vm.view.uploading = true;
      eventRecorder.trackEvent({
        action: 'click-upload',
        page: 'resume_upload'
      });
      Upload.upload({
        url: '/api/users/' + vm.data.user.id + '/resumes/upload_resume',
        data: { resume_file: file }
      }).success(function () {
        eventRecorder.trackEvent({
          action: 'upload-succeeded',
          page: 'resume_upload'
        });
        vm.view.upload_success = true;
        vm.view.uploading = false;
      }).error(function () {
        eventRecorder.trackEvent({
          action: 'upload-failed',
          page: 'resume_upload'
        });
        vm.view.upload_error = true;
        vm.view.uploading = false;
      });
    }
  }
})();
