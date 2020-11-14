'use strict';

describe('Service: opportunityHelpers', function () {

  // load the service's module
  beforeEach(module('hirepoolApp'));

  // instantiate service
  var opportunityHelpers;
  beforeEach(inject(function (_opportunityHelpers_) {
    opportunityHelpers = _opportunityHelpers_;
  }));

  it('opportunityHelpers should exist', function () {
    expect(opportunityHelpers).toBeDefined();
  });

  describe('.getStatus(opportunity)', function () {
    it('should return Archived for archived opportunity', function () {
      var opportunity = createOpportunity();
      opportunity.archived = true;
      expect(opportunityHelpers.getStatus(opportunity)).toBe('Archived');
    });
  });

  describe('.getStatus(opportunity)', function () {
    it('should return Archived for archived opportunity', function () {
      var opportunity = createOpportunity();
      opportunity.archived = true;
      expect(opportunityHelpers.getStatus(opportunity)).toBe('Archived');
    });

    it('should return Pending Offer for opportunity with a verbal offer and archived = false', function () {
      var opportunity = createOpportunity();
      opportunity.offer.status = 'Verbal';
      expect(opportunityHelpers.getStatus(opportunity)).toBe('Pending Offer');
    });

    it('should return Pending Offer for opportunity with a written offer and archived = false', function () {
      var opportunity = createOpportunity();
      opportunity.offer.status = 'Written';
      expect(opportunityHelpers.getStatus(opportunity)).toBe('Pending Offer');
    });

    it('should return Pending Offer for opportunity with an active offer and archived = false', function () {
      var opportunity = createOpportunity();
      opportunity.offer.status = 'Active';
      expect(opportunityHelpers.getStatus(opportunity)).toBe('Pending Offer');
    });

    it('should return Accepted Offer for opportunity with an accepted offer and archived = false', function () {
      var opportunity = createOpportunity();
      opportunity.offer.status = 'Accepted';
      expect(opportunityHelpers.getStatus(opportunity)).toBe('Accepted Offer');
    });

    it('should return Declined Offer for opportunity with a declined offer and archived = false', function () {
      var opportunity = createOpportunity();
      opportunity.offer.status = 'Declined';
      expect(opportunityHelpers.getStatus(opportunity)).toBe('Declined Offer');
    });

    it('should return Active for opportunity with events with no offers and archived = false', function () {
      var opportunity = createOpportunity();
      opportunity.offer = null;
      expect(opportunityHelpers.getStatus(opportunity)).toBe('Active');
    });

    it('should return Applied for opportunity with with applied = true with no offers or events and archived = false', function () {
      var opportunity = createOpportunity();
      opportunity.offer = null;
      opportunity.events = null;
      expect(opportunityHelpers.getStatus(opportunity)).toBe('Applied');
    });

    it('should return Prospecting for opportunity with with applied = false with no offers or events and archived = false', function () {
      var opportunity = createOpportunity();
      opportunity.offer = null;
      opportunity.events = null;
      opportunity.applied = false;
      expect(opportunityHelpers.getStatus(opportunity)).toBe('Prospecting');
    });
  });

  function createOpportunity () {
    var opportunity = {
      id: 10,
      user_id: 2,
      archived: false,
      offer: createOffer(10),
      events: createEvents(10, 3),
      applied: true
    };
    return opportunity;
  }

  function createOffer (interview_id) {
    var offer = {
      interview_id: interview_id,
      status: 'Verbal'
    };
    return offer;
  }

  function createEvents (interview_id, eventsCount) {
    var events = [];
    for (var i = 0; i < eventsCount; i++) {
      events.push({
        interview_id: interview_id,
        style: 'Online',
        substyle: 'Code sim'
      });
    }
    return events;
  }

});
