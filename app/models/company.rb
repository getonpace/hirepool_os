require 'clearbit'
require 'aws-sdk'
require 'cached_endpoint'

class Company < ActiveRecord::Base
  self.table_name = 'companies'
  has_many :glassdoor_reviews
  has_many :interviewers
  has_many :interviews

  TABLE_NAME = Rails.configuration.x.dynamodb.companies_table
  PARTITION_KEY = "domain"
  @@cached_endpoint = CachedEndpoint::DynamoCachedEndpoint.new(Company)

  def self.get_details(domain)
    params = { :domain => domain }
    @@cached_endpoint.get(domain, params)
  end

  def self.get_all_details
    @@cached_endpoint.get_all
  end

  def self.get_source_data(params)
    begin
      # get company details from Clearbit
      company_details = Clearbit::Enrichment::Company.find(domain: params[:domain], stream: true)
      company_details.as_json
    rescue Nestful::ResourceInvalid
      nil
    end
  end

  def self.get_ratings(domain, name, ip, ua)
    CompanyGlassdoor.get_ratings(domain, name, ip, ua)
  end

  def self.get_all_ratings
    CompanyGlassdoor.get_all_ratings
  end

end
