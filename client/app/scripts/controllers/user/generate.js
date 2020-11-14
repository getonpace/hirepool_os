(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('UserGenerateCtrl', UserGenerateCtrl);

UserGenerateCtrl.$inject = ['$scope', '$http', '$filter', '_'];
function UserGenerateCtrl ($scope, $http, $filter, _) {
  var vm = this;
  vm.view = {};
  vm.data = {};

  vm.view = {
    emailKeys: {},
    accessGroups: {}
  };
  vm.data = {

    access_group: {}
  };
  vm.errors ={
    emailKeys: {},
    accessGroups: {}
  };

  vm.hasEmailKeysValidationErrors = hasEmailKeysValidationErrors;
  vm.submitEmails = submitEmails;
  vm.getAllEmailKeys = getAllEmailKeys;
  vm.submitAccessGroup = submitAccessGroup;
  vm.hasAccessGroupsValidationErrors = hasAccessGroupsValidationErrors;
  vm.getAllGroups = getAllGroups;

  function getAllGroups () {
    $http({
      method: 'GET',
      url: '/api/access_groups/',
    }).then(function successCallback(response) {
      vm.data.access_groups = response.data.access_groups;
    }, function errorCallback(response) {
      window.alert($filter('translate')('window.alert.error') + response.data.error);
    });
  }

  function hasAccessGroupsValidationErrors () {
    var returnVal = true;
    if (vm.view.groupFormSubmitted) {
      returnVal = false;
      vm.errors.accessGroups.titleReq = false;
      vm.errors.accessGroups.keyRootReq = false;
      var requiredErrors = $scope.accessGroupForm.$error.required;
      if (requiredErrors) {
        if (_.find(requiredErrors, function(e) { return e.$name === 'key_root'; })) {
          vm.errors.accessGroups.keyRootReq = true;
        }
        if (_.find(requiredErrors, function(e) { return e.$name === 'title'; })) {
          vm.errors.accessGroups.title = true;
        }
        returnVal = true;
      }
    }
    return returnVal;
  }

  function submitAccessGroup () {
    vm.view.groupFormSubmitted = true;
    if (!hasAccessGroupsValidationErrors()) {
      $http({
        method: 'POST',
        url: '/api/access_groups/',
        data: {
          key_root: vm.data.access_group.key_root,
          user_tracking_tags: vm.data.access_group.tags ? vm.data.access_group.tags.split(',') : null,
          access_group: {
            title: vm.data.access_group.title,
            description: vm.data.access_group.description
          }
        }
      }).then(function successCallback(response) {
        vm.data.access_groups = [response.data.access_group];
      }, function errorCallback(response) {
        window.alert($filter('translate')('window.alert.error') + response.data.error);
      });
    }
  }

  function hasEmailKeysValidationErrors () {
    var returnVal = true;
    if (vm.view.emailFormSubmitted) {
      returnVal = false;
      vm.errors.emailKeys.emailsReq = false;
      var requiredErrors = $scope.emailKeysForm.$error.required;
      if (requiredErrors) {
        if (_.find(requiredErrors, function(e) { return e.$name === 'emails'; })) {
          vm.errors.emailKeys.emailsReq = true;
        }
        returnVal = true;
      }
    }
    return returnVal;
  }

  function submitEmails () {
    vm.view.emailFormSubmitted = true;
    if (!hasEmailKeysValidationErrors()) {
      $http({
        method: 'POST',
        url: '/api/keys/',
        data: {emails: vm.data.emails.split(',')}
      }).then(function successCallback(response) {
        vm.data.emailAccessKeys = response.data.email_access_keys;
        vm.data.oldEmailAccessKeys = response.data.old_email_access_keys;
      }, function errorCallback(response) {
        window.alert($filter('translate')('window.alert.error') + response.data.error);
      });
    }
  }

  function getAllEmailKeys () {
    $http({
      method: 'GET',
      url: '/api/keys/',
    }).then(function successCallback(response) {
      vm.data.oldEmailAccessKeys = response.data.email_access_keys;
    }, function errorCallback(response) {
      window.alert($filter('translate')('window.alert.error') + response.data.error);
    });
  }

}
})();
