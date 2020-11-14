(function () {
'use strict';

angular
  .module('hirepoolApp')
  .controller('AdminUserProfileCtrl', AdminUserProfileCtrl);

AdminUserProfileCtrl.$inject = ['$scope', '$rootScope', '$routeParams', '$http', 'moment', 'scoreHelpers', '_', '$timeout', 'userProperties', 'eventRecorder', 'ENV', 'opportunityHelpers', 'namingHelpers'];
function AdminUserProfileCtrl ($scope, $rootScope, $routeParams, $http, moment, scoreHelpers, _, $timeout, userProperties, eventRecorder, ENV, opportunityHelpers, namingHelpers) {
  var vm = this;
  var Highcharts = window.Highcharts;

  eventRecorder.trackEvent({
    action: 'load-page',
    page: 'admin-user-profile'
  });

  vm.data = {};
  vm.data.user_id = $routeParams.id;
  vm.data.currentOpp = {};
  vm.data.interviewers = {};

  vm.data.accountHistoryTableData = {
    fields: [
      {
        name: 'actionName',
        title: 'Action',
      },
      {
        name: 'actionDatetime',
        type: 'numeric',
        sortType: 'numeric',
        hide: true,
      },
      {
        name: 'actionDate',
        title: 'Date',
        type: 'date',
      },
      {
        name: 'actionDetails',
        title: 'Details',
      },
    ],
    rows: [],
  };

  vm.view = {};
  vm.tables = {};
  vm.charts = {
    latestTimestamp: moment().valueOf()
  };
  vm.charts.series = {
    actions: {
      name: 'All actions in hirepool',
      data: [],
      dataObj: {},
      yAxis: 1,
    },
    opportunities: {
      name: 'Opportunities Added',
      data: [],
      dataObj: {},
    },
    events: {
      name: 'Events Added',
      data: [],
      dataObj: {},
    },
    events_occurred: {
      name: 'Events Occurred',
      data: [],
      dataObj: {},
    },
    offers: {
      name: 'Offers Added',
      data: [],
      dataObj: {},
    },
    collaborators: {
      name: 'Collaborators Added',
      data: [],
      dataObj: {},
    },
  };
  vm.view.tab = 'user_details';
  vm.view.feed = 'big';
  vm.view.hasUploadedResumes = false;

  vm.toggleFeed = toggleFeed;
  vm.getFullDate = getFullDate;
  vm.getAbbrevDate = getAbbrevDate;
  vm.getThumbs = getThumbs;
  vm.setTab = setTab;
  vm.userIsAdmin = userIsAdmin;
  vm.getCsvFileName = getCsvFileName;
  vm.getPaymentDollarAmount = getPaymentDollarAmount;
  vm.isHirepoolAdmin = isHirepoolAdmin;
  vm.getAccountStatus = getAccountStatus;
  vm.getCostGroup = getCostGroup;

  function getCostGroup () {
    if (vm.data.user) {
      var paymentAmount = vm.data.user.payment_amount;
      var paymentPeriod = vm.data.user.payment_period;
      if (paymentAmount && paymentPeriod) {
        return getPaymentDollarAmount(paymentAmount) + '/' + paymentPeriod;
      } else {
        return 'Free';
      }
    }
  }

  function isPremium () {
    if (vm.data.user) {
      if (vm.data.user.cerebro_opt_in) {
        return true;
      }
    }
    return false;
  }

  function getAccountStatus () {
    if (isPremium()) {
      return 'Premium';
    }
    return 'Basic';
  }

  function isHirepoolAdmin () {
    return userProperties.isHirepoolAdmin();
  }

  function getPaymentDollarAmount (dollarInt) {
    return '$' + (dollarInt / 100).toFixed(2);
  }

  function getCsvFileName (dataName) {
    var nameForRoot = '';
    if (vm.data.user) {
      nameForRoot = vm.data.user.name.replace(/\s+/g,"_");
    }
    return namingHelpers.adminCsvNamer(nameForRoot + '_' + dataName);
  }

  function userIsAdmin () {
    return userProperties.isAdmin();
  }

  function setTab (tab) {
    if (tab && vm.view.tab !== tab) {
      vm.view.tab = tab;
      eventRecorder.trackEvent({
        action: 'show-tab-' + tab,
        page: 'admin-overview'
      });
      if (tab === 'timeline') {
        $timeout(function () {
          window.dispatchEvent(new Event('resize'));
        }, 10);
      }
    }
  }

  function toggleFeed () {
    if (vm.view.feed === 'big') {
      vm.view.feed = 'small';
    } else {
      vm.view.feed = 'big';
    }
    $timeout(function () {
      window.dispatchEvent(new Event('resize'));
    }, 10);
  }

  function getFullDate (dateString) {
    if (dateString) {
      return moment(dateString).format('MMM Do, YYYY');
    }
    return '';
  }

  function getAbbrevDate (dateString) {
    if (dateString) {
      return moment(dateString).format('MM-DD-YY');
    }
    return '';
  }

  $http({
    method: 'GET',
    url: '/api/users/' + vm.data.user_id
  }).then(function successCallback (resp) {
    vm.data.user = resp.data.user;
    if (ENV.name !== 'no_connection') {
      getSurveyData();
    }
    getOpportunitiesData();
    getPaymentsData();
    getResumesData();
  }, function errorCallback () {
    if (ENV.name !== 'no_connection') {
      getSurveyData();
    }
    getOpportunitiesData();
    getPaymentsData();
    getResumesData();
  });

  function setResumesList (resumes) {
    if (resumes.length) {
      var resumeLinks = document.createDocumentFragment();
      angular.forEach(resumes, function (resume) {
        var link = document.createElement('a');
        link.innerText = resume.original_filename;
        link.setAttribute('href', resume.resume_file.url);
        link.setAttribute('target', '_blank');

        var link_item = document.createElement('li');
        link_item.appendChild(link);

        resumeLinks.appendChild(link_item);
      });

      var resumeLinksContainer = document.querySelector('.resumes-container .resume-export-links');
      resumeLinksContainer.appendChild(resumeLinks);
      vm.view.hasUploadedResumes = true;
    }
  }

  function setOpportunitiesTableData () {
    vm.tables.offers = {
      fields: [
        {
          name: 'opportunity',
          title: 'Offer\'s Opportunity',
          hover: 'Opportunity that the offer is for',
          type: 'show_opp_details'
        },
        {
          name: 'status',
          title: 'State',
        },
        {
          name: 'base_salary',
          title: 'Base Salary',
          type: 'numeric',
        },
        {
          name: 'additional_compensation',
          title: 'Additional Comp',
          type: 'numeric'
        },
        {
          name: 'total_target_compensation',
          title: 'Total Comp',
          type: 'numeric',
        },
        {
          name: 'created_on',
          title: 'Created',
          hover: 'Date the offer was created',
          type: 'date'
        },
        {
          name: 'updated_on',
          title: 'Updated',
          hover: 'Date the offer was last updated',
          type: 'date'
        },
        {
          name: 'expires_on',
          title: 'Expires',
          hover: 'Date the offer expires',
          type: 'date'
        },
      ],
      rows: [],
    };
    vm.tables.collaborations = {
      fields: [
        {
          name: 'opportunity',
          title: 'Collaboration\'s Opportunity',
          hover: 'Opportunity that the collaboration is tied to',
          type: 'show_opp_details'
        },
        {
          name: 'name',
          title: 'Name',
          hover: 'Name of collaborator',
        },
        {
          name: 'email',
          title: 'Email Address',
          hover: 'Email address of the collaborator',
        },
        {
          name: 'invited_on',
          title: 'Invited',
          hover: 'Date user requested feedback',
          type: 'date',
        },
        {
          name: 'responded_on',
          title: 'Responded',
          hover: 'Date collaborator provided feedback',
          type: 'date',
        },
        {
          name: 'thumb_response',
          title: 'Thumbs',
          hover: 'The collaborator can respond thumbs up, down, or sidways',
          type: 'thumbs'
        }
      ],
      rows: []
    };
    vm.tables.interviewers = {
      fields: [
        {
          name: 'opportunity',
          title: 'Interviewer\'s Opportunity',
          hover: 'Opportunity that the interviewer is tied to',
          type: 'show_opp_details'
        },
        {
          name: 'name',
          title: 'Name'
        },
        {
          name: 'email',
          title: 'Email Address'
        },
        {
          name: 'relationship',
          title: 'Relationship',
          hover: 'The interviewer\'s relationship to the user'
        },
        {
          name: 'interviews',
          title: 'Interviews',
          hover: 'Count of interviews the interviewer participated in',
          type: 'numeric'
        },
        {
          name: 'rating',
          title: 'Score',
          hover: 'Average rating for this interviewer across all interviews',
          type: 'numeric'
        },
      ],
      rows: []
    };
    vm.tables.events = {
      fields: [
        {
          name: 'opportunity',
          title: 'Event\'s Opportunity',
          hover: 'Opportunity that the event is tied to',
          type: 'show_opp_details'
        },
        {
          name: 'style',
          title: 'Type'
        },
        {
          name: 'substyle',
          title: 'Subtype'
        },
        {
          name: 'created_on',
          title: 'Created',
          hover: 'Date the event was created',
          type: 'date'
        },
        {
          name: 'updated_on',
          title: 'Updated',
          hover: 'Date the event was last updated',
          type: 'date'
        },
        {
          name: 'scheduled_on',
          title: 'Scheduled',
          hover: 'Date the event is scheduled to occur',
          type: 'date'
        },
        {
          name: 'interviewers',
          title: 'Interviewers',
          hover: 'Count of interviewers included for this event',
          type: 'numeric'
        },
        {
          name: 'interactions',
          title: 'Interactions',
          hover: 'Count of interactions included in this event',
          type: 'numeric'
        },
        {
          name: 'feedback',
          title: 'Feedback',
          hover: 'Has feedback been entered for this event?',
          type: 'boolean'
        },
        {
          name: 'rating',
          title: 'Score',
          hover: 'Overall rating for this event',
          type: 'numeric'
        },
      ],
      rows: []
    };
    vm.tables.opportunities = {
      fields: [
        {
          name: 'pinned',
          hover: 'Is the opportunity pinned?',
          headerFormat: 'font-awesome',
          icon: 'thumb-tack',
          type: 'boolean'
        },
        {
          name: 'archived',
          hover: 'Is the opportunity archived?',
          headerFormat: 'font-awesome',
          icon: 'archive',
          type: 'boolean'
        },
        {
          name: 'job_title',
          title: 'Job Title',
          type: 'show_opp_details'
        },
        {
          name: 'role',
          title: 'Role'
        },
        {
          name: 'company_name',
          title: 'Company'
        },
        {
          name: 'status',
          title: 'Status',
        },
        {
          name: 'applied_on',
          title: 'Applied On',
        },
        {
          name: 'company_location',
          title: 'Location'
        },
        {
          name: 'source',
          title: 'Source',
          hover: 'Where did the user find the opportunity?',
        },
        {
          name: 'job_url',
          title: 'Job URL',
        },
        {
          name: 'primary_contact',
          title: 'Primary Contact',
        },
        {
          name: 'created_on',
          title: 'Created',
          hover: 'Date the opportunity was created',
          type: 'date'
        },
        {
          name: 'updated_on',
          title: 'Updated',
          hover: 'Date the opportunity was last updated',
          type: 'date'
        },
        {
          name: 'event_count',
          title: 'Events',
          hover: 'Count of events scheduled for the opportunity',
          type: 'numeric'
        },
        {
          name: 'collaborator_count',
          title: 'Collabs',
          hover: 'Count of collaborators user has asked for feedback on the opportunity',
          type: 'numeric'
        },
        {
          name: 'offer_state',
          title: 'Offer',
          hover: 'Current state of any offers on this opportunity'
        },
        {
          name: 'rating',
          title: 'Score',
          hover: 'Overall rating for this opportunity',
          type: 'numeric'
        },
      ],
      rows: []
    };
    vm.data.opportunities.forEach(function (opp) {
      pushSeriesData('opportunities', opp.created_at);
      vm.tables.opportunities.rows.push({
        _opp_id: opp.id,
        applied_on: getAbbrevDate(opp.applied_on),
        pinned: opp.pinned,
        archived: opp.archived,
        job_title: opp.job_title,
        job_url: opp.job_url,
        primary_contact: getPrimaryContact(opp),
        role: opp.role,
        company_name: opp.company.name,
        company_location: opp.company.location,
        source: opp.source,
        status: opportunityHelpers.getStatus(opp),
        created_on: getAbbrevDate(opp.created_at),
        updated_on: getAbbrevDate(opp.updated_at),
        event_count: opp.events.length,
        collaborator_count: opp.collaborator_feedbacks.length,
        offer_state: opp.offer ? opp.offer.status : '',
        rating: scoreHelpers.getScore(opp)
      });
      if (opp.offer) {
        pushSeriesData('offers', opp.offer.created_at);
        vm.tables.offers.rows.push({
          _opp_id: opp.id,
          opportunity: opp.company.name + ' (' + opp.job_title + ')',
          status: opp.offer.status,
          base_salary: opp.offer.base_salary,
          additional_compensation: opp.offer.additional_compensation,
          total_target_compensation: opp.offer.total_target_compensation,
          expires_on: getAbbrevDate(opp.offer.expiration_date),
          created_on: getAbbrevDate(opp.offer.created_at),
          updated_on: getAbbrevDate(opp.offer.updated_at),
        });
      }
      opp.collaborator_feedbacks.forEach(function (collaboration) {
        pushSeriesData('collaborators', collaboration.date_asked);
        vm.tables.collaborations.rows.push({
          _opp_id: opp.id,
          opportunity: opp.company.name + ' (' + opp.job_title + ')',
          name: collaboration.collaborator.name,
          email: collaboration.collaborator.email,
          invited_on: getAbbrevDate(collaboration.date_asked),
          responded_on: getAbbrevDate(collaboration.date_completed),
          thumb_response: getThumbs(collaboration.rating)
        });
      });
      if (opp.events && opp.events.length) {
        opp.events.forEach(function (event) {
          pushSeriesData('events', event.created_at);
          if (event.date) {
            pushSeriesData('events_occurred', event.date);
          }
          event.interviewerCount = event.interviewers.length;
          if (event.one_word || event.culture_val) {
            event.hasFeedback = true;
          }
          event.interviewers.forEach(function (interviewer) {
            if (interviewer.excited) {
              event.hasFeedback = true;
            }
            setInterviewer(interviewer, opp);
          });
          event.interactions.forEach(function (interaction) {
            event.interviewerCount = event.interviewerCount + interaction.interviewers.length;
            if (interaction.one_word || interaction.culture_val) {
              event.hasFeedback = true;
            }
            interaction.interviewers.forEach(function (interviewer) {
              if (interviewer.excited) {
                event.hasFeedback = true;
              }
              setInterviewer(interviewer, opp);
            });
          });
          vm.tables.events.rows.push({
            _opp_id: opp.id,
            opportunity: opp.company.name + ' (' + opp.job_title + ')',
            style: event.style,
            substyle: event.substyle,
            created_on: getAbbrevDate(event.created_at),
            updated_on: getAbbrevDate(event.updated_at),
            scheduled_on: event.date ? getAbbrevDate(event.date) : '',
            interviewers: event.interviewerCount,
            interactions: event.interactions.length,
            feedback: event.hasFeedback,
            rating: scoreHelpers.getOneEventScore(event)
          });
        });
      }
    });
    _.each(vm.data.interviewers, function (interviewer) {
      var rating;
      if (interviewer.ratingSum) {
        rating = Math.round(interviewer.ratingSum / interviewer.ratingCount);
      }
      vm.tables.interviewers.rows.push({
        _opp_id: interviewer.opp_id,
        opportunity: interviewer.opportunity,
        name: interviewer.name,
        email: interviewer.email,
        relationship: interviewer.relationship,
        interviews: interviewer.interviews,
        rating: rating
      });
    });
  }

  function getPrimaryContact (opp) {
    var primaryContact;
    var contacts = {};
    _.each(opp.events, function (event) {
      _.each(event.interviewers, function (i) {
        var interviewer = i.interviewer;
        if (i.is_poc && interviewer) {
          if (contacts[interviewer.name]) {
            contacts[interviewer.name].counter++;
          } else {
            contacts[interviewer.name] = {
              name: interviewer.name,
              email: interviewer.email,
              relationship: interviewer.relationship,
              counter: 1,
            };
          }
        }
      });
    });
    if (_.size(contacts) > 0) {
      _.forEach(contacts, function (contact) {
        if (primaryContact) {
          if (primaryContact.counter < contact.counter) {
            primaryContact = contact;
          }
        } else {
          primaryContact = contact;
        }
      });
    }
    var contactString = '';
    if (primaryContact) {
      contactString = primaryContact.relationship + ': ' + primaryContact.name;
      if (primaryContact.email) {
        contactString = contactString + ', ' + primaryContact.email;
      }
    }
    return contactString;
  }

  function getThumbs (rating) {
    if (rating === 10) {
      return 'Up';
    }
    if (rating === 5) {
      return 'Sideways';
    }
    if (rating === 1) {
      return 'Down';
    }
    return '';
  }

  function setInterviewer (interviewer, opp) {
    var uid = opp.id;
    if (interviewer.interviewer.name) {
      uid = uid + interviewer.interviewer.name;
    }
    if (interviewer.interviewer.email) {
      uid = uid + ':' + interviewer.interviewer.email;
    }
    if (interviewer.interviewer.relationship) {
      uid = uid + ':' + interviewer.interviewer.relationship;
    }
    if (uid) {
      if (vm.data.interviewers[uid]) {
        vm.data.interviewers[uid].interviews++;
      } else {
        vm.data.interviewers[uid] = {
          opp_id: opp.id,
          opportunity: opp.company.name + ' (' + opp.job_title + ')',
          name: interviewer.interviewer.name,
          email: interviewer.interviewer.email,
          relationship: interviewer.interviewer.relationship,
          interviews: 1,
          ratingCount: 0,
          ratingSum: 0
        };
      }
      if (interviewer.excited) {
        vm.data.interviewers[uid].ratingCount++;
        vm.data.interviewers[uid].ratingSum = vm.data.interviewers[uid].ratingSum + interviewer.excited;
      }
    }
  }

  function pushSeriesData (seriesKey, date) {
    if (vm.charts.series[seriesKey] && date) {
      var series = vm.charts.series[seriesKey];
      var dateString = moment(date).format('MM-DD-YYYY');
      var timestamp = moment(date).valueOf();
      if (vm.charts.earliestTimestamp) {
        if (timestamp < vm.charts.earliestTimestamp) {
          vm.charts.earliestTimestamp = timestamp;
        }
      } else {
        vm.charts.earliestTimestamp = timestamp;
      }
      if (timestamp > vm.charts.latestTimestamp) {
        vm.charts.latestTimestamp = timestamp;
      }
      if (series.dataObj[dateString]) {
        series.dataObj[dateString] = series.dataObj[dateString] + 1;
      } else {
        series.dataObj[dateString] = 1;
      }
    }
  }

  function parseUserActions (userActions) {
    userActions.forEach(function (action) {
      pushSeriesData('actions', action.created_at);
    });
  }

  function makeTimeline () {
    var earliestDate = moment(vm.charts.earliestTimestamp).format('MM-DD-YYYY');
    var latestDate = moment(vm.charts.latestTimestamp).format('MM-DD-YYYY');
    var seriesWithData = [];
    var val;
    _.each(vm.charts.series, function (series) {
      var date = earliestDate;
      while (date !== latestDate) {
        val = series.dataObj[date] || 0;
        series.data.push([moment(date, 'MM-DD-YYYY').valueOf(), val]);
        date = moment(date, 'MM-DD-YYYY').add(1, 'd').format('MM-DD-YYYY');
      }
      val = series.dataObj[date] || 0;
      series.data.push([moment(date, 'MM-DD-YYYY').valueOf(), val]);
      var seriesObject = {
        name: series.name,
        data: series.data
      };
      if (series.yAxis) {
        seriesObject.yAxis = series.yAxis;
      }
      seriesWithData.push(seriesObject);
    });
    Highcharts.stockChart('admin_timeline_highcharts_container', {
      chart: {
        type: 'line'
      },
      title: { text: '' },
      xAxis: {
        type: 'datetime',
        title: { text: 'Date' },
      },
      yAxis: [{
        title: { text: 'Other actions' },
        min: 0,
        opposite: false,
      },
      {
        title: {
          text: 'For "All hirepool actions taken"',
          style: { color: Highcharts.getOptions().colors[0] },
        },
        labels: {
          style: { color: Highcharts.getOptions().colors[0] },
        },
        min: 0,
        opposite: false,
      }],
      legend: { enabled: true },
      navigator: { enabled: false },
      rangeSelector: {
        buttons: [
          {
            type: 'month',
            count: 1,
            text: '1m',
          },
          {
            type: 'week',
            count: 1,
            text: '1w',
          },
          {
            type: 'all',
            text: 'All'
          }
        ],
      },
      scrollbar: { enabled: false },
      tooltip: {
        headerFormat: '{point.x:%A, %b %e}<br>',
      },
      plotOptions: {
        line: {
          marker: { enabled: false },
        }
      },
      series: seriesWithData,
      credits: { enabled: false },
    });
  }

  function addSubscriptionsToAccountHistory (subscriptions) {
    _.each(subscriptions, function (sub) {
      var row = {};
      row.actionName = 'Begin premium subscription';
      row.actionDatetime = moment(sub.created_at).format('X');
      row.actionDate = moment(sub.created_at).format('MMM D YYYY');
      vm.data.accountHistoryTableData.rows.push(row);
      if (!sub.active && sub.end_date) {
        var endRow = {};
        endRow.actionName = 'End premium subscription';
        endRow.actionDatetime = moment(sub.end_date).format('X');
        endRow.actionDate = moment(sub.end_date).format('MMM D YYYY');
        vm.data.accountHistoryTableData.rows.push(endRow);
      }
    });
    $rootScope.$broadcast('sortableTableSort');
  }

  function addTransactionsToAccountHistory (transactions) {
    _.each(transactions, function (transaction) {
      var row = {};
      row.actionName = 'Monthly premium payment';
      row.actionDatetime = moment(transaction.created_at).format('X');
      row.actionDate = moment(transaction.created_at).format('MMM D YYYY');
      row.actionDetails = 'Pay ' + getAmount(transaction.amount);
      vm.data.accountHistoryTableData.rows.push(row);
    });
    $rootScope.$broadcast('sortableTableSort');
  }

  function getAmount (amountInPennies) {
    return '$' + (amountInPennies / 100);
  }

  function getPaymentsData () {
    $http({
      method: 'GET',
      url: '/api/users/' + vm.data.user_id + '/subscriptions'
    }).then(function successCallback (resp) {
      vm.data.subscriptions = resp.data.subscriptions;
      addSubscriptionsToAccountHistory(vm.data.subscriptions);
      var currentSub;
      _.each(vm.data.subscriptions, function (sub) {
        if (sub.active) {
          if (currentSub) {
            if (moment(sub.created_at).isAfter(moment(currentSub.created_at))) {
              currentSub = sub;
            }
          } else {
            currentSub = sub;
          }
        }
      });
      vm.data.nextInvoiceDate = moment(currentSub.next_charge_at).format('MMM D YYYY');
    }, function errorCallback () {
    });
    $http({
      method: 'GET',
      url: '/api/users/' + vm.data.user_id + '/invoices'
    }).then(function successCallback (resp) {
      vm.data.invoices = resp.data.invoices;
      addTransactionsToAccountHistory(vm.data.invoices);
    }, function errorCallback () {
    });
    $http({
      method: 'GET',
      url: '/api/users/' + vm.data.user_id + '/payments'
    }).then(function successCallback (resp) {
      vm.data.payments = resp.data.payments;
      addTransactionsToAccountHistory(vm.data.payments);
    }, function errorCallback () {
    });
  }

  function getOpportunitiesData () {
    $http({
      method: 'GET',
      url: '/api/interviews/user/' + vm.data.user_id
    }).then(function successCallback (resp) {
      vm.data.opportunities = resp.data.interviews;
      if (!vm.data.currentOpp.id && vm.data.opportunities.length) {
        vm.data.currentOpp = vm.data.opportunities[0];
      }
      setOpportunitiesTableData(vm.data.opportunities);
      getAllUserActions();
    }, function errorCallback () {
    });
  }

  function getResumesData () {
    $http({
      method: 'GET',
      url: '/api/users/' + vm.data.user_id + '/resumes'
    }).then(function successCallback (resp) {
      vm.data.resumes = resp.data.resumes;
      setResumesList(vm.data.resumes);
    }, function errorCallback () {
    });
  }

  function getSurveyData () {
    $http({
      method: 'GET',
      url: '/api/surveys/user/' + vm.data.user_id
    }).then(function successCallback (resp) {
      vm.data.survey = resp.data.survey;
    }, function errorCallback () {
    });
    $http({
      method: 'GET',
      url: '/api/premium_surveys/user/' + vm.data.user_id
    }).then(function successCallback (resp) {
      vm.data.premium_survey = resp.data.survey;
    }, function errorCallback () {
    });
  }

  function getAllUserActions () {
    $http({
      method: 'GET',
      url: '/api/user_actions/all/user/' + vm.data.user_id
    }).then(function successCallback (resp) {
      parseUserActions(resp.data.user_actions);
      makeTimeline();
    }, function errorCallback () {
    });
  }

  var showOppDetailsCleanupFunc = $rootScope.$on('admin-show-opp-details', function (event, oppId) {
    vm.data.currentOpp = vm.data.opportunities.find(function (opp) {
      return opp.id === oppId;
    });
    setTab('opp_details');
  });
  $scope.$on('destroy', function () {
    showOppDetailsCleanupFunc();
  });

}
})();
