class Api::InterviewsController < ApplicationController
  require "csv"

  before_action :authenticate_user!
  before_action :get_current_user

  # GET 'interviews/overview/:days'
  def overview
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        if params[:days] == "all"
          render :json => { :success => true, :interviews => Interview.joins(:user).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("interviews.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :interviews => Interview.joins(:user).where("interviews.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", params[:days].to_i.days.ago).order("interviews.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :interviews => Interview.joins(:user).where("interviews.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", 30.days.ago).order("interviews.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      elsif @user[:sponsor]
        if params[:days] == "all"
          render :json => { :success => true, :interviews => Interview.joins(:user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor]).order("interviews.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :interviews => Interview.joins(:user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND interviews.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], params[:days].to_i.days.ago).order("interviews.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :interviews => Interview.joins(:user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND interviews.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], 30.days.ago).order("interviews.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      else
        render :json => { :success => false, :error => "nope" }, :status => 403
      end
    else
      render :json => { :success => false, :error => "nope" }, :status => 403
    end
  end

  # GET /interviews/users/:id
  def user_index
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        user = User.find_by({:id => params[:id]})
        render :json => { :success => true, :interviews => user.interviews.reverse }
      elsif @user[:sponsor]
        user = User.find_by({:id => params[:id]})
        if user[:sponsor] == @user[:sponsor] && (user[:user_agreement_status] == "accepted" || user[:user_agreement_status] == "auto-accepted")
          render :json => { :success => true, :interviews => user.interviews.reverse }
        else
          render :json => { :success => false, :error => 'nope' }, :status => 403
        end
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /interviews
  def index
    render :json => { :success => true, :interviews => @user.interviews }
  end

  # POST /interviews
  def create
    ActiveRecord::Base.transaction do
      @interview = Interview.new(interview_params)
      @interview[:user_id] = @user[:id]
      if company_params
        @company = get_company(company_params)
        if @company
          @interview.company = @company
        else
          @interview.company = Company.create!(company_params)
        end
      end
      @interview.save!
    end

    render :json => { :success => true, :interview => @interview }
  end

  # GET /interviews/:id
  def show
    @interview = get_current_interview
    if !@interview
      render :json => { :success => false, :error => 'not found' }, :status => 404
    else
      render :json => { :success => true, :interview => @interview }
    end
  end

  # PUT /interviews/:id
  def update
    @interview = get_current_interview
    if !@interview
      render :json => { :success => false, :error => 'not found' }, :status => 404
    else
      ActiveRecord::Base.transaction do
        if params[:company] && company_params
          @company = get_company(company_params)
          if @company
            @interview.company = @company
          else
            @interview.company = Company.create!(company_params)
          end
        end

        @interview.update!(interview_params)
      end

      render :json => { :success => true, :interview => @interview }
    end
  end

  # DELETE /interviews/:id
  def destroy
    @interview = get_current_interview
    if !@interview
      render :json => { :success => false, :error => 'not found' }, :status => 404
    else
      ActiveRecord::Base.transaction do
        if @interview.events
          @interview.events.destroy_all
        end
        @interview.destroy
      end

      render :json => { :success => true, :interviews => @user.interviews }
    end
  end

  def notes
    @interview = get_current_interview
    if !@interview
      render :json => { :success => false, :error => 'not found' }, :status => 404
    else
      render :json => { :success => true, :notes => @interview.notes }
    end
  end

  def check_csv
    @file = params[:file]
    if accepted_file_types.include?(@file.content_type) && File.extname(@file.original_filename) == '.csv'
      @csv_file = File.read(@file.tempfile, encoding: 'UTF-8').scrub('')
      @json_csv = CSV.parse(@csv_file).map.with_index(1) do |row, i|
        {
          'id' => i,
          'header' => false,
          'row' => row
        }
      end
      render :json => { :success => true, :csv => @json_csv, :fileName => @file.original_filename }, :status => 200
    else
      render :json => { :success => false, :error => "Invalid file type" }, :status => 422
    end
  end

  def validate_csv_data
    parse_errors = {}
    data = params[:opportunity_data_columns].map { |column_container|
      {
        :column => column_container[:column].map { |row_field_data|
          if column_container["field"] == "name" && !row_field_data["header"]
            row_field_data[:domain] = ""
            row_field_data[:selectedIndex] = -1
            row_field_data[:predictions] = []
            if row_field_data["value"]
              response = HTTP.get('https://autocomplete.clearbit.com/v1/companies/suggest?query=' + row_field_data["value"])
              if response.code < 400
                json = JSON.parse(response.body)
                if json.length == 1
                  row_field_data[:domain] = json[0]["domain"]
                  row_field_data[:valid] = true
                  row_field_data[:preValidated] = true
                else
                  row_field_data[:valid] = false
                end
              else
                row_field_data[:valid] = false
              end
            else
              row_field_data[:valid] = false
              parse_errors[:no_company_name_error] ||= 0
              parse_errors[:no_company_name_error] += 1
            end
          elsif column_container["field"] == "applied_on" && row_field_data["value"] && !row_field_data["header"]
            parsed_applied_on = get_date_from_string(row_field_data["value"])
            if parsed_applied_on[:error]
              parse_errors[:applied_on_date_error] ||= []
              parse_errors[:applied_on_date_error].push(row_field_data["value"])
              row_field_data["value"] = nil
            else
              row_field_data["value"] = parsed_applied_on[:date]
            end
          elsif column_container["field"] == "applied" && row_field_data["value"] && row_field_data["value"].is_a?(String) && !row_field_data["header"]
            parsed_applied = get_bool_from_string(row_field_data["value"])
            if parsed_applied[:error]
              parse_errors[:applied_boolean_error] ||= []
              parse_errors[:applied_boolean_error].push(row_field_data["value"])
              row_field_data["value"] = nil
            else
              row_field_data["value"] = parsed_applied[:bool]
            end
          end
          row_field_data
        },
        :field => column_container["field"],
        :hidden => column_container["hidden"],
        :visible => column_container["visible"]
      }
    }
    render json: { success: true, data: data, parse_errors: parse_errors }, status: 200
  end

  def save_csv_data
    unzip_data.each do |unzipped_row|
      if unzipped_row['name']
        opportunity_company_data = unzipped_row.slice('name', 'domain')
        opportunity_data = unzipped_row.slice('role', 'location', 'referrer_name', 'referrer_email', 'date', 'source', 'pinned', 'archived', 'job_title', 'notes', 'applied', 'job_url', 'applied_on')
        ActiveRecord::Base.transaction do
          interview = Interview.new(opportunity_data) do |i|
            i.user = @user
            i.company = get_company(opportunity_company_data) || Company.create(opportunity_company_data)
          end
          if interview.company.present?
            interview.save!
          end
        end
      end
    end
    render json: { success: true }, status: 200
  end

  private
    def get_bool_from_string(bool_string)
      case bool_string.downcase
      when 'applied', 'yes', 'true'
        {bool: true, error: nil}
      when 'no', 'false'
        {bool: false, error: nil}
      else
        {bool: nil, error: 'bad value for boolean string'}
      end
    end

    def get_date_from_string(date_string)
      begin
        case date_string
        when /^\d{8}$/
          # is the string six digits long (only digits)?
          # if so we want to treat it like an American date 07082018 = july 8 2018 not an invalid date
          {date: Date.strptime(date_string,"%m%d%Y"), error: nil}
        when /^\d{6}$/
          # is the string six digits long (only digits)?
          # if so we want to treat it like an American date 070818 = july 8 2018 not august 18 2007
          {date: Date.strptime(date_string,"%m%d%y"), error: nil}
        when /^\d{1,2}\/\d{1,2}\/\d{2}$/
          # is the string dd/dd/dd?
          # if so we want to treat it like an American date 07/08/18 = july 8 2018 not august 18 2007
          {date: Date.strptime(date_string,"%m/%d/%y"), error: nil}
        when /^\d{1,2}-\d{1,2}-\d{2}$/
          # is the string dd/dd/dd?
          # if so we want to treat it like an American date 07-08-18 = july 8 2018 not august 18 2007
          {date: Date.strptime(date_string,"%m-%d-%y"), error: nil}
        when /^\d{1,2} \d{1,2} \d{2}$/
          # is the string dd/dd/dd?
          # if so we want to treat it like an American date 07 08 18 = july 8 2018 not august 18 2007
          {date: Date.strptime(date_string,"%m %d %y"), error: nil}
        when /^\d{1,2}\/\d{1,2}\/\d{4}$/
          # is the string dd/dd/dddd?
          # if so we want to treat it like an American date 07/08/2018 = july 8 2018 not august 7 2018
          {date: Date.strptime(date_string,"%m/%d/%Y"), error: nil}
        when /^\d{1,2}-\d{1,2}-\d{4}$/
          # is the string dd/dd/dddd?
          # if so we want to treat it like an American date 07-08-2018 = july 8 2018 not august 7 2018
          {date: Date.strptime(date_string,"%m-%d-%Y"), error: nil}
        when /^\d{1,2} \d{1,2} \d{4}$/
          # is the string dd/dd/dddd?
          # if so we want to treat it like an American date 07 08 2018 = july 8 2018 not august 7 2018
          {date: Date.strptime(date_string,"%m %d %Y"), error: nil}
        else
          # try to parse it as a date
          parsed_date = Date.parse(date_string)
          # check for date out of mysql range
          if parsed_date > Date.parse("9999-1-1")
            {date: nil, error: 'date out of range'}
          else
            {date: parsed_date, error: nil}
          end
        end
      rescue ArgumentError => e
        # Re-raise the rescued exception if it isn't from an invalid date / strptime
        raise(e) unless e.message =~ /invalid date|invalid strptime format/
        {date: nil, error: e.message}
      end
    end

    def get_company(company_data)
      company_data = company_data.deep_symbolize_keys
      found_company = nil
      if company_data[:domain] && company_data[:domain] != ""
        found_company = Company.find_by(:name => company_data[:name], :domain => company_data[:domain])
      else
        company_matches = Company.where(:name => company_data[:name])
        if company_matches
          found_company = company_matches[0]
          for company in company_matches
            if !(company_data[:domain].blank?)
              found_company = company
            end
          end
        end
      end
      found_company
    end

    def interview_params
      params.require(:interview).permit(:id, :user_id, :role, :location, :referrer_name, :referrer_email, :date, :source, :pinned, :archived, :job_title, :notes, :applied, :job_url, :applied_on)
    end

    def company_params
      params.require(:company).permit(:name, :location, :size, :domain)
    end

    def filter_columns
      params[:opportunities].select { |column| column[:field] != "" }
    end

    def filter_headers
      filter_columns.map { |column|
        {
          :column => column[:column].select { |row| row[:header] == false },
          :field => column["field"],
          :hidden => column["hidden"],
          :visible => column["visible"]
        }
      }
    end

    def unzip_rows
      filter_headers.inject([]) do |acc, col|
        acc << col[:column].select { |column| column[:header] == false }.map { |column| column[:value] }
      end
    end

    def unzip_data
      keys = filter_headers.inject([]) { |acc, col| acc << col[:field] }
      unzip_rows.transpose.map { |r| Hash[ keys.zip(r) ] }
    end

    def accepted_file_types
      return ['text/csv', 'application/vnd.ms-excel', 'text/x-csv', 'application/x-csv', 'application/csv', 'text/x-comma-separated-values', 'text/comma-separated-values', 'text/plain', 'application/octet-stream']
    end

    # def get_interviewer_hash(interviewer_params)
    #   interviewer_hash = interviewer_params.slice(:id, :name, :email, :role, :gender).reject { |k, v| v.nil? }.symbolize_keys
    # end

    # def experience_params
    #   params.require(:experience).permit(:id, :interviewer_id, :interview_id, :style, :date, :relationship, :timeliness, :preparation, :difficulty, :experience_score, :culture_val, :location, :interviewer_score, :company_preparation, :excited, :notes, :duration_minutes, :role_match, :one_word)
    # end

    def get_current_user
      @user = current_user
    end

    def get_current_interview
      @user.interviews.find_by(:id => params[:id])
    end

end
