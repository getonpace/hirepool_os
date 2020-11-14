require 'http'
require 'aws-sdk'
require 'cached_endpoint'
require 'erb'

class CompanyGlassdoor

  TABLE_NAME = Rails.configuration.x.dynamodb.company_glassdoor_table
  PARTITION_KEY = "domain"
  @@cached_endpoint = CachedEndpoint::DynamoCachedEndpoint.new(CompanyGlassdoor)

  def self.get_ratings(domain, name, ip, ua)
    params = {
      :domain => domain,
      :name => name,
      :ip => ip,
      :ua => ua
    }
    @@cached_endpoint.get(domain, params)
  end

  def self.get_all_ratings
    @@cached_endpoint.get_all
  end

  def self.get_source_data(params)
    begin
      request_params = {
        "ip": ERB::Util.url_encode(params[:ip]),
        "ua": ERB::Util.url_encode(params[:ua]),
        "company_name": ERB::Util.url_encode(params[:name]),
        "glassdoor_key": Rails.application.secrets.glassdoor_api_key,
        "glassdoor_id": Rails.application.secrets.glassdoor_api_id
      }
      request_template = "http://api.glassdoor.com/api/api.htm?t.p=%{glassdoor_id}&t.k=%{glassdoor_key}&userip=%{ip}&useragent=%{ua}&format=json&v=1&action=employers&q=%{company_name}"
      # get company ratings
      gd_response = HTTP.get(request_template % request_params)
      if (gd_response.code != 200)
        # handle error cases
        puts "failed get for company ratings"
        puts gd_response.code
        nil
      else
        hash = JSON.parse(gd_response.body)
        company_ratings = nil
        alternates = []
        hash["response"]["employers"].each { |company|
          if !company["name"].downcase.index(params[:name].downcase).nil? and !company["website"].downcase.index(params[:domain].downcase).nil?
            if company_ratings.nil?
              company_ratings = company
            else
              alternates.push(company)
            end
          end
        }
        new_hash = {
          "domain" => params[:domain],
          "full_response" => hash
        }
        if company_ratings.nil?
          new_hash["error"] = "no matching company"
        else
          new_hash["company_ratings"] = company_ratings
        end
        if alternates.length > 0
          new_hash["alternates"] = alternates
        end
        new_hash
      end
    rescue Nestful::ResourceInvalid
      nil
    end
  end
end
