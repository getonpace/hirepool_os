'use strict';

angular.module('hirepoolApp')
  .controller('OpportunityDetailsNotesCtrl', function($scope, $rootScope, $routeParams, $http, jQuery, $timeout) {
    var interviewId = $routeParams.id;
    var notesDirty = false;
    $scope.notesSaveStatus = '';


    $scope.accordionOpen = true;
    jQuery('body').on('down.zf.accordion', '.opp-detail-notes', function () {
      $scope.accordionOpen = true;
      $scope.$apply();
    });
    jQuery('body').on('up.zf.accordion', '.opp-detail-notes', function () {
      $scope.accordionOpen = false;
      $scope.$apply();
    });

    $scope.saveNotes = function() {
      notesDirty = false;
      $scope.notesSaveStatus = 'saving';
      $http({
        method: 'PUT',
        url: '/api/interviews/' + interviewId,
        data: {
          interview: {
            notes: $scope.interviewNotes
          }
        }
      }).then(function successCallback() {
        $timeout(function () {
          if (!notesDirty) {
            $scope.notesSaveStatus = 'saved';
          }
        }, 500);
      }, function errorCallback() {
        $scope.notesSaveStatus = 'error';
      });
    };

    $scope.setContent = function() {
      $http({
        method: 'GET',
        url: '/api/interviews/notes/' + interviewId
      }).then(function successCallback(response) {
        $scope.interviewNotes = response.data.notes;
      },
      function errorCallback() {
        // TODO: Maybe handle loading of notes better
      });
    };

    $scope.setContent();

    $scope.tinymceOptions = {
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
          $scope.notesSaveStatus = 'saving';
        });
      }
    };

    $scope.$on('$destroy', function() {
      jQuery('body').off('down.zf.accordion', '.opp-detail-notes');
      jQuery('body').off('up.zf.accordion', '.opp-detail-notes');
    });

  });
