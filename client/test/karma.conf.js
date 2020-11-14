// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2016-01-11 using
// generator-karma 1.0.1

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../app/',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    preprocessors: {
      'views/**/*.html': ['ng-html2js']
    },

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      '../bower_components/jquery/dist/jquery.js',
      '../bower_components/angular/angular.js',
      '../bower_components/angular-animate/angular-animate.js',
      '../bower_components/angular-aria/angular-aria.js',
      '../bower_components/angular-cookies/angular-cookies.js',
      '../bower_components/angular-messages/angular-messages.js',
      '../bower_components/angular-resource/angular-resource.js',
      '../bower_components/angular-route/angular-route.js',
      '../bower_components/angular-sanitize/angular-sanitize.js',
      '../bower_components/what-input/what-input.js',
      '../bower_components/foundation-sites/dist/foundation.js',
      '../bower_components/angular-cookie/angular-cookie.js',
      '../bower_components/ng-token-auth/dist/ng-token-auth.js',
      '../bower_components/lodash/lodash.js',
      '../bower_components/moment/moment.js',
      '../bower_components/motion-ui/dist/motion-ui.js',
      '../bower_components/angular-dynamic-layout/dist/angular-dynamic-layout.min.js',
      '../bower_components/ng-s3upload/build/ng-s3upload.js',
      '../bower_components/angular-mask/dist/ngMask.js',
      '../bower_components/angularjs-slider/dist/rzslider.js',
      '../bower_components/angular-elastic/elastic.js',
      '../bower_components/angular-translate/angular-translate.js',
      '../bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      '../bower_components/tinymce-dist/tinymce.js',
      '../bower_components/angular-ui-tinymce/src/tinymce.js',
      '../bower_components/ng-fastclick/dist/index.min.js',
      '../bower_components/ng-focus-if/focusIf.js',
      '../bower_components/tinymce-placeholder-attribute/placeholder/plugin.js',
      '../bower_components/highstock/highstock.js',
      '../bower_components/angular-material/angular-material.js',
      '../bower_components/angular-material-data-table/dist/md-data-table.js',
      '../bower_components/ng-file-upload/ng-file-upload.js',
      '../bower_components/SHA-1/dist/sha1.umd.js',
      '../bower_components/angulartics/src/angulartics.js',
      '../bower_components/angulartics-google-tag-manager/lib/angulartics-google-tag-manager.js',
      '../bower_components/angular-mocks/angular-mocks.js',
      // endbower
      "scripts/**/*.js",
      "views/**/*.html",
      "../test/mock/**/*.js",
      "../test/spec/**/*.js",
      "../test/helpers/**/*.js"
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine",
      "karma-ng-html2js-preprocessor"
    ],

    ngHtml2JsPreprocessor: {
      // strip this from the file path
      // stripPrefix: 'public/',
      // stripSuffix: '.ext',
      // prepend this to the
      // prependPrefix: 'served/',

      // or define a custom transform function
      // - cacheId returned is used to load template
      //   module(cacheId) will return template at filepath
      // cacheIdFromPath: function(filepath) {
      //   // example strips 'public/' from anywhere in the path
      //   // module(app/templates/template.html) => app/public/templates/template.html
      //   var cacheId = filepath.strip('public/', '');
      //   return cacheId;
      // },

      // - setting this option will create only a single module that contains templates
      //   from all the files, so you can load them all with module('foo')
      // - you may provide a function(htmlPath, originalPath) instead of a string
      //   if you'd like to generate modules dynamically
      //   htmlPath is a originalPath stripped and/or prepended
      //   with all provided suffixes and prefixes
      // moduleName: 'foo'
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
