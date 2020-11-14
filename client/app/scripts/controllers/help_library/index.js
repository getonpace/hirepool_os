(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('HelpLibraryCtrl', HelpLibraryCtrl);

HelpLibraryCtrl.$inject = ['eventRecorder', '$location'];
function HelpLibraryCtrl (eventRecorder, $location) {
  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'help-library'
  });

  var vm = this;

  vm.goToArticle = goToArticle;

  function goToArticle (articleName) {
    var pathToLoad = '/help_library/' + articleName;
    $location.path(pathToLoad);
  }

}
})();
