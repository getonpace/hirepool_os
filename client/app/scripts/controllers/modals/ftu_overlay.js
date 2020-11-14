(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('ModalsFtuOverlayCtrl', ModalsFtuOverlayCtrl);

ModalsFtuOverlayCtrl.$inject = ['jQuery', '$rootScope', '$scope', '$timeout', 'moment', '$element'];
function ModalsFtuOverlayCtrl (jQuery, $rootScope, $scope, $timeout, moment, $element) {
  var vm = this;

  vm.data = {};
  vm.view = {};
  vm.view.modalId = $element.attr('id');

  var triedThisStepOnce = false;

  fullModalReset();

  function resetView () {
    vm.view.step = 1;
    vm.view.textPositionHigh = false;
  }
  function resetData () {
  }
  function fullModalReset () {
    resetData();
    resetView();
  }

  vm.nextStep = nextStep;
  vm.closeOverlay = closeOverlay;

  function nextStep () {
    vm.view.step++;
    $timeout(function () {
      vm.view.textPositionHigh = false;
      $timeout(setArrowLocation, 0);
    }, 100);
  }

  function closeOverlay (ev) {
    jQuery(window).off('resize', handleWindowResize);
    window.hirepoolCloseModal(ev.currentTarget);
  }

  function drawArrow (points, el) {
    // console.log('drawArrow points:');
    // console.log(points);
    var canvasEl = el.parents('.ftu-overlay').find('.ftu-overlay-canvas')[0];
    if (points && canvasEl && canvasEl.getContext) {
      // console.log('drawArrow canvasEl:');
      // console.log(canvasEl);
      var ctx = canvasEl.getContext('2d');
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.strokeStyle = '#fefefe';
      ctx.lineWidth = 3;

      var startPointX = points.source.x;
      var startPointY = points.source.y;
      var endPointX = points.target.x;
      var endPointY = points.target.y;

      var midPointX = (startPointX + endPointX) / 2;
      var midPointY = (startPointY + endPointY) / 2;

      var le, angle, sx, sy, d, quadPointX, quadPointY;

      var verticalCenterPosition = points.position.vertical.center;
      var horizontalCenterPosition = points.position.horizontal.center;
      le = (startPointY - endPointY) / (startPointX - endPointX);
      angle = Math.atan(le);
      sx = Math.pow((startPointX - endPointX), 2);
      sy = Math.pow((startPointY - endPointY), 2);
      d = Math.sqrt(sx + sy) / 2;
      if (verticalCenterPosition === 'above' && horizontalCenterPosition === 'left') {
        quadPointX = midPointX + (d * Math.cos(angle));
        quadPointY = midPointY - (d * Math.sin(angle));
      } else if (verticalCenterPosition === 'above' && horizontalCenterPosition === 'right') {
        quadPointX = midPointX + (d * Math.sin(angle));
        quadPointY = midPointY + (d * Math.sin(angle));
      } else if (verticalCenterPosition === 'below' && horizontalCenterPosition === 'left') {
        quadPointX = midPointX + (d * Math.cos(angle));
        quadPointY = midPointY + (d * Math.cos(angle));
      } else {
        quadPointX = midPointX - (d * Math.sin(angle));
        quadPointY = midPointY + (d * Math.cos(angle));
      }

      var arrowAngle = Math.atan2(quadPointX - endPointX, quadPointY - endPointY) + Math.PI;
      var arrowWidth = 20;

      ctx.beginPath();
      ctx.moveTo(startPointX, startPointY);
      ctx.quadraticCurveTo(quadPointX, quadPointY, endPointX, endPointY);
      ctx.moveTo(endPointX - (arrowWidth * Math.sin(arrowAngle - Math.PI / 6)), endPointY - (arrowWidth * Math.cos(arrowAngle - Math.PI / 6)));
      ctx.lineTo(endPointX, endPointY);
      ctx.lineTo(endPointX - (arrowWidth * Math.sin(arrowAngle + Math.PI / 6)), endPointY - (arrowWidth * Math.cos(arrowAngle + Math.PI / 6)));
      ctx.stroke();
      ctx.closePath();
    }
  }

  function comparePositions (sourceDetails, targetDetails) {

    var vertical = 'overlap';
    var horizontal = 'overlap';
    var verticalCenter = 'above';
    var horizontalCenter = 'left';
    var verticalDistance, horizontalDistance;

    if (targetDetails.verticalCenter > sourceDetails.verticalCenter) {
      verticalCenter = 'below';
    }

    if (targetDetails.horizontalCenter > sourceDetails.horizontalCenter) {
      horizontalCenter = 'right';
    }

    if (targetDetails.left < sourceDetails.left) {
      if (targetDetails.right < sourceDetails.left) {
        horizontal = 'left';
        horizontalDistance = sourceDetails.left - targetDetails.right;
      }
    }

    if (targetDetails.top < sourceDetails.top) {
      if (targetDetails.bottom < sourceDetails.top) {
        vertical = 'above';
        verticalDistance = sourceDetails.top - targetDetails.bottom;
      }
    }

    if (targetDetails.right > sourceDetails.right) {
      if (targetDetails.left > sourceDetails.right) {
        horizontal = 'right';
        horizontalDistance = targetDetails.left - sourceDetails.right;
      }
    }

    if (targetDetails.bottom > sourceDetails.bottom) {
      if (targetDetails.top > sourceDetails.bottom) {
        vertical = 'below';
        verticalDistance = targetDetails.top - sourceDetails.bottom;
      }
    }

    return {
      vertical: {
        position: vertical,
        distance: verticalDistance,
        center: verticalCenter,
      },
      horizontal: {
        position: horizontal,
        distance: horizontalDistance,
        center: horizontalCenter,
      },
    };

  }

  function getPoints (sourceEl, targetEl) {
    var sourcePoint, targetPoint;
    var sourceDetails = sourceEl.offset();
    var targetDetails = targetEl.offset();
    sourceDetails.bottom = sourceDetails.top + sourceEl.outerHeight();
    sourceDetails.right = sourceDetails.left + sourceEl.outerWidth();
    targetDetails.bottom = targetDetails.top + targetEl.outerHeight();
    targetDetails.right = targetDetails.left + targetEl.outerWidth();
    sourceDetails.verticalCenter = ((sourceDetails.bottom - sourceDetails.top) / 2) + sourceDetails.top;
    sourceDetails.horizontalCenter = ((sourceDetails.right - sourceDetails.left) / 2) + sourceDetails.left;
    targetDetails.verticalCenter = ((targetDetails.bottom - targetDetails.top) / 2) + targetDetails.top;
    targetDetails.horizontalCenter = ((targetDetails.right - targetDetails.left) / 2) + targetDetails.left;

    var position = comparePositions(sourceDetails, targetDetails);
    // console.log('getPoints position:');
    // console.log(position);

    if (position.vertical.position === 'overlap' && position.horizontal.position === 'overlap') {
      vm.view.textPositionHigh = true;
      $timeout(setArrowLocation, 10);
    } else if (position.vertical.position === 'above') {
      sourcePoint = {
        x: sourceDetails.horizontalCenter,
        y: sourceDetails.top,
      };
      if (position.horizontal.center === 'left') {
        targetPoint = {
          x: targetDetails.right,
          y: targetDetails.verticalCenter,
        };
      } else {
        targetPoint = {
          x: targetDetails.left,
          y: targetDetails.verticalCenter,
        };
      }
    } else if (position.vertical.position === 'below') {
      sourcePoint = {
        x: sourceDetails.horizontalCenter,
        y: sourceDetails.bottom,
      };
      if (position.horizontal.center === 'left') {
        targetPoint = {
          x: targetDetails.right,
          y: targetDetails.verticalCenter,
        };
      } else {
        targetPoint = {
          x: targetDetails.left,
          y: targetDetails.verticalCenter,
        };
      }
    } else if (position.horizontal.position === 'left') {
      sourcePoint = {
        x: sourceDetails.left,
        y: sourceDetails.verticalCenter,
      };
      if (position.vertical.center === 'above') {
        targetPoint = {
          x: targetDetails.horizontalCenter,
          y: targetDetails.bottom,
        };
      } else {
        targetPoint = {
          x: targetDetails.horizontalCenter,
          y: targetDetails.top,
        };
      }
    } else if (position.horizontal.position === 'right') {
      sourcePoint = {
        x: sourceDetails.right,
        y: sourceDetails.verticalCenter,
      };
      if (position.vertical.center === 'above') {
        targetPoint = {
          x: targetDetails.horizontalCenter,
          y: targetDetails.bottom,
        };
      } else {
        targetPoint = {
          x: targetDetails.horizontalCenter,
          y: targetDetails.top,
        };
      }
    }

    return {
      source: sourcePoint,
      target: targetPoint,
      position: position,
    };
  }

  function setArrowLocation () {
    var el = jQuery('#' + vm.view.modalId + ' .ftu-step-' + vm.view.step);
    if (el && el.data()) {
      var target = el.data().target;
      var targetType = el.data().targetType;
      // console.log('setArrowLocation target:');
      // console.log(target);
      if (target) {
        if (targetType && targetType === 'class') {
          target = '.' + target + ':visible';
        } else {
          target = '#' + target + ':visible';
        }
        var targetEl = jQuery(target);
        // console.log('setArrowLocation target element:');
        // console.log(targetEl);
        if (targetEl && targetEl.length === 1) {
          triedThisStepOnce = false;
          var sourceEl = el.find('p');
          var points = getPoints(sourceEl, targetEl);
          // console.log('setArrowLocation got points:');
          // console.log(points);
          drawArrow(points, el);
        } else {
          if (triedThisStepOnce === false) {
            triedThisStepOnce = true;
            $timeout(setArrowLocation, 50);
          } else {
            if (isLastStep(el)) {
              clickCloseButton();
            } else {
              nextStep();
            }
          }
        }
      }
    }
  }

  function isLastStep (el) {
    return el.hasClass('last-step');
  }

  function clickCloseButton () {
    jQuery('.close-ftu-overlay-button').trigger('click');
  }

  var doRedrawAfter;
  var needToRedrawArrow = false;
  var resizeMs = 100;
  function arrowResizer () {
    if (needToRedrawArrow) {
      // check doRedrawAfter time
      if (moment().isAfter(doRedrawAfter)) {
        // if good, do setArrowLocation and reset needToRedrawArrow
        needToRedrawArrow = false;
        setArrowLocation();
      } else {
        $timeout(arrowResizer, resizeMs);
      }
    }
  }
  function handleWindowResize () {
    // console.log('handleWindowResize');
    // set needToRedrawArrow and doRedrawAfter time
    needToRedrawArrow = true;
    doRedrawAfter = moment().add(resizeMs, 'ms');

    // set timeout for arrowResizer
    $timeout(arrowResizer, resizeMs);
  }

  var ftuOverlayOpenCleanupFunc = $rootScope.$on('ftuOverlayModalOpened', function (ev, modalId) {
    fullModalReset();
    if (modalId === vm.view.modalId) {
      jQuery(window).on('resize', handleWindowResize);
      $timeout(function () {
        setArrowLocation();
      }, 100);
    }
  });

  $scope.$on('$destroy', function() {
    ftuOverlayOpenCleanupFunc();
  });

}
})();
