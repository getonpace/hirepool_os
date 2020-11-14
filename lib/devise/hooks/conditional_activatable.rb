# frozen_string_literal: true

# Hack to override the after_set_user hook added to Warden::Manager by the
# Devise Authenticatable module.
#
# Based on https://gist.github.com/deathbob/807148

# Remove the default callback defined by devise/lib/devise/hooks/activatable.rb
Warden::Manager.instance_variable_get(:@_after_set_user).tap do |hooks|
  # Hooks are stored internally as an array pair of [block, options];
  #   remove the callback that matches the after_set_user.
  hooks.reject! { |(block, _)| block.to_s =~ /devise\/hooks\/activatable/ }
end

# Deny user access whenever their account is not active yet.
# We need this as hook to validate the user activity on each request
# and in case the user is using other strategies beside Devise ones.
Warden::Manager.after_set_user do |record, warden, options|
  # break unless record && (record.respond_to?(:active_for_authentication?) ||
  #                         record.respond_to?(:confirmed_for_authentication?))

  # Get the provider used to authenticate the request
  provider_header = DeviseTokenAuth.headers_names[:'provider']
  provider = warden.request.headers[provider_header] || warden.params[provider_header]

  # If the user is not active for authentication, or if the user tried to log in
  #   via the email provider but with an unconfirmed email,
  if !record.active_for_authentication? || ((provider == 'email') && !record.confirmed_for_authentication?)
    scope = options[:scope]
    warden.logout(scope)
    throw :warden, scope: scope, message: record.inactive_message
  end
end
