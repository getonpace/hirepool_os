class AccessKeyService

  SPONSORS = {
    "tomco-123" => "tomco-123",
    "premium-free" => "premium-free",
    "premium-five" => "premium-five",
    "premium-twenty" => "premium-twenty"
  }

  attr_reader :access_key, :user_tracking_tags, :user_agreement_status, :sponsor

  def initialize (resource)
    @resource = resource
    @access_key = @resource.access_key
    @user_tracking_tags = []
    @sponsor = nil
    @user_agreement_status = nil
    if access_key
      if access_group
        access_group.user_tracking_tags.each { |tag|
          @user_tracking_tags << tag
          @sponsor ||= SPONSORS[tag.tag]
        }
      end
    end
  end

  def setup_sponsor_and_tags
    if access_key && access_group
      @resource.access_group_id = access_group[:id]
      @resource.sponsor = sponsor
      @resource.user_tracking_tags = user_tracking_tags
      @resource.user_agreement_status = user_agreement_status
      @resource.set_payments_group
    end
  end

  def access_group
    @access_group ||= AccessGroup.find_by(key: @access_key)
  end

end