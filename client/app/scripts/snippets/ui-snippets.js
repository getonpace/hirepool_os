'use strict';

var $ = window.$;

$(document).foundation();

// var elem = new Foundation.Reveal("#add-feedback");
// elem.open();
$('.add-feedback').on('click' , function(){
  $('#feedback-modal').foundation('open');
});

//Numeric input fields limit to just # keys
/* jshint ignore:start */
function isNumberKey(evt) {
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  return !(charCode > 31 && (charCode < 48 || charCode > 57));
}
/* jshint ignore:end */

//Modal trigger
$(document).on('click', '*[data-modal-trigger]', function() {
  var modal = $(this).data('modal');
  window.openModal(modal);
});

window.openModal = function (modal) {
  $('body').addClass('modal-open');
  if (modal.indexOf('ftu_overlay') > -1) {
    $('body').addClass('ftu-overlay-modal-open');
    $('html').addClass('ftu-overlay-modal-open');
  }

  $('#' + modal).show();

  setTimeout(function () {
    $('#' + modal).addClass('in');
    $($('#' + modal).find('input, select')[0]).focus();
  }, 100);
  return false;
};

window.hirepoolCloseModal = function (el) {
  var scope = angular.element(el).scope();
  if (scope && scope.fullModalReset) {
    scope.fullModalReset();
    if(!scope.$$phase) {
      scope.$apply();
    }
  }
  if (scope && scope.vm && scope.vm.fullModalReset) {
    scope.vm.fullModalReset();
    if(!scope.$$phase) {
      scope.$apply();
    }
  }
  var modal = $(el).parents('.modal');
  modal.removeClass('in');
  setTimeout(function () {
    modal.hide();
    if (scope) {
      var rootScope = scope.$root;
      if (rootScope) {
        rootScope.$broadcast('closeModal', modal.attr('id'));
      }
    }
  }, 400);
  $('body').removeClass('modal-open');
  $('body').removeClass('ftu-overlay-modal-open');
  $('html').removeClass('ftu-overlay-modal-open');
};

//close modal
$(document).on('click', '.modal header > .close-button', function() {
  window.hirepoolCloseModal(this);
});

//close modal with escape
$(document).keyup(function(e) {
  if (e.keyCode === 27) {
    $('.modal .close-button').trigger('click');
  }
});

// close dropdown on click ANYWHERE
$(document).on('click', function() {
  $('.is-dropdown-submenu').attr('aria-hidden', 'true');
  $('.is-dropdown-submenu').removeClass('js-dropdown-active');
  $('.is-dropdown-submenu-parent').attr('aria-expanded', 'false').attr('data-is-click', 'false');
});

//off canvas nav
$(document).on('click', '[data-nav-toggle]', function() {
  var $body = $('html');
  $body.toggleClass('nav-open');
  return false;
});
