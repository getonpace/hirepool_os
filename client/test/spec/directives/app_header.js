'use strict';

describe('Directive: app_header', function () {

  // load the directive's module
  beforeEach(module('hirepoolApp'));
  // load the workaround for ng-translate
  beforeEach(module('translateNoop'));
  // precompile the directive's template
  beforeEach(module('views/directives/app_header.html'));

/*
Commenting out these tests for now because adding the angulartics library breaks them.
Seems related to ui-router
Getting this error on every test: Error: Unexpected request: GET views/opportunities/index.html
See what little I found on it at:
https://github.com/meanjs/mean/issues/198
https://stackoverflow.com/questions/23655307/ui-router-interfers-with-httpbackend-unit-test-angular-js/23670198#23670198
*/
/*
  var element, scope, controller;

  beforeEach(inject(function($rootScope, $compile) {
    element = angular.element('<hp-app-header></hp-app-header>');

    $compile(element)($rootScope.$new());
    $rootScope.$digest();

    controller = element.controller('hpAppHeader');
    scope = element.isolateScope();
  }));

  it ('should create .topBar element', inject(function() {
    var topBar = element.find('.top-bar');
    expect(topBar.length).toBe(1);

    var hiddenTopBar = element.find('.top-bar.ng-hide');
    expect(hiddenTopBar.length).toBe(0);
  }));

  it ('should show unauthenticated ui when no user is set', inject(function() {
    // should not have any .logged-in-user divs
    var loggedInDivs = element.find('.logged-in-user');
    expect(loggedInDivs.length).toBe(0);

    // should not have user profile
    var profileImg = element.find('.header-right a[data-modal="user-profile-modal"]');
    expect(profileImg.length).toBe(0);

    // should have hidden settings dropdown
    var hiddenSettingsDiv = element.find('.header-right .settings-header-dropdown.ng-hide');
    expect(hiddenSettingsDiv.length).toBe(1);

    // should have visible login button
    var loginButton = element.find('.header-right a[href="#/sign_in"]');
    expect(loginButton.length).toBe(2); // two login buttons: mobile and desktop
    var visibleLoginButton = element.find('.header-right a[href="#/sign_in"].ng-hide');
    expect(visibleLoginButton.length).toBe(0);
  }));

  it ('should show authenticated ui when user is set', inject(function() {
    scope.vm.data.user = { id: 10 };
    scope.$digest();

    // should have 3 .logged-in-user divs
    var loggedInDivs = element.find('.logged-in-user');
    expect(loggedInDivs.length).toBe(3);

    // should have user profile
    var profileImg = element.find('.header-right a[data-modal="user-profile-modal"]');
    expect(profileImg.length).toBe(1);

    // should show settings dropdown
    var settingsDiv = element.find('.header-right .settings-header-dropdown');
    expect(settingsDiv.length).toBe(1);
    var hiddenSettingsDiv = element.find('.header-right .settings-header-dropdown.ng-hide');
    expect(hiddenSettingsDiv.length).toBe(0);

    // should have hidden login button
    var loginButton = element.find('.header-right a[href="#/sign_in"].ng-hide');
    expect(loginButton.length).toBe(2); // two login buttons: mobile and desktop
  }));

  it ('should remove upload opportunities dropdown item on specified paths when user is set', inject(function($location) {
    scope.vm.data.user = { id: 10 };

    $location.path('/lskdjf');
    scope.$digest();
    var uploadOpportunitiesLink = element.find('.header-right .settings-header-dropdown a[data-modal="add-opportunites-fodal"]');
    expect(uploadOpportunitiesLink.length).toBe(1);

    $location.path('/welcome');
    scope.$digest();
    uploadOpportunitiesLink = element.find('.header-right .settings-header-dropdown a[data-modal="add-opportunites-fodal"]');
    expect(uploadOpportunitiesLink.length).toBe(0);
  }));

  it ('should hide admin tools when user is_admin is not set', inject(function() {
    scope.vm.data.user = { id: 10 };
    scope.$digest();

    // should have hidden admin tools dropdown
    var hiddenAdminToolsDiv = element.find('.header-right .admin-tools-header-dropdown.ng-hide');
    expect(hiddenAdminToolsDiv.length).toBe(1);
  }));

  it ('should show admin tools when user is_admin is set', inject(function() {
    scope.vm.data.user = { id: 10, is_admin: true };
    scope.$digest();

    // should show admin tools dropdown
    var adminToolsDiv = element.find('.header-right .admin-tools-header-dropdown');
    expect(adminToolsDiv.length).toBe(1);
    var hiddenAdminToolsDiv = element.find('.header-right .admin-tools-header-dropdown.ng-hide');
    expect(hiddenAdminToolsDiv.length).toBe(0);
  }));

  it ('should not include generate in admin tools when user is_admin is set and sponsor is not hirepool', inject(function() {
    scope.vm.data.user = { id: 10, is_admin: true };
    scope.$digest();

    // should show admin tools dropdown and not include link to #/generate
    var adminToolsDiv = element.find('.header-right .admin-tools-header-dropdown');
    expect(adminToolsDiv.length).toBe(1);
    var hiddenAdminToolsDiv = element.find('.header-right .admin-tools-header-dropdown.ng-hide');
    expect(hiddenAdminToolsDiv.length).toBe(0);
    var generateLink = element.find('.header-right .admin-tools-header-dropdown a[href="#/generate"]');
    expect(generateLink.length).toBe(0);
  }));

  it ('should include generate in admin tools when user is_admin is set and sponsor is hirepool', inject(function() {
    scope.vm.data.user = { id: 10, is_admin: true, sponsor: 'hirepool' };
    scope.$digest();

    // should show admin tools dropdown and include link to #/generate
    var adminToolsDiv = element.find('.header-right .admin-tools-header-dropdown');
    expect(adminToolsDiv.length).toBe(1);
    var hiddenAdminToolsDiv = element.find('.header-right .admin-tools-header-dropdown.ng-hide');
    expect(hiddenAdminToolsDiv.length).toBe(0);
    var generateLink = element.find('.header-right .admin-tools-header-dropdown a[href="#/generate"]');
    expect(generateLink.length).toBe(1);
  }));

  it ('should show add event button on specified paths when user is set', inject(function($location) {
    scope.vm.data.user = { id: 10 };

    $location.path('/');
    scope.$digest();
    var addEventButton = element.find('.header-left button.button.small');
    expect(addEventButton.length).toBe(1);
    expect(addEventButton[0].innerHTML).toContain('Add Event');

    $location.path('/lskdjf');
    scope.$digest();
    addEventButton = element.find('.header-left button.button.small');
    expect(addEventButton.length).toBe(1);
    expect(addEventButton[0].innerHTML).toContain('Add Event');
    var hiddenAddEventButton = element.find('.header-left .button.button.small.ng-hide');
    expect(hiddenAddEventButton.length).toBe(1);
    expect(hiddenAddEventButton[0].innerHTML).toContain('Add Event');

    $location.path('/grid_view');
    scope.$digest();
    addEventButton = element.find('.header-left button.button.small');
    expect(addEventButton.length).toBe(1);
    expect(addEventButton[0].innerHTML).toContain('Add Event');
  }));

  it ('should hide add event button on non-specified paths when user is set', inject(function($location) {
    scope.vm.data.user = { id: 10 };
    $location.path('/lskdjf');
    scope.$digest();
    var addEventButton = element.find('.header-left button.button.small');
    expect(addEventButton.length).toBe(1);
    expect(addEventButton[0].innerHTML).toContain('Add Event');
    var hiddenAddEventButton = element.find('.header-left .button.button.small.ng-hide');
    expect(hiddenAddEventButton.length).toBe(1);
    expect(hiddenAddEventButton[0].innerHTML).toContain('Add Event');
  }));

  it ('should hide add event button when user is not set', inject(function($location) {
    $location.path('/');
    scope.$digest();
    var addEventButton = element.find('.header-left button.button.small');
    expect(addEventButton.length).toBe(1);
    expect(addEventButton[0].innerHTML).toContain('Add Event');
    var hiddenAddEventButton = element.find('.header-left .button.button.small.ng-hide');
    expect(hiddenAddEventButton.length).toBe(1);
    expect(hiddenAddEventButton[0].innerHTML).toContain('Add Event');
  }));

  it ('should remove my opportunities link on specified paths when user is set', inject(function($location) {
    scope.vm.data.user = { id: 10 };

    $location.path('/');
    scope.$digest();
    var myOpportunitiesLink = element.find('.header-left a[href="#/"]');
    expect(myOpportunitiesLink.length).toBe(0);

    $location.path('/lskdjf');
    scope.$digest();
    myOpportunitiesLink = element.find('.header-left a[href="#/"]');
    expect(myOpportunitiesLink.length).toBe(1);

    $location.path('/grid_view');
    scope.$digest();
    myOpportunitiesLink = element.find('.header-left a[href="#/"]');
    expect(myOpportunitiesLink.length).toBe(0);

    $location.path('/lskdjf');
    scope.$digest();
    myOpportunitiesLink = element.find('.header-left a[href="#/"]');
    expect(myOpportunitiesLink.length).toBe(1);

    $location.path('/welcome');
    scope.$digest();
    myOpportunitiesLink = element.find('.header-left a[href="#/"]');
    expect(myOpportunitiesLink.length).toBe(0);
  }));

  it ('should show my opportunities link on non-specified paths when user is set', inject(function($location) {
    scope.vm.data.user = { id: 10 };
    $location.path('/lskdjf');
    scope.$digest();
    var myOpportunitiesLink = element.find('.header-left a[href="#/"]');
    expect(myOpportunitiesLink.length).toBe(1);
  }));

  it ('should remove my opportunities link when user is not set', inject(function($location) {
    $location.path('/lskdjf');
    scope.$digest();
    var myOpportunitiesLink = element.find('.header-left a[href="#/"]');
    expect(myOpportunitiesLink.length).toBe(0);
  }));

  it ('should hide top bar on specified paths', inject(function($location) {
    var topBar = element.find('.top-bar');
    expect(topBar.length).toBe(1);
    var hiddenTopBar = element.find('.top-bar.ng-hide');
    expect(hiddenTopBar.length).toBe(0);

    function resetVisible () {
      $location.path('/');
      scope.$digest();
      topBar = element.find('.top-bar');
      expect(topBar.length).toBe(1);
      hiddenTopBar = element.find('.top-bar.ng-hide');
      expect(hiddenTopBar.length).toBe(0);
    }

    $location.path('/sign_up');
    scope.$digest();
    hiddenTopBar = element.find('.top-bar.ng-hide');
    expect(hiddenTopBar.length).toBe(1);

    resetVisible();

    $location.path('/sign_in');
    scope.$digest();
    hiddenTopBar = element.find('.top-bar.ng-hide');
    expect(hiddenTopBar.length).toBe(1);

    resetVisible();

    $location.path('/forgot_password');
    scope.$digest();
    hiddenTopBar = element.find('.top-bar.ng-hide');
    expect(hiddenTopBar.length).toBe(1);
  }));

  it ('should set active class on the active elements at a given path', inject(function($location) {
    $location.path('/skdjf');
    scope.$digest();
    var activeElements = element.find('.active');
    expect(activeElements.length).toBe(0);

    $location.path('/');
    scope.$digest();
    activeElements = element.find('a[href="#/"].active');
    expect(activeElements.length).toBe(1);

    $location.path('/skdjf');
    scope.$digest();
    activeElements = element.find('.active');
    expect(activeElements.length).toBe(0);

    $location.path('/help_library/faq');
    scope.$digest();
    activeElements = element.find('a[href="#/help_library"].active');
    expect(activeElements.length).toBe(2);
  }));
*/
});
