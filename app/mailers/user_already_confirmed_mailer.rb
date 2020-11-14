class UserAlreadyConfirmedMailer < ApplicationMailer

  def already_confirmed_email(user, url)
    @user = user
    if url.index("localhost")
      @url = "#{url}/#/"
    else
      @url = "#{url}/app/#/"
    end

    if @user
      if @user[:email]
        @email = @user.name.present? && %("#{@user[:name]}" <#{@user[:email]}>) || @user[:email]
        @name = @user.name.present? && user.name.split[0] || 'there'
        mail(to: @email, subject: 'Hirepool Email Confirmation') do |format|
          format.html { render 'already_confirmed_email'}
          format.text { 'already_confirmed_email' }
        end
      end
    end
  end

end
