'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:OpportunityDetailsCollaboratorCtrl
 * @description
 * # OpportunityDetailsCollaboratorCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('OpportunityDetailsCollaboratorCtrl', function ($scope, translateHelper) {

    $scope.maxLength = 150;
    $scope.showLongFeedback = false;
    $scope.setShowLongFeedback = function (val) {
      $scope.showLongFeedback = val;
    };
    $scope.shortFeedback = function () {
      if ($scope.collaborator.feedback) {
        return $scope.collaborator.feedback.slice(0, $scope.maxLength) + '...';
      }
      return '';
    };

    var descriptorWords = {};
    translateHelper.translate({ translateKey: 'opportunity-details.high-rating', containerObject: descriptorWords, keyToGetResponse: 'high' });
    translateHelper.translate({ translateKey: 'opportunity-details.low-rating', containerObject: descriptorWords, keyToGetResponse: 'low' });
    translateHelper.translate({ translateKey: 'opportunity-details.mid-rating', containerObject: descriptorWords, keyToGetResponse: 'mid' });
    translateHelper.translate({ translateKey: 'opportunity-details.unrated', containerObject: descriptorWords, keyToGetResponse: 'unrated' });
    $scope.getDescriptorWord = function () {
      if ($scope.collaborator.rating) {
        if ($scope.collaborator.rating > 6) {
          return descriptorWords.high;
        }
        if ($scope.collaborator.rating < 4) {
          return descriptorWords.low;
        }
        return descriptorWords.mid;
      }
      return descriptorWords.unrated;
    };

    $scope.getClass = function () {
      if ($scope.collaborator.rating > 6) {
        return 'fa-thumbs-o-up';
      }
      if ($scope.collaborator.rating < 4) {
        return 'fa-thumbs-o-down';
      }
      return 'fa-hand-paper-o';
    };

  });
