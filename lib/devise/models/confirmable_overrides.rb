# frozen_string_literal: true

# Override portions of Devise::Models::Confirmable
#
# NOTE: This file must be loaded _before_ the :confirmable module is mixed
#       into the Devise resource_class.
Devise::Models::Confirmable.module_eval do
  # Don't check if confirmed when checking if active.
  #
  # Instead of verifying the confirmation status of the user when checking if
  #   active_for_authentication, first check if active and THEN conditionally
  #   verify confirmations only if authenticating with an email provider.
  #
  def active_for_authentication?
    super
  end

  # Check if the resource is confirmed for authentication--
  #   ONE of the following must be true:
  #   - The user does not require confirmation,
  #   - The user is already confirmed,
  #   - The confirm time (if any) has not expired for this user.
  #
  def confirmed_for_authentication?
    !confirmation_required? || confirmed? || confirmation_period_valid?
  end
end
