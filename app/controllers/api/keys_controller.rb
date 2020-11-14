class Api::KeysController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  def index
    if @user.is_admin && @user[:sponsor] == "hirepool"
      render :json => { :success => true, :email_access_keys => EmailAccessKey.all }, :status => 200
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  def create
    if @user.is_admin && @user[:sponsor] == "hirepool"
      @email_access_key_pairs = Array.new
      email_params.each { |email|  @email_access_key_pairs.push({:email => email.strip, :access_key => generate_new_key})}
      begin
        ActiveRecord::Base.transaction do
          @new_pairs = EmailAccessKey.create!(@email_access_key_pairs)
        end
      rescue ActiveRecord::RecordInvalid
        @old_pairs = Array.new
        @new_pairs = Array.new
        ActiveRecord::Base.transaction do
          @email_access_key_pairs.each { |proposed_pair|
            pair = nil
            pair = EmailAccessKey.find_by(:email => proposed_pair[:email])
            if (pair)
              @old_pairs << pair
            else
              @new_pairs << EmailAccessKey.create!(proposed_pair)
            end
          }
        end
      end

      if @new_pairs || @old_pairs
        render :json => { :success => true, :email_access_keys => @new_pairs, :old_email_access_keys => @old_pairs }, :status => 200
      else
        render :json => { :success => false, :error => 'cannot generate keys for these users' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'user cannot generate keys' }, :status => 403
    end
  end

  private
    def generate_new_key
      ('a'..'z').to_a.shuffle.first(10).join
    end

    def email_params
      params.require(:emails)
    end

    def get_current_user
      @user = current_user
    end

end
