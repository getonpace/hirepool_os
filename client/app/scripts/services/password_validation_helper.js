'use strict';

angular.module('hirepoolApp').
  service('passwordValidationHelper', function () {

    return {
      validatePassword: validatePassword
    };

    function validatePassword(password) {
      var hasUppercase, hasLowercase, hasDigit, longEnough, showPwError;
      if (password && password.length) {
        hasUppercase = !!password.match(/[A-Z]/);
        hasLowercase = !!password.match(/[a-z]/);
        hasDigit = !!password.match(/[0-9]/);
        longEnough = password.length >= 8;
        showPwError = true;
      } else {
        showPwError = false;
      }

      return { 
        pwHasUppercase: hasUppercase,
        pwHasLowercase: hasLowercase,
        pwHasDigit: hasDigit,
        pwIsLongEnough: longEnough,
        showPwError: showPwError
      };
    } 
  });