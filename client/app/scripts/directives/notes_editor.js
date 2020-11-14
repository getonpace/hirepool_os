(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpNotesEditor', hpNotesEditor);

function hpNotesEditor() {
  var directive = {
    templateUrl: 'views/directives/notes_editor.html',
    restrict: 'E',
    scope: {
      notes: '=',
      opportunityId: '=',
      interviewerId: '=',
      eventId: '=',
    },
    link: linkFunc,
    controller: HpNotesEditorController,
    controllerAs: 'vm',
    bindToController: true
  };
  return directive;

  function linkFunc(/*scope, element, attrs*/) {
    /* */
  }
}

HpNotesEditorController.$inject = ['$http', '$timeout', '$rootScope'];
function HpNotesEditorController ($http, $timeout, $rootScope) {
  var vm = this;
  vm.view = {};

  var notesDirty;

  vm.saveNotes = saveNotes;

  function saveNotes () {
    notesDirty = false;
    vm.view.notesSaveStatus = 'saving';
    var data = {
      interview: {
        id: vm.opportunityId,
      },
      notes: vm.notes,
    };
    if (vm.interviewerId) {
      data.interviewer_id = vm.interviewerId;
    }
    $http({
      method: 'PUT',
      url: '/api/events/notes/' + vm.eventId,
      data: data,
    }).then(function successCallback () {
      $timeout(function () {
        if (!notesDirty) {
          vm.view.notesSaveStatus = 'saved';
          $rootScope.$broadcast('eventNotesChanged');
        }
      }, 500);
    }, function errorCallback() {
      vm.view.notesSaveStatus = 'error';
    });
  }

  vm.view.tinymceOptions = {
    baseURL: '//cdnjs.cloudflare.com/ajax/libs/tinymce/4.3.10',
    elementpath: false,
    // fixed_toolbar_container: '#notes-toolbar',
    height: 200,
    // inline: true,
    menubar: false,
    plugins: 'lists textcolor placeholder',
    resize: false,
    statusbar: false,
    toolbar: 'bold italic underline bullist forecolor',
    toolbar_items_size: 'small',
    setup: function(editor) {
      editor.on('keyup', function() {
        notesDirty = true;
        vm.view.notesSaveStatus = 'saving';
      });
    }
  };
}

})();
