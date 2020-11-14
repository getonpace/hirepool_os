'use strict';

ComparisonViewController.$inject = ['$scope', '_', 'jQuery', '$rootScope', '$timeout', 'companyCompare', 'userProperties', 'eventRecorder', '$translate'];
function ComparisonViewController ($scope, _, jQuery, $rootScope, $timeout, companyCompare, userProperties, eventRecorder, $translate) {
  var $ = jQuery;
  var vm = this;

  vm.showLoading = showLoading;
  vm.surveyAnswers = userProperties.getSurvey();
  vm.comparePublicCo = companyCompare.comparePublicCo;
  vm.compareHasInterviews = companyCompare.compareHasInterviews;
  vm.opportunitiesToCompare = [];

  function showLoading () {
    var isLoading = false;
    if (vm.opportunitiesToCompare.length) {
      _.each(vm.opportunitiesToCompare, function (opportunity) {
        if (opportunity.comparisonViewIsLoading) {
          isLoading = true;
        }
      });
    }
    return isLoading;
  }

  // ProductsTable stuff from https://codyhouse.co/gem/products-comparison-table/
  function ProductsTable (element) {
    this.element = element;
    this.table = this.element.children('.cd-products-table');
    this.tableHeight = this.table.height();
    this.productsWrapper = this.table.children('.cd-products-wrapper');
    this.tableColumns = this.productsWrapper.children('.cd-products-columns');
    this.products = this.tableColumns.children('.product');
    this.productsNumber = this.products.length;
    this.productWidth = this.products.eq(0).width();
    this.productsTopInfo = this.table.find('.top-info');
    this.featuresTopInfo = this.table.children('.features').children('.top-info');
    this.topInfoHeight = this.featuresTopInfo.innerHeight();
  }
  ProductsTable.prototype.updateTopScrolling = function(scrollTop) {
    var offsetTop = this.table.offset().top;
    if ( offsetTop < scrollTop && offsetTop + this.tableHeight - this.topInfoHeight >= scrollTop ) {
      //fix products top-info && arrows navigation
      if ( !this.table.hasClass('top-fixed') && $(document).height() > offsetTop + $(window).height() ) {
        this.table.addClass('top-fixed').removeClass('top-scrolling');
        if ( checkMQ() === 'desktop' ) {
          this.productsTopInfo.css('top', '0');
        }
      }
    } else if ( offsetTop < scrollTop ) {
      //product top-info && arrows navigation -  scroll with table
      this.table.removeClass('top-fixed').addClass('top-scrolling');
      if ( checkMQ() === 'desktop' )  {
        this.productsTopInfo.css('top', (this.tableHeight - this.topInfoHeight) +'px');
      }
    } else {
      //product top-info && arrows navigation -  reset style
      this.table.removeClass('top-fixed top-scrolling');
      this.productsTopInfo.attr('style', '');
    }
  };
  ProductsTable.prototype.updateProperties = function() {
    this.tableHeight = this.table.height();
    this.tableColumns = this.productsWrapper.children('.cd-products-columns');
    this.products = this.tableColumns.children('.product');
    this.productsNumber = this.products.length;
    this.productWidth = this.products.eq(0).width();
    this.topInfoHeight = this.featuresTopInfo.innerHeight() + 30;
    this.tableColumns.css('width', this.productWidth*this.productsNumber + 'px');
  };
  function checkScrolling () {
    var scrollTop = $(window).scrollTop();
    comparisonTables.forEach(function(element){
      element.updateTopScrolling(scrollTop);
    });

    windowScrolling = false;
  }
  function checkResize () {
    comparisonTables.forEach(function(element){
      element.updateProperties();
    });

    windowResize = false;
  }
  function checkMQ () {
    //check if mobile or desktop device
    return 'desktop';
    // return window.getComputedStyle(comparisonTables[0].element.get(0), '::after').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "");
  }
  var comparisonTables = [];
  var windowScrolling = false;
  var windowResize = false;
  function productTableResizer () {
    if(!windowResize) {
      windowResize = true;
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(checkResize);
      } else {
        setTimeout(checkResize, 250);
      }
    }
  }
  function productTableScroller () {
    if(!windowScrolling) {
      windowScrolling = true;
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(checkScrolling);
      } else {
        setTimeout(checkScrolling, 250);
      }
    }
  }
  var setupProductsTables = function () {
    $('.cd-products-comparison-table').each(function () {
      //create a ProductsTable object for each .cd-products-comparison-table
      comparisonTables.push(new ProductsTable($(this)));
    });
  };
  // end ProductsTable stuff

  vm.$onInit = function () {
    setupProductsTables();
  };

  vm.close = function () {
    $(window).off('resize', productTableResizer);
    $(window).off('scroll', productTableScroller);
    _.each(vm.opportunitiesToCompare, function (opportunity) {
      opportunity.comparisonViewIsLoading = false;
    });
    vm.opportunitiesToCompare = [];
    $rootScope.$broadcast('hideComparisonView');
  };

  var showComparisonViewCleanupFunc = $rootScope.$on('showComparisonView', function () {
    //detect window resize - reset .cd-products-comparison-table properties
    $(window).on('resize', productTableResizer);
    //detect window scroll - fix product top-info on scrolling
    $(window).on('scroll', productTableScroller);
    $timeout(function () {
      productTableResizer();
      productTableScroller();
      $('.data-tooltip').foundation();
    }, 100);
    vm.opportunitiesToCompare = _.filter(vm.opportunities, function (card) {
      var id = card.id || card.data.id;
      if (companyCompare.getCompaniesToCompare()[id]) {
        return true;
      }
      return false;
    });
    eventRecorder.trackEvent('open-comparison-view');
    eventRecorder.trackEvent({
      action: 'open-modal',
      page: 'opportunities-index',
      modal: 'comparison-view',
      interviews: vm.opportunitiesToCompare.map(function (card) {
        var id = card.id || card.data.id;
        return id;
      })
    });

    if (userProperties.showSurveyReminder()) {
      var surveyReminderText = {};
      $translate('modal.survey_reminder.comparison_view.title').then(function successCallback (translatedResponse) {
        surveyReminderText.title = translatedResponse;
        $rootScope.$broadcast('setSurveyReminderText', surveyReminderText);
      }, function errorCallback (keyToBeTranslated) {
        surveyReminderText.title = keyToBeTranslated;
        $rootScope.$broadcast('setSurveyReminderText', surveyReminderText);
      });
      $translate('modal.survey_reminder.comparison_view.reminder_text').then(function successCallback (translatedResponse) {
        surveyReminderText.reminderText = translatedResponse;
        $rootScope.$broadcast('setSurveyReminderText', surveyReminderText);
      }, function errorCallback (keyToBeTranslated) {
        surveyReminderText.reminderText = keyToBeTranslated;
        $rootScope.$broadcast('setSurveyReminderText', surveyReminderText);
      });
      window.openModal('survey-reminder-modal');
    }
  });

  var setSurveyAnswersCleanupFunc = $rootScope.$on('setSurveyAnswers', function () {
    vm.surveyAnswers = userProperties.getSurvey();
  });

  $scope.$on('$destroy', function() {
    _.each(vm.opportunitiesToCompare, function (opportunity) {
      opportunity.comparisonViewIsLoading = false;
    });
    vm.opportunitiesToCompare = [];
    showComparisonViewCleanupFunc();
    setSurveyAnswersCleanupFunc();
  });

}

angular.module('hirepoolApp').component('comparisonView', {
  templateUrl: 'views/components/comparison_view.html',
  controller: ComparisonViewController,
  controllerAs: 'vm',
  bindings: {
    opportunities: '<'
  }
});
