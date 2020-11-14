'use strict';

angular.module('hirepoolApp')
  .service('scoreHelpers', function (_) {
    function pushIfExists (arr, val) {
      if (val) {
        arr.push(val);
      }
    }
    function getOneEventScore (event) {
      var scores = [];
      if (event.interactions && event.interactions.length) {
        _.each(event.interactions, function (interaction) {
          pushIfExists(scores, interaction.culture_val);
          _.each(interaction.interviewers, function (interviewer) {
            pushIfExists(scores, interviewer.excited);
          });
        });
      } else {
        pushIfExists(scores, event.culture_val);
        _.each(event.interviewers, function (interviewer) {
          pushIfExists(scores, interviewer.excited);
        });
      }
      if (scores.length) {
        return _.round(scores.reduce(function (prev, curr) {
          return prev + curr;
        }, 0 ) / scores.length);
      } else {
        return '-';
      }
    }
    function getScoreForProperty (opportunity, prop) {
      var scoreInstances = 0;
      var scoreTotal = 0;
      _.each(opportunity.events, function (event) {
        if (event.interactions && event.interactions.length) {
          _.each(event.interactions, function (interaction) {
            var interactionScore = interaction[prop];
            if (interactionScore) {
              scoreTotal = scoreTotal + interactionScore;
              scoreInstances++;
            }
            if (interaction.interviewers && interaction.interviewers.length) {
              _.each(interaction.interviewers, function (interviewer) {
                var interviewerScore = interviewer[prop];
                if (interviewerScore) {
                  scoreTotal = scoreTotal + interviewerScore;
                  scoreInstances++;
                }
              });
            }
          });
        } else {
          if (event[prop]) {
            scoreTotal = scoreTotal + event[prop];
            scoreInstances++;
          }
          if (event.interviewers && event.interviewers.length) {
            _.each(event.interviewers, function (interviewer) {
              var interviewerScore = interviewer[prop];
              if (interviewerScore) {
                scoreTotal = scoreTotal + interviewerScore;
                scoreInstances++;
              }
            });
          }
        }
      });
      if (scoreInstances) {
        return _.round(scoreTotal / scoreInstances);
      }
      return '-';
    }
    function getEventValueFit (opportunity) {
      return getScoreForProperty(opportunity, 'culture_val');
    }
    function getEventPplFit (opportunity) {
      return getScoreForProperty(opportunity, 'excited');
    }
    function getEventInfo (opportunity) {
      var events = opportunity.events;
      var eventCount = 0;
      var eventTotal = 0;
      if (events && events.length > 0) {
        eventTotal = events.reduce(function (prev, event) {
          var score = getOneEventScore(event);
          if (score !== '-') {
            eventCount++;
            return prev + score;
          } else {
            return prev;
          }
        }, 0);
      }
      return { eventTotal: eventTotal, eventCount: eventCount };
    }
    function getOverallEventScore (opportunity) {
      var eventInfo = getEventInfo(opportunity);
      if (eventInfo.eventCount) {
        return _.round(eventInfo.eventTotal / eventInfo.eventCount);
      }
      return '-';
    }
    function getCollabInfo (opportunity) {
      var collabs = opportunity.collaborator_feedbacks;
      var colCount = 0;
      var colTotal = 0;
      if (collabs && collabs.length) {
        colTotal = collabs.reduce(function (prev, col) {
          if (col.rating) {
            colCount++;
            return prev + col.rating;
          }
          return prev;
        }, 0);
      }
      return { colTotal: colTotal, colCount: colCount };
    }
    function getCollabScore (opportunity) {
      var collabInfo = getCollabInfo(opportunity);
      if (collabInfo.colCount) {
        return _.round(collabInfo.colTotal / collabInfo.colCount);
      }
      return '-';
    }
    return {
      getCollabScore: getCollabScore,
      getEventPplFit: getEventPplFit,
      getEventValueFit: getEventValueFit,
      getOverallEventScore: getOverallEventScore,
      getOneEventScore: getOneEventScore,
      getScore: function (opportunity) {
        var eventInfo = getEventInfo(opportunity);
        var collabInfo = getCollabInfo(opportunity);
        if (collabInfo.colCount || eventInfo.eventCount) {
          return _.round((collabInfo.colTotal + eventInfo.eventTotal) / (collabInfo.colCount + eventInfo.eventCount));
        }
        return '-';
      }
    };
  });
