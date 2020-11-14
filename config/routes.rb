Rails.application.routes.draw do

  namespace :api do
    get 'payments/overview/:days', to: 'payments#overview'
    get 'payments/user/:id', to: 'payments#user_index'
    post 'payments', to: 'payments#create'
    get 'user_actions/recent', to: 'user_actions#recent'
    get 'user_actions/recent/user/:id', to: 'user_actions#user_recent'
    get 'user_actions/user/:id', to: 'user_actions#user_index'
    get 'user_actions/all/user/:id', to: 'user_actions#user_all'
    post 'user_actions/public', to: 'user_actions#public_create'
    get 'company_autocomplete', to: 'company_autocomplete#index'
    get 'company_details/all', to: 'company_autocomplete#all_details'
    get 'company_details', to: 'company_autocomplete#details'
    get 'company_ratings/all', to: 'company_autocomplete#all_ratings'
    get 'company_ratings', to: 'company_autocomplete#ratings'
    get 's3_upload', to: 's3_upload#s3_access_token'
    get 'admin/users', to: 'allinterviews#users'
    get 'admin/interviews', to: 'allinterviews#interviews'
    get 'admin/events', to: 'allinterviews#events'
    get 'admin/collaborations', to: 'allinterviews#collaborations'
    get 'admin/offers', to: 'allinterviews#offers'
    get 'offers/overview/:days', to: 'offers#overview'
    get 'collaborator_feedback/overview/:days', to: 'collaborator_feedback#overview'
    get 'events/overview/:days', to: 'events#overview'
    get 'interviewers/overview/:days', to: 'interviewers#overview'
    get 'interviews/overview/:days', to: 'interviews#overview'
    get 'interviews/notes/:id', to: 'interviews#notes'
    get 'interviews/user/:id', to: 'interviews#user_index'
    get 'users/overview/:days', to: 'users#overview'
    get 'users/:id', to: 'users#index'
    get 'users/profile', to: 'users#profile'
    put 'users/user_agreement/:user_agreement_status', to: 'users#update_user_agreement'
    put 'users/saw_welcome_screen', to: 'users#saw_welcome_screen'
    put 'users/saw_authentication_merged_message', to: 'users#saw_authentication_merged_message'
    put 'users/never_show_survey_reminder', to: 'users#never_show_survey_reminder'
    put 'users/set_survey_last_reminded_date', to: 'users#set_survey_last_reminded_date'
    put 'users/need_ftu_opportunity_details', to: 'users#need_ftu_opportunity_details'
    put 'users/need_ftu_opportunities_index', to: 'users#need_ftu_opportunities_index'
    put 'users/saw_cerebro_invite', to: 'users#saw_cerebro_invite'
    put 'users/accept_cerebro_invite', to: 'users#accept_cerebro_invite'
    get 'companies/all', to: 'companies#all'
    get 'companies/:id', to: 'companies#index'
    get 'surveys/user/:id', to: 'surveys#user_index'
    get 'premium_surveys/user/:id', to: 'premium_surveys#user_index'
    put 'events/notes/:id', to: 'events#notes'
    put 'event_mailer/prep_kit', to: 'event_mailers#prep_kit'
    get 'email_auth_method', to: 'email_auth_method#index'

    resources :users, only: [:update] do
      resources :resumes, only: [:index] do
        collection do
          post 'upload_resume', to: 'resumes#upload_resume'
        end
      end
      resources :subscription_activities, only: [:index]
      resources :subscriptions, only: [:index, :create, :destroy] do
        collection do
          put 'update_payment_details', to: 'subscriptions#update_payment_details'
          get 'payment_details', to: 'subscriptions#payment_details'
        end
      end
      resources :invoices, only: [:index]
      resources :payments, only: [:index]
    end
    resources :user_actions
    resources :access_groups
    resources :surveys
    resources :premium_surveys
    resources :faq_questions
    resources :interviews do
      collection do
        post 'check_csv'
        post 'validate_csv_data'
        post 'save_csv_data'
      end
    end
    resources :feedback #TODO remove for interviews_v2
    resources :events
    resources :offers
    resources :keys
    resources :collaborator_feedback
    resources :provide_feedback
    resources :email_sign_ups
  end

  # User Data Exports
  scope path: '/api/user_data', as: :export_user_data, module: :api do
    defaults format: :csv do
      get 'opportunities',                    to: 'data_exports#interviews'
      get 'events',                           to: 'data_exports#events'
      get 'interactions',                     to: 'data_exports#interactions'
      get 'collaborations',                   to: 'data_exports#collaborations'
      get 'events_interviewer_ratings',       to: 'data_exports#events_interviewers'
      get 'interactions_interviewer_ratings', to: 'data_exports#interactions_interviewers'
    end
  end

  scope '/api' do
    mount_devise_token_auth_for 'User', at: 'auth', controllers: {
      confirmations: 'devise_token_auth_overrides/confirmations',
      omniauth_callbacks: 'devise_token_auth_overrides/omniauth_callbacks',
      passwords: 'devise_token_auth_overrides/passwords',
      registrations: 'devise_token_auth_overrides/registrations',
      sessions: 'devise_token_auth_overrides/sessions',
    }
  end

  namespace :webhooks do
    post 'stripe/webhook', to: 'stripe#webhook'
  end

  # Letter Opener - for browsing sent emails in development
  #  See: https://github.com/fgrehm/letter_opener_web
  #     & https://github.com/ryanb/letter_opener
  #
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?


  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
