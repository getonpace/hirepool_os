(function () {
'use strict';

angular
  .module('hirepoolApp')
  .service('translateHelper', translateHelper);

translateHelper.$inject = ['$translate'];
function translateHelper ($translate) {

  return {
    translate: translate
  };

  function translate (options) {
    if (options.translateKey && options.containerObject && options.keyToGetResponse) {
      $translate(options.translateKey).then(function successCallback (resp) {
        options.containerObject[options.keyToGetResponse] = resp;
      }, function errorCallback (key) {
        options.containerObject[options.keyToGetResponse] = key;
      });
    }
  }

}
})();
