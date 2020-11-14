'use strict';

var app = angular.module('hirepoolApp');

app.filter('highlight', function($sce) {

  return function(text, phrase) {
    var regex = phrase.join('|');
    if (text) {
      text = text.replace(new RegExp('('+regex+')', 'gi'), '<span class="pac-matched">$1</span>');
    }
    return $sce.trustAsHtml(text);
  };
});