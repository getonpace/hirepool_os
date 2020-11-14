'use strict';

/**
 * @ngdoc overview
 * @name hirepoolApp
 * @description
 * # hirepoolApp
 *
 * Main module of the application.
 */
var app = angular.module('hirepoolApp', [
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngMessages',
  'ng-token-auth',
  'RouteData',
  'dynamicLayout',
  'ngS3upload',
  'ngMask',
  'rzModule',
  'monospaced.elastic',
  'pascalprecht.translate',
  'ng-fastclick',
  'focus-if',
  'ui.tinymce',
  'config',
  'ngMaterial',
  'md.data.table',
  'ngFileUpload',
  'ui.bootstrap.datetimepicker',
  'angulartics',
  'angulartics.google.tagmanager'
  // 'fixed.table.header'
]);

app.constant('_', window._);
app.constant('moment', window.moment);
app.constant('jQuery', window.jQuery);
app.constant('tinyMCE', window.tinyMCE);

app.config(function ($routeProvider, $authProvider, RouteDataProvider, ngS3Config, _, $translateProvider, ENV, tinyMCE) {
  var appUrl = (
    (window.location.host.indexOf('localhost') >= 0) ? '/#' : '/app/#'
  );

  tinyMCE.suffix = '.min';

  $translateProvider
    .useStaticFilesLoader({prefix: 'languages/', suffix: '.json'})
    .preferredLanguage('en')
    .registerAvailableLanguageKeys(['en'], {'en-US': 'en'})
    .useSanitizeValueStrategy(null);

  ngS3Config.theme = 'user_image';

  $authProvider.configure({
    apiUrl: '/api',
    authProviderPaths: {
      facebook: '/auth/facebook',
      github: '/auth/github',
      google: '/auth/google_oauth2',
      linkedin: '/auth/linkedin',
      twitter: '/auth/twitter',
    },
    tokenFormat: {
      'access-token': '{{ token }}',
      'token-type': 'Bearer',
      'client': '{{ clientId }}',
      'expiry': '{{ expiry }}',
      'uid': '{{ uid }}',
      'provider': '{{ provider }}'
    },
    confirmationSuccessUrl: window.location.origin + appUrl + '/sign_in/',
    passwordResetSuccessUrl: window.location.origin + appUrl + '/reset_password/',
    validateOnPageLoad: false
  });

  RouteDataProvider.applyConfig({
    bodyStyle: { 'background-color': '#fefefe' },
    display: { 'display': 'block' },
    className: ''
  });
  RouteDataProvider.hookToRootScope(true);

  var intercomDone = false;
  var initializeIntercom = function (user) {
    var appId;
    // currently, only use Intercom in production
    if (ENV.name === 'production' && window.Intercom && !intercomDone) {
      appId = 'INTERCOM_KEY';
      var userObj = {
        app_id: appId,
        name: user.name || user.email,
        email: user.email,
        hirepool_id: '' + user.id,
        sponsor: user.sponsor,
        user_agreement_status: user.user_agreement_status,
        sent_event_prep_kit_1: user.sent_event_prep_kit_1,
        sent_event_prep_kit_2: user.sent_event_prep_kit_2,
        event_prep_kit_opt_out: user.event_prep_kit_opt_out,
        is_admin: user.is_admin,
        is_test_account: user.is_test_account,
        saw_welcome_screen: user.saw_welcome_screen,
        days_active: user.days_active,
        user_actions_count: user.user_actions_count,
        offers_count: user.offers_count,
        opportunities_count: user.opportunities_count,
        events_count: user.events_count,
        events_interviews_count: user.events_interviews_count,
        events_in_person_interviews_count: user.events_in_person_interviews_count,
        intercom_messaging_version: user.intercom_messaging_version,
        created_at: user.created_at,
        saw_cerebro_invite: user.saw_cerebro_invite,
        cerebro_opt_in: user.cerebro_opt_in,
      };
      if (user.access_group) {
        userObj.access_group = user.access_group.key;
      }
      if (user.user_tracking_tags) {
        userObj.user_tracking_tags = user.user_tracking_tags.map(function (tag) {
          return tag.tag;
        }).join(',');
      }
      window.Intercom('boot', userObj);
      intercomDone = true;
    }
  };

  var amplitudeDone = false;
  var initializeAmplitude = function (user) {
    if (window.amplitude && !amplitudeDone) {
      // setup amplitude to send data to prod or dev project
      // if testing in dev remove checks for `ENV.name === 'production'`
      var amplitudeProjectId = ENV.name === 'production' ? '7fe88b6ab1af3311c4c8feacff4004be' : 'b819dfc37b35361e75c590f899738b99';
      if (ENV.name === 'production') {
        window.amplitude.getInstance().init(amplitudeProjectId, user.id);
        var userProperties = {
          sponsor: user.sponsor,
          user_agreement_status: user.user_agreement_status,
          sent_event_prep_kit_1: user.sent_event_prep_kit_1,
          sent_event_prep_kit_2: user.sent_event_prep_kit_2,
          event_prep_kit_opt_out: user.event_prep_kit_opt_out,
          is_admin: user.is_admin,
          is_test_account: user.is_test_account,
          provider: user.provider,
          saw_welcome_screen: user.saw_welcome_screen,
          days_active: user.days_active,
          user_actions_count: user.user_actions_count,
          offers_count: user.offers_count,
          opportunities_count: user.opportunities_count,
          events_count: user.events_count,
          events_interviews_count: user.events_interviews_count,
          events_in_person_interviews_count: user.events_in_person_interviews_count,
          created_at: user.created_at,
        };
        if (user.access_group) {
          userProperties.access_group = user.access_group.key;
        }
        if (user.user_tracking_tags) {
          userProperties.user_tracking_tags = user.user_tracking_tags.map(function (tag) {
            return tag.tag;
          }).join(',');
        }
        window.amplitude.getInstance().setUserProperties(userProperties);
      }
    }
  };

  var setupUser = function (userProperties, user) {
    var savedUser = userProperties.get();
    if (!(savedUser && savedUser.id)) {
      userProperties.set(user);
    } else {
      user = savedUser;
    }
    return user;
  };

  var setupTools = function (user) {
    initializeIntercom(user);
    initializeAmplitude(user);
  };

  var pageIsNotForAuthedUsers = function (url) {
    return url.indexOf('help_library') < 0 && url.indexOf('privacy') < 0 && url.indexOf('user_agreement') < 0 && url.indexOf('previously_completed') < 0;
  };

  var checkNoSignInNeeded = function($q, $auth, $location, userProperties, eventRecorder) {
    var deferred = $q.defer();

    if (window.location.search.indexOf('auth_token') !== -1) {
      var searchString = window.location.search;
      var searchParams = new window.URLSearchParams(searchString.substring(1));
      var iter = searchParams.entries();
      var sp = iter.next();
      while (sp.done === false) {
        if (sp.value && sp.value[0] && sp.value[1]) {
          $location.search(sp.value[0], sp.value[1]);
        }
        sp = iter.next();
      }
    }

    $auth.validateUser().then(function successCallback (user) {
      user = setupUser(userProperties, user);
      var searchParams = $location.search();

      // HACK: If we're redirected from oauth service, lots of oauth related
      // search params get left in the URL. If we detect that there is an
      // 'auth_token' in the search param, do a location href to '/' instead.
      // This makes the initial login kind of janky with redirects, but I don't
      // see a better way unless we modify the devise token auth to switch the
      // order of the URL fragment and query strings, which is also a hack since
      // that violates URL specs.
      if (window.location.search.indexOf('auth_token') !== -1) {
        eventRecorder.trackEvent({
          action: 'login'
        });
        deferred.reject();
        if (searchParams.redirect) {
          window.location.href= appUrl + (decodeURIComponent(searchParams.redirect));
        } else if (user.saw_welcome_screen) {
          window.location.href = appUrl;
        } else {
          window.location.href = appUrl + '/welcome';
        }
      } else if (window.location.search.indexOf('account_confirmation_success') !== -1) {
        // HACK: in a similar vein to above, if we've redirected from email confirmation,
        // there are also search params leftover in the redirect url.  If there is a
        // 'account_confirmation_success' in the search param, do a location hred to '/'
        // instead.

        //eventRecorder.trackEvent({
        //  action: 'login'
        //});
        deferred.reject();
        if (searchParams.redirect) {
          window.location.href= appUrl + (decodeURIComponent(searchParams.redirect));
        } else if (user.saw_welcome_screen) {
          window.location.href = appUrl;
        } else {
          window.location.href = appUrl + '/welcome';
        }
      } else {
        if (pageIsNotForAuthedUsers($location.url())) {
          deferred.reject();
          $location.url('/');
        } else {
          deferred.resolve();
        }
      }
    }, function errorCallback () {
      deferred.resolve();
    });
    return deferred.promise;
  };

  var checkLoggedIn = function($q, $auth, $location, userProperties) {
    var route = $location.url();

    var deferred = $q.defer();
    $auth.validateUser().then(function (user) {
      user = setupUser(userProperties, user);
      if (ENV.name !== 'no_connection') {
        setupTools(user);
      }
      deferred.resolve();
    }, function () {
      deferred.reject();
      $location.url('/sign_in?redirect=' + encodeURIComponent(route));
    });
    return deferred.promise;
  };

  var checkLoggedInAndGetSurvey = function ($q, $auth, $location, userProperties, $http) {
    var route = $location.url();

    var deferred = $q.defer();
    $auth.validateUser().then(function (user) {
      user = setupUser(userProperties, user);

      // handle normal survey
      var surveyAnswers = userProperties.getSurvey();
      if (ENV.name === 'no_connection') {
        deferred.resolve();
      } else if (surveyAnswers && surveyAnswers.length > 0) {
        setupTools(user);
        deferred.resolve();
      } else {
        $http({
          method: 'GET',
          url: '/api/surveys'
        }).then(function successCallback(resp) {
            if (resp.data && resp.data.survey && resp.data.survey.answers) {
              userProperties.setSurvey(resp.data.survey.answers);
            }
            setupTools(user);
            deferred.resolve();
          }, function errorCallback() {
            setupTools(user);
            deferred.resolve();
          }
        );
      }

      // handle premium survey
      var premiumSurveyAnswers = userProperties.getPremiumSurvey();
      if (ENV.name === 'no_connection') {
        deferred.resolve();
      } else if (premiumSurveyAnswers && premiumSurveyAnswers.length > 0) {
        setupTools(user);
        deferred.resolve();
      } else {
        $http({
          method: 'GET',
          url: '/api/premium_surveys'
        }).then(function successCallback(resp) {
            if (resp.data && resp.data.survey && resp.data.survey.answers) {
              userProperties.setPremiumSurvey(resp.data.survey.answers);
            }
            setupTools(user);
            deferred.resolve();
          }, function errorCallback() {
            setupTools(user);
            deferred.resolve();
          }
        );
      }
    }, function () {
      deferred.reject();
      $location.url('/sign_in?redirect=' + encodeURIComponent(route));
    });
    return deferred.promise;
  };

  $routeProvider
    .when('/', {
      templateUrl: 'views/opportunities/index.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkLoggedInAndGetSurvey }
    })
    .when('/confirm_email', {
      templateUrl: 'views/user/confirm_email.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'none' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/sign_in', {
      templateUrl: 'views/user/login.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'none' },
        className: 'no-header'
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/sign_up', {
      templateUrl: 'views/user/no_new_signups.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/invited/:key', {
      templateUrl: 'views/user/no_new_signups.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/forgot_password', {
      templateUrl: 'views/user/forgot_password.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'none' },
        className: 'no-header'
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/reset_password', {
      templateUrl: 'views/user/reset_password.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'none' },
        className: 'no-header'
      },
      resolve : { auth: checkLoggedIn }
    })
    .when('/generate', {
      templateUrl: 'views/user/generate.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkLoggedIn }
    })
    .when('/billing', {
      templateUrl: 'views/user/billing.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkLoggedInAndGetSurvey }
    })
    .when('/admin/overview', {
      templateUrl: 'views/admin/overview/index.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkLoggedIn }
    })
    .when('/admin/overview_old', {
      templateUrl: 'views/admin/overview.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkLoggedIn }
    })
    .when('/admin/user_profile/:id', {
      templateUrl: 'views/admin/user_profile/user_profile.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkLoggedIn }
    })
    .when('/admin/activity_feed', {
      templateUrl: 'views/admin/activity_feed.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkLoggedIn }
    })
    .when('/welcome', {
      templateUrl: 'views/user/no_new_signups.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkLoggedIn }
    })
    // .when('/choose_account', {
    //   templateUrl: 'views/welcome_flow/account_options.html',
    //   RouteData: {
    //     bodyStyle: { 'background-color': '#fefefe' },
    //     display: { 'display': 'block' },
    //     className: ''
    //   },
    //   resolve : { auth: checkLoggedIn }
    // })
    .when('/help_library', {
      templateUrl: 'views/help_library/index.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/help_library/faq', {
      templateUrl: 'views/help_library/pages/faq/faq.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/help_library/collaborators', {
      templateUrl: 'views/help_library/pages/collaborators.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/help_library/welcome_video', {
      templateUrl: 'views/help_library/pages/welcome_video.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/help_library/adding_events', {
      templateUrl: 'views/help_library/pages/adding_events.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/help_library/csv_upload', {
      templateUrl: 'views/help_library/pages/csv_upload.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/help_library/adding_opportunities', {
      templateUrl: 'views/help_library/pages/adding_opportunities.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/help_library/archiving_opportunities', {
      templateUrl: 'views/help_library/pages/archiving_opportunities.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/help_library/downloading_data', {
      templateUrl: 'views/help_library/pages/downloading_data.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/help_library/networking_events', {
      templateUrl: 'views/help_library/pages/networking_events.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkLoggedInAndGetSurvey }
    })
    .when('/help_library/opportunity_ratings', {
      templateUrl: 'views/help_library/pages/opportunity_ratings.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'block' },
        className: ''
      },
      resolve : { auth: checkLoggedInAndGetSurvey }
    })
    .when('/survey1', {
      templateUrl: 'views/cards/survey1.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'none' },
        className: 'no-header cards'
      },
      resolve : { auth: checkLoggedInAndGetSurvey }
    })
    .when('/premium_survey', {
      templateUrl: 'views/cards/premium_survey.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'none' },
        className: 'no-header cards'
      },
      resolve : { auth: checkLoggedInAndGetSurvey }
    })
    .when('/grid_view', {
      templateUrl: 'views/opportunities/grid_view/index.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        className: ''
      },
      resolve : { auth: checkLoggedInAndGetSurvey }
    })
    .when('/map_view', {
      templateUrl: 'views/opportunities/map_view/index.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        className: ''
      },
      resolve : { auth: checkLoggedInAndGetSurvey }
    })
    .when('/opportunity/:id', {
      templateUrl: 'views/opportunity_details/index.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        className: ''
      },
      resolve : { auth: checkLoggedInAndGetSurvey }
    })
    // .when('/premium_signup', {
    //   templateUrl: 'views/premium_account/signup.html',
    //   RouteData: {
    //     bodyStyle: { 'background-color': '#fefefe' },
    //     className: ''
    //   },
    //   resolve : { auth: checkLoggedInAndGetSurvey }
    // })
    // .when('/checkout', {
    //   templateUrl: 'views/premium_account/signup.html',
    //   RouteData: {
    //     bodyStyle: { 'background-color': '#fefefe' },
    //     className: ''
    //   },
    //   resolve : { auth: checkLoggedInAndGetSurvey }
    // })
    // .when('/renew_subscription', {
    //   templateUrl: 'views/premium_account/signup.html',
    //   RouteData: {
    //     bodyStyle: { 'background-color': '#fefefe' },
    //     className: ''
    //   },
    //   resolve : { auth: checkLoggedInAndGetSurvey }
    // })
    .when('/resume_upload', {
      templateUrl: 'views/resume_upload/index.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        className: ''
      },
      resolve : { auth: checkLoggedInAndGetSurvey }
    })
    .when('/privacy', {
      templateUrl: 'views/privacy.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/privacy_for_humans', {
      templateUrl: 'views/privacy_for_humans.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/user_agreement', {
      templateUrl: 'views/user_agreement.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        className: ''
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .when('/provide_feedback/:id/:token', {
      templateUrl: 'views/collaborator_provide_feedback/index.html',
      RouteData: {
        bodyStyle: { 'background-color': '#4C9DE6' },
        display: { 'display': 'none' },
        className: 'no-header blue-bg"'
      },
    })
    .when('/provide_feedback/complete', {
      templateUrl: 'views/collaborator_provide_feedback/complete.html',
      RouteData: {
        bodyStyle: { 'background-color': '#4C9DE6' },
        display: { 'display': 'none' },
        className: 'no-header blue-bg'
      },
    })
    .when('/provide_feedback/previously_completed', {
      templateUrl: 'views/collaborator_provide_feedback/previously_completed.html',
      RouteData: {
        bodyStyle: { 'background-color': '#fefefe' },
        display: { 'display': 'none' },
        className: 'no-header'
      },
      resolve : { auth: checkNoSignInNeeded }
    })
    .otherwise({
      redirectTo: '/'
    });
});

app.run(function($rootScope, $cookies, $http, $location, $auth, moment, opportunitiesData) {
  var confirmEmailErrorMessagePart1 = 'A confirmation email was sent to your account at';
  var confirmEmailErrorMessagePart2 = '. You must follow the instructions in the email before your account can be activated';
  $rootScope.location = $location;
  $rootScope.$on('auth:login-error', function (context, response) {
    if (response && response.errors && response.errors[0]) {
      var errorMessage = response.errors[0];
      if (errorMessage.indexOf(confirmEmailErrorMessagePart1) > -1 && errorMessage.indexOf(confirmEmailErrorMessagePart2) > -1) {
        $location.url('/confirm_email');
      }
    }
  });
  $rootScope.$on('auth:login-success', function(event, user) {
    var searchParams = $location.search();
    if (searchParams.redirect) {
      $location.url(decodeURIComponent(searchParams.redirect));
    } else if (!user.saw_welcome_screen) {
      $location.url('/welcome');
    } else {
      $location.url('/');
    }
  });
  $rootScope.$on('auth:logout-success', function() {
    opportunitiesData.resetAll();
    $auth.invalidateTokens();
    if (window.Intercom) {
      window.Intercom('shutdown');
    }
    if (window.amplitude) {
      window.amplitude.getInstance().setUserId(null);
      window.amplitude.getInstance().regenerateDeviceId();
    }
    $location.path('/sign_in');
  });
  $rootScope.$on('auth:password-reset-request-error', function(ev, resp) {
    if (resp && resp.errors) {
      var error = resp.errors[0];
      if (error.indexOf('Unable to find user with email') > -1) {
        var email = error.slice(32).slice(0,error.slice(32).indexOf("'."));

        $http({
          method: 'GET',
          url: '/api/email_auth_method?email=' + encodeURIComponent(email)
        }).then(function successCallback(resp) {
          if (resp.data && resp.data.auth_method) {
            window.alert('Password reset request failed: your login is through ' + resp.data.auth_method + ' instead of email/password.');
          } else {
            window.alert('Password reset request failed: ' + resp.errors[0]);
          }
        }, function errorCallback() {
          window.alert('Password reset request failed: ' + resp.errors[0]);
        });
      } else {
        window.alert('Password reset request failed: ' + resp.errors[0]);
      }
    } else {
      window.alert('Password reset request failed.');
    }
  });
  $rootScope.$on('auth:password-reset-request-success', function(ev, data) {
    window.alert('Password reset instructions were sent to ' + data.email);
    $auth.invalidateTokens();
    $location.path('/sign_in');
  });
  $rootScope.$on('auth:password-reset-confirm-success', function() {
    console.log('success login with pass reset');
  });
  $rootScope.$on('auth:password-reset-confirm-error', function() {
    $auth.invalidateTokens();
    $location.path('/sign_in');
  });
});
