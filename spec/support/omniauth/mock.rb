module Omniauth
  module Mock
    def auth_mock
      OmniAuth.config.mock_auth[:twitter] = OmniAuth::AuthHash.new({
        provider: 'twitter',
        uid: '123545',
        user_info: {
          name: 'mockuser'
        },
        credentials: {
          token: 'mock_token',
          secret: 'mock_secret'
        }
      })
    end
  end
end