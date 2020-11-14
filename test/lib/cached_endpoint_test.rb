require "test_helper"
require "webmock/minitest"
require "cached_endpoint"

class DynamoCachedEndpointTest < ActiveSupport::TestCase
  # i_suck_and_my_tests_are_order_dependent!

  def teardown
    @dce = nil
  end

  test "should throw ArgumentError when creating DynamoCachedEndpoint without model defined" do
    assert_raise(ArgumentError) do
      @dce = CachedEndpoint::DynamoCachedEndpoint.new
    end
  end

  test "should have default ttl to 7 days" do
    @dce = CachedEndpoint::DynamoCachedEndpoint.new(Company)
    assert_equal(7*24*60*60, @dce.ttl)
  end

  test "should get an existing item from DynamoDB" do
    @dce = CachedEndpoint::DynamoCachedEndpoint.new(Company)
    response = @dce.get("test.com") # dummy domain, could be anything
    assert_not_nil(response.item)
  end

  test "should return false when set is called with domain that doesn't exist" do
    stub_request(:get, "https://company-stream.clearbit.com/v2/companies/find?domain=test.com").
      with(:headers => {'Accept'=>'*/*',
        'Accept-Encoding'=>'gzip;q=1.0,deflate;q=0.6,identity;q=0.3',
        'Authorization'=>'Bearer',
        'User-Agent'=>'Ruby'
      }).
      to_return(:status => 422, :body => nil, :headers => {'Content-Type' => 'application/json'})

    @dce = CachedEndpoint::DynamoCachedEndpoint.new(Company)

    # should return false since clearbit will return nil for body
    assert_not(@dce.set("test.com")) # dummy domain, could be anything
  end

  test "should return true when set is called with domain that exists" do
    body = {}
    stub_request(:get, "https://company-stream.clearbit.com/v2/companies/find?domain=google.com").
      with(:headers => {'Accept'=>'*/*',
        'Accept-Encoding'=>'gzip;q=1.0,deflate;q=0.6,identity;q=0.3',
        'Authorization'=>'Bearer',
        'User-Agent'=>'Ruby'
      }).
      to_return(:status => 200, :body => body.to_json, :headers => {'Content-Type' => 'application/json'})

    @dce = CachedEndpoint::DynamoCachedEndpoint.new(Company)

    # should return false since clearbit will return nil for body
    assert(@dce.set("google.com")) # dummy domain, could be anything
  end

  test "should try to set and get if TTL has expired" do
    body = {}
    stub_request(:get, "https://company-stream.clearbit.com/v2/companies/find?domain=google.com").
      with(:headers => {'Accept'=>'*/*',
        'Accept-Encoding'=>'gzip;q=1.0,deflate;q=0.6,identity;q=0.3',
        'Authorization'=>'Bearer',
        'User-Agent'=>'Ruby'
      }).
      to_return(:status => 200, :body => body.to_json, :headers => {'Content-Type' => 'application/json'})

    # need to stub the client to return next_update_at that will guaranteed to be expired
    stubbed_client = Aws::DynamoDB::Client.new(:stub_responses => true)
    stubbed_client.stub_responses(:get_item, item: {
      "next_update_at" => 1
    })

    # TODO: AWS Ruby gem doesn't allow for mocking, so this is all fake and
    # doesn't actually do integration test
    @dce = CachedEndpoint::DynamoCachedEndpoint.new(Company, 7*24*60*60, stubbed_client)
    assert_not_nil(@dce.get("google.com"))
  end

  test "should raise TypeError if source data is not a Hash" do
    Company.expects(:get_source_data).with("google.com").returns(Array.new)
    stubbed_client = Aws::DynamoDB::Client.new(:stub_responses => true)
    @dce = CachedEndpoint::DynamoCachedEndpoint.new(Company, 7*24*60*60, stubbed_client)
    assert_raise(TypeError) do
      @dce.get_source_data(Company, "google.com")
    end
  end

end
