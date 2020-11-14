class Api::AccessGroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  # GET /access_groups
  def index
    if @user.is_admin && @user[:sponsor] == "hirepool"
      render :json => { :success => true, :access_groups => AccessGroup.all }, :status => 200
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /access_groups/:id
  def show
  end

  # POST /access_groups
  def create
    if @user.is_admin && @user[:sponsor] == "hirepool"
      @access_group_params = access_group_params
      if params[:key_root] && @access_group_params[:title]
        ActiveRecord::Base.transaction do
          @errors = 0
          @chances = 4
          while @errors < @chances
            begin
              @access_group_params[:key] = "#{params[:key_root]}-#{generate_new_postfix}"
              @access_group = AccessGroup.create!(@access_group_params.except(:key_root))
              @errors = 4
            rescue ActiveRecord::RecordInvalid
              @errors = @errors + 1
              if @errors == 4
                raise
              end
            end
          end
          if params[:user_tracking_tags]
            params[:user_tracking_tags].each { |tag|
              @user_tracking_tag = nil
              @user_tracking_tag = UserTrackingTag.find_by(:tag => tag.strip)
              if !@user_tracking_tag
                @user_tracking_tag = UserTrackingTag.create!({:tag => tag.strip})
              end
              @access_group.user_tracking_tags << @user_tracking_tag
            }
            @access_group.save
          end
        end

        if @access_group
          render :json => { :success => true, :access_group => @access_group }, :status => 200
        else
          render :json => { :success => false, :error => 'try again' }, :status => 400
        end

      else
        render :json => { :success => false, :error => 'bad params' }, :status => 400
      end
    else
      render :json => { :success => false, :error => 'user cannot generate keys' }, :status => 403
    end
  end

  # PUT /access_groups/:id
  def update
    if @user.is_admin && @user[:sponsor] == "hirepool"
      @access_group_params = access_group_params
      @access_group = get_current_access_group
      if @access_group
        ActiveRecord::Base.transaction do
          @access_group.update!(@access_group_params)
        end
        render :json => { :success => true, :access_group => @access_group }, :status => 200
      else
        render :json => { :success => false, :error => 'bad params' }, :status => 400
      end
    else
      render :json => { :success => false, :error => 'user cannot generate keys' }, :status => 403
    end
  end

  private
    def get_current_access_group
      access_group = AccessGroup.find_by(:id => params[:id])
    end

    def generate_new_postfix
      ('0'..'9').to_a.shuffle.first(3).join
    end

    def access_group_params
      params.require(:access_group).permit(:title, :description, :disable, :key, :id)
    end

    def get_current_user
      @user = current_user
    end

end
