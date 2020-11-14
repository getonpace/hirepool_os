'use strict';

/**
 * @ngdoc function
 * @name hirepoolApp.controller:UserImageCtrl
 * @description
 * # UserImageCtrl
 * Controller of the hirepoolApp
 */
angular.module('hirepoolApp')
  .controller('UserImageCtrl', function ($scope, $auth, $http, userProperties, S3Uploader, $q, _) {

    $scope.user = userProperties.get();
    $scope.attemptUpload = false;

    S3Uploader.getUploadOptions = function (uri) {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: uri,
        headers: $auth.retrieveData('auth_headers'),
      }).then(function successCallback(response) {
        deferred.resolve(response.data);
      }, function errorCallback(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    };

    if(_.isEmpty($scope.user)) {
      $auth.validateUser().then(function (user) {
        userProperties.set(user);
        $scope.user = userProperties.get();
      });
    }

    $scope.$on('s3upload:success', function (evt, xhr, fileUrl) {
      $auth.updateAccount({image: fileUrl.path})
        .then(function(resp) {
          userProperties.set(resp.data.data);
        })
        .catch(function() {
        });
    });
    $scope.$on('s3upload:error', function () {

    });
  });
