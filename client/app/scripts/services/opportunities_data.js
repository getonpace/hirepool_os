'use strict';

angular.module('hirepoolApp')
  .service('opportunitiesData', function ($rootScope, $http, $timeout, ENV, userProperties) {
    var opportunities = {};
    var geocoder = window.google ? new window.google.maps.Geocoder() : {};
    var distService = window.google ? new window.google.maps.DistanceMatrixService() : {};
    var failedQueryCounter = 0;
    var failedCommuteQueryCounter = 0;
    var failedToFetchOpportunities = false;
    var oppPromise;

    $rootScope.$on('updatingArchived', function (e, id, archived) {
      if (opportunities[id]) {
        var old = opportunities[id].data.archived;
        if (old !== archived) {
          opportunities[id].data.archived = archived;
          $rootScope.$broadcast('setArchived', id, archived);
        }
      }
    });
    $rootScope.$on('updatingPinned', function (e, id, pinned) {
      if (opportunities[id]) {
        var old = opportunities[id].data.pinned;
        if (old !== pinned) {
          opportunities[id].data.pinned = pinned;
          $rootScope.$broadcast('setPinned', id, pinned);
        }
      }
    });
    $rootScope.$on('opportunityCreated', function (e, oppDetails) {
      if (oppDetails.opportunity) {
        setOpp(oppDetails.opportunity);
        setCbData({id: oppDetails.opportunity.id, force: false});
        setGdData({id: oppDetails.opportunity.id, force: false});
      }
    });
    $rootScope.$on('opportunityUpdated', function (e, oppDetails) {
      if (oppDetails.opportunity) {
        setOpp(oppDetails.opportunity);
        setCbData({id: oppDetails.opportunity.id, force: true});
        setGdData({id: oppDetails.opportunity.id, force: true});
      }
    });
    $rootScope.$on('newCollabFeedback', function (ev, collabFeedback, oppId) {
      if (oppId) {
        setData(oppId);
      }
    });
    $rootScope.$on('updatedOffer', function (ev, offer, oppId) {
      if (oppId) {
        setData(oppId);
      }
    });
    $rootScope.$on('added-new-event', function (ev, interview, oppId) {
      if (oppId) {
        setData(oppId);
      }
    });
    $rootScope.$on('updated-existing-event', function (ev, interview, oppId) {
      if (oppId) {
        setData(oppId);
      }
    });
    $rootScope.$on('deletedInterview', function (ev, interviewId, oppId) {
      if (oppId) {
        setData(oppId);
      }
    });
    $rootScope.$on('refetchAllOpportunities', function () {
      var options = {
        noUpdate: true,
        forceRefresh: true,
      };
      getAll(options).then(function () {
        $rootScope.$broadcast('refetchAllOpportunitiesDone');
      });
    });

    return {
      loadOpportunities: loadOpportunities,
      getAll: getAll,
      setOpp: setOpp,
      getOpp: getOpp,
      setData: setData,
      setCbData: setCbData,
      getCbData: getCbData,
      setGdData: setGdData,
      getGdData: getGdData,
      getLoc: getLoc,
      getLocString: getLocString,
      setLatLng: setLatLng,
      getLatLng: getLatLng,
      setCommuteTime: setCommuteTime,
      getCommuteTime: getCommuteTime,
      resetAll: resetAll,
    };

    function resetAll () {
      opportunities = {};
      geocoder = window.google ? new window.google.maps.Geocoder() : {};
      distService = window.google ? new window.google.maps.DistanceMatrixService() : {};
      failedQueryCounter = 0;
      failedCommuteQueryCounter = 0;
      failedToFetchOpportunities = false;
      oppPromise = '';
    }

    function getAll (options) {
      if (!oppPromise || failedToFetchOpportunities || (options && options.forceRefresh) ) {
        oppPromise = loadOpportunities({noUpdate: options ? options.noUpdate : false});
      }
      return oppPromise;
    }

    function setOpp (opp, noBroadcast) {
      if (opp.id) {
        if (opportunities[opp.id]) {
          opportunities[opp.id].data = opp;
        } else {
          opportunities[opp.id] = {
            data: opp
          };
        }
        if (!noBroadcast) {
          $rootScope.$broadcast('setOpp', opp.id);
        }
      }
    }

    function getOpp (id) {
      return opportunities[id];
    }

    function setData (id) {
      return $http({ url: '/api/interviews/' + id }).then(function successCallback (response) {
        if (response && response.data && response.data.interview) {
          setOpp(response.data.interview);
        }
      }, function errorCallback () {
      });
    }

    function setGdData (options) {
      return new Promise(function (resolve, reject) {
        var id = options.id;
        var force = options.force;
        if (opportunities[id] && opportunities[id].data && opportunities[id].data.company) {
          var domain = opportunities[id].data.company.domain;
          var name = opportunities[id].data.company.name;
          if (domain && name && (!opportunities[id].cbData || force)) {
            if (ENV.name !== 'no_connection') {
              $http({
                url: '/api/company_ratings?domain=' + domain + '&name=' + encodeURIComponent(name)
              }).then(function (response) {
                if (response.data.error) {
                  console.error('Failed to fetch company ratings for: ' + name + ': ' + response.data.error);
                  reject();
                } else {
                  opportunities[id].gdData = response.data.company_ratings;
                  $rootScope.$broadcast('setOppGdData', id);
                  resolve();
                }
              });
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        } else {
          reject();
        }
      });
    }

    function getGdData (id) {
      return opportunities[id].gdData;
    }

    function setCbData (options) {
      return new Promise(function (resolve) {
        var id = options.id;
        var force = options.force;
        if (opportunities[id] && opportunities[id].data && opportunities[id].data.company) {
          var domain = opportunities[id].data.company.domain;
          if (domain && (!opportunities[id].cbData || force)) {
            if (ENV.name !== 'no_connection') {
              $http({
                url: '/api/company_details?domain=' + domain
              }).then(function (response) {
                opportunities[id].cbData = response.data;
                $rootScope.$broadcast('setOppCbData', id);
                resolve();
              });
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    }

    function getCbData (id) {
      return opportunities[id].cbData;
    }

    function getLoc (id) {
      var opp = opportunities[id];
      var oLoc = opp.data.location || '';
      var cbLoc;
      if (opp.cbData && opp.cbData.geo) {
        cbLoc = opp.cbData.geo;
      }
      if (oLoc && cbLoc && cbLoc.city && oLoc.indexOf(cbLoc.city) > -1) {
        return cbLoc;
      }
      if (oLoc) {
        return oLoc;
      }
      if (cbLoc) {
        return cbLoc;
      }
      return '';
    }

    function getLocString (id, format) {
      var loc = getLoc(id);
      var state;
      if (loc.city) {
        if (format === 'long') {
          var streetNumber = loc.streetNumber ? loc.streetNumber + ' ' : '';
          var streetName = loc.streetName ? loc.streetName + ' ' : '';
          var city = loc.city ? loc.city + ', ' : '';
          state = loc.stateCode ? loc.stateCode + ' ' : '';
          var postalCode = loc.postalCode ? loc.postalCode : '';
          return streetNumber + streetName + city + state + postalCode;
        } else {
          state = loc.stateCode ? ', ' + loc.stateCode : '';
          return loc.city + state;
        }
      }
      return loc;
    }

    function setLatLng (id) {
      return new Promise(function (resolve, reject) {
        var oppLoc = getLocString(id, 'long');
        if (oppLoc && (!opportunities[id].latLng || opportunities[id].latLng.oldAddress !== oppLoc)) {
          geocoder.geocode( { address: oppLoc }, function (results, status) {
            if (status === 'OK') {
              failedQueryCounter = 0;
              opportunities[id].latLng = results[0].geometry.location;
              opportunities[id].latLng.oldAddress = oppLoc;
              $rootScope.$broadcast('setOppLatLng', id);
              resolve(opportunities[id]);
            } else if (status === 'OVER_QUERY_LIMIT') {
              failedQueryCounter++;
              console.log('setLatLng: google maps api OVER_QUERY_LIMIT: ' + failedQueryCounter);
              if (failedQueryCounter < 3) {
                $timeout(function () {
                  setLatLng(id);
                }, 1000);
              } else {
                console.error('fail setLatLng: google maps api ' + status + ': ' + failedQueryCounter);
                reject();
                // $timeout(function () {
                //   setLatLng(id);
                // }, 20000);
              }
            } else {
              console.error('fail setLatLng: google maps api ' + status + ': ' + failedQueryCounter);
              reject();
            }
          });
        } else {
          resolve();
        }
      });
    }

    function getLatLng (id) {
      return opportunities[id].latLng;
    }

    function setCommuteTime (id, userLatLng) {
      var uLat = userLatLng.lat();
      var uLng = userLatLng.lng();
      var oLat = getLatLng(id).lat();
      var oLng = getLatLng(id).lng();
      var comm = opportunities[id].commute;
      if (comm && comm.uLat === uLat && comm.uLng === uLng && comm.oLat === oLat && comm.oLng === oLng && comm.time) {
        // do nothing?
        $rootScope.$broadcast('setOppCommuteTime', id);
      } else {
        var origins = [new window.google.maps.LatLng(uLat, uLng)];
        var destinations = [new window.google.maps.LatLng(oLat, oLng)];
        var options = {
          origins: origins,
          destinations: destinations,
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.IMPERIAL,
        };
        distService.getDistanceMatrix(options, function (response, status) {
          if (status === 'OK' && response && response.rows && response.rows[0] && response.rows[0].elements && response.rows[0].elements[0] && response.rows[0].elements[0].duration && response.rows[0].elements[0].duration.text) {
            failedCommuteQueryCounter = 0;
            opportunities[id].commute = {
              time: response.rows[0].elements[0].duration.text,
              uLat: uLat,
              uLng: uLng,
              oLat: oLat,
              oLng: oLng,
            };
            $rootScope.$broadcast('setOppCommuteTime', id);
          } else if (status === 'OVER_QUERY_LIMIT') {
            failedCommuteQueryCounter++;
            console.error('setCommuteTime: google maps api OVER_QUERY_LIMIT: ' + failedCommuteQueryCounter);
            if (failedCommuteQueryCounter < 50) {
              $timeout(function () {
                setCommuteTime(id, userLatLng);
              }, 1000);
            } else {
              $timeout(function () {
                setCommuteTime(id, userLatLng);
              }, 20000);
            }
          } else {
            console.error('setCommuteTime: google maps api ' + status + ': ' + failedCommuteQueryCounter);
          }
        });
      }
    }

    function getCommuteTime (id) {
      return opportunities[id].commute ? opportunities[id].commute.time : '';
    }

    function loadOpportunities (options) {
      var user = userProperties.get();
      if (user.id) {
        return new Promise(function (resolve, reject) {
          $http({ url: '/api/interviews/' }).then(function successCallback (response) {
            failedToFetchOpportunities = false;
            response.data.interviews.forEach(function (opportunity) {
              var noUpdate = options && options.noUpdate;
              setOpp(opportunity, noUpdate);
            });
            resolve(opportunities);
          }, function errorCallback (error) {
            failedToFetchOpportunities = true;
            reject({
              msg: 'error in http request:',
              err: error
            });
          });
        });
      } else {
        return new Promise(function (resolve, reject) {
          failedToFetchOpportunities = true;
          reject({
            msg: 'user not logged in',
            err: 'user_not_logged_in_err'
          });
        });
      }
    }

  });
