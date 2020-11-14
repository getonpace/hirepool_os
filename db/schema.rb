# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20190104012102) do

  create_table "access_groups", force: :cascade do |t|
    t.string   "title",       limit: 255
    t.text     "description", limit: 65535
    t.date     "disable"
    t.string   "key",         limit: 255
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  create_table "access_groups_user_tracking_tags", force: :cascade do |t|
    t.integer  "access_group_id",      limit: 4
    t.integer  "user_tracking_tag_id", limit: 4
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  add_index "access_groups_user_tracking_tags", ["access_group_id"], name: "index_access_groups_user_tracking_tags_on_access_group_id", using: :btree
  add_index "access_groups_user_tracking_tags", ["user_tracking_tag_id"], name: "index_access_groups_user_tracking_tags_on_user_tracking_tag_id", using: :btree

  create_table "actions", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.string   "description", limit: 255
  end

  create_table "authentications", force: :cascade do |t|
    t.integer  "user_id",          limit: 4
    t.string   "provider",         limit: 255,   default: "email", null: false
    t.string   "uid",              limit: 255,   default: "",      null: false
    t.string   "name",             limit: 255
    t.string   "email",            limit: 255
    t.string   "phone",            limit: 255
    t.string   "token",            limit: 1000
    t.datetime "token_expires_at"
    t.text     "params",           limit: 65535
    t.datetime "created_at",                                       null: false
    t.datetime "updated_at",                                       null: false
  end

  add_index "authentications", ["email"], name: "index_authentications_on_email", using: :btree
  add_index "authentications", ["provider", "uid"], name: "index_authentications_on_provider_and_uid", unique: true, using: :btree
  add_index "authentications", ["provider"], name: "index_authentications_on_provider", using: :btree
  add_index "authentications", ["uid"], name: "index_authentications_on_uid", using: :btree
  add_index "authentications", ["user_id"], name: "index_authentications_on_user_id", using: :btree

  create_table "collaborator_feedbacks", force: :cascade do |t|
    t.integer  "interview_id",    limit: 4
    t.integer  "collaborator_id", limit: 4
    t.text     "feedback",        limit: 65535
    t.integer  "rating",          limit: 4
    t.string   "token",           limit: 255
    t.datetime "date_asked"
    t.datetime "date_completed"
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  add_index "collaborator_feedbacks", ["collaborator_id"], name: "index_collaborator_feedbacks_on_collaborator_id", using: :btree
  add_index "collaborator_feedbacks", ["interview_id"], name: "index_collaborator_feedbacks_on_interview_id", using: :btree

  create_table "collaborators", force: :cascade do |t|
    t.string "name",  limit: 255
    t.string "email", limit: 255
  end

  create_table "companies", force: :cascade do |t|
    t.string   "name",                           limit: 255
    t.integer  "size",                           limit: 4
    t.string   "location",                       limit: 255
    t.datetime "created_at",                                 null: false
    t.datetime "updated_at",                                 null: false
    t.string   "domain",                         limit: 255
    t.string   "glassdoor_id",                   limit: 255
    t.float    "interview_difficulty",           limit: 24
    t.integer  "interview_experiences_negative", limit: 4
    t.integer  "interview_experiences_neutral",  limit: 4
    t.integer  "interview_experiences_positive", limit: 4
    t.float    "interview_process_duration",     limit: 24
    t.integer  "interview_offers_accepted",      limit: 4
    t.integer  "interview_offers_declined",      limit: 4
    t.integer  "interview_no_offers",            limit: 4
    t.integer  "interview_recent_reviews",       limit: 4
    t.datetime "reviews_last_processed"
  end

  create_table "companies_interviews", force: :cascade do |t|
    t.integer  "interview_id",   limit: 4
    t.integer  "company_id",     limit: 4
    t.string   "referrer_name",  limit: 255
    t.string   "referrer_email", limit: 255
    t.string   "score",          limit: 255
    t.string   "location",       limit: 255
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  add_index "companies_interviews", ["company_id"], name: "index_companies_interviews_on_company_id", using: :btree
  add_index "companies_interviews", ["interview_id"], name: "index_companies_interviews_on_interview_id", using: :btree

  create_table "email_access_keys", force: :cascade do |t|
    t.string   "email",      limit: 255
    t.string   "access_key", limit: 255
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  add_index "email_access_keys", ["email", "access_key"], name: "index_email_access_keys_on_email_and_access_key", using: :btree

  create_table "email_sign_ups", force: :cascade do |t|
    t.string   "email",      limit: 255
    t.string   "name",       limit: 255
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "events", force: :cascade do |t|
    t.integer  "interview_id",             limit: 4
    t.integer  "interviewer_id",           limit: 4
    t.string   "interviewer_relationship", limit: 255
    t.string   "style",                    limit: 255
    t.datetime "date"
    t.boolean  "time_specified"
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.string   "substyle",                 limit: 255
    t.integer  "culture_val",              limit: 4
    t.text     "one_word",                 limit: 65535
    t.text     "notes",                    limit: 65535
    t.integer  "prep_kit_message",         limit: 4
  end

  add_index "events", ["date"], name: "index_events_on_date", using: :btree
  add_index "events", ["interview_id"], name: "index_events_on_interview_id", using: :btree
  add_index "events", ["interviewer_id"], name: "index_events_on_interviewer_id", using: :btree

  create_table "events_interviewers", force: :cascade do |t|
    t.integer  "event_id",       limit: 4
    t.integer  "interviewer_id", limit: 4
    t.string   "relationship",   limit: 255
    t.integer  "excited",        limit: 4
    t.boolean  "is_poc"
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  add_index "events_interviewers", ["event_id"], name: "index_events_interviewers_on_event_id", using: :btree
  add_index "events_interviewers", ["interviewer_id"], name: "index_events_interviewers_on_interviewer_id", using: :btree

  create_table "glassdoor_reviews", id: false, force: :cascade do |t|
    t.string  "id",             limit: 255
    t.integer "difficulty",     limit: 4
    t.integer "experience",     limit: 4
    t.integer "duration",       limit: 4
    t.integer "offer",          limit: 4
    t.string  "source",         limit: 255
    t.date    "interview_date"
    t.string  "types",          limit: 255
    t.integer "company_id",     limit: 4
    t.date    "review_date"
  end

  create_table "interactions", force: :cascade do |t|
    t.integer  "event_id",    limit: 4
    t.string   "style",       limit: 255
    t.integer  "culture_val", limit: 4
    t.text     "one_word",    limit: 65535
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  add_index "interactions", ["event_id"], name: "index_interactions_on_event_id", using: :btree

  create_table "interactions_interviewers", force: :cascade do |t|
    t.integer  "interaction_id", limit: 4
    t.integer  "interviewer_id", limit: 4
    t.string   "relationship",   limit: 255
    t.integer  "excited",        limit: 4
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  add_index "interactions_interviewers", ["interaction_id"], name: "index_interactions_interviewers_on_interaction_id", using: :btree
  add_index "interactions_interviewers", ["interviewer_id"], name: "index_interactions_interviewers_on_interviewer_id", using: :btree

  create_table "interviewers", force: :cascade do |t|
    t.string   "name",         limit: 255
    t.string   "email",        limit: 255
    t.string   "role",         limit: 255
    t.string   "gender",       limit: 255
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.integer  "company_id",   limit: 4
    t.text     "notes",        limit: 65535
    t.integer  "user_id",      limit: 4
    t.string   "relationship", limit: 255
  end

  create_table "interviews", force: :cascade do |t|
    t.integer  "user_id",        limit: 4
    t.text     "role",           limit: 65535
    t.text     "location",       limit: 65535
    t.text     "referrer_name",  limit: 65535
    t.text     "referrer_email", limit: 65535
    t.datetime "date"
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
    t.text     "source",         limit: 65535
    t.boolean  "pinned"
    t.boolean  "archived"
    t.text     "job_title",      limit: 65535
    t.text     "notes",          limit: 65535
    t.boolean  "applied"
    t.text     "job_url",        limit: 65535
    t.integer  "company_id",     limit: 4
    t.date     "applied_on"
  end

  add_index "interviews", ["user_id"], name: "index_interviews_on_user_id", using: :btree

  create_table "interviews_interviewers", force: :cascade do |t|
    t.integer  "interview_id",        limit: 4
    t.integer  "interviewer_id",      limit: 4
    t.string   "style",               limit: 255
    t.datetime "date"
    t.string   "relationship",        limit: 255
    t.integer  "duration_minutes",    limit: 4
    t.integer  "timeliness",          limit: 4
    t.integer  "preparation",         limit: 4
    t.integer  "difficulty",          limit: 4
    t.integer  "experience_score",    limit: 4
    t.integer  "culture_val",         limit: 4
    t.string   "location",            limit: 255
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.integer  "interviewer_score",   limit: 4
    t.integer  "company_preparation", limit: 4
    t.integer  "excited",             limit: 4
    t.text     "notes",               limit: 65535
    t.integer  "role_match",          limit: 4
    t.text     "one_word",            limit: 65535
  end

  add_index "interviews_interviewers", ["interview_id"], name: "index_interviews_interviewers_on_interview_id", using: :btree
  add_index "interviews_interviewers", ["interviewer_id"], name: "index_interviews_interviewers_on_interviewer_id", using: :btree

  create_table "invoices", force: :cascade do |t|
    t.integer  "subscription_id",   limit: 4
    t.string   "stripe_invoice_id", limit: 255
    t.string   "stripe_status",     limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "amount",            limit: 4
  end

  add_index "invoices", ["subscription_id"], name: "index_invoices_on_subscription_id", using: :btree

  create_table "modals", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.string   "description", limit: 255
  end

  create_table "offers", force: :cascade do |t|
    t.integer  "interview_id",              limit: 4
    t.string   "status",                    limit: 255
    t.string   "offer_type",                limit: 255
    t.decimal  "base_salary",                           precision: 10
    t.decimal  "total_target_compensation",             precision: 10
    t.string   "additional_compensation",   limit: 255
    t.date     "expiration_date"
    t.datetime "created_at",                                           null: false
    t.datetime "updated_at",                                           null: false
  end

  add_index "offers", ["interview_id"], name: "index_offers_on_interview_id", using: :btree

  create_table "pages", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.string   "description", limit: 255
  end

  create_table "payments", force: :cascade do |t|
    t.integer  "user_id",      limit: 4
    t.datetime "attempted_at"
    t.datetime "completed_at"
    t.integer  "amount",       limit: 4
    t.string   "status",       limit: 255
    t.string   "token",        limit: 255
    t.text     "payment_hash", limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  add_index "payments", ["user_id"], name: "index_payments_on_user_id", using: :btree

  create_table "resumes", force: :cascade do |t|
    t.integer  "user_id",           limit: 4
    t.string   "resume_file",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "original_filename", limit: 255
  end

  add_index "resumes", ["user_id"], name: "index_resumes_on_user_id", using: :btree

  create_table "sort_params", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.string   "description", limit: 255
  end

  create_table "subscription_activities", force: :cascade do |t|
    t.integer  "user_id",         limit: 4
    t.string   "activity_type",   limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "webhook_payload", limit: 65535
  end

  add_index "subscription_activities", ["user_id"], name: "index_subscription_activities_on_user_id", using: :btree

  create_table "subscriptions", force: :cascade do |t|
    t.integer  "user_id",                limit: 4
    t.string   "stripe_subscription_id", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "plan",                   limit: 255
    t.boolean  "active",                             default: true
    t.datetime "end_date"
    t.datetime "next_charge_at"
  end

  add_index "subscriptions", ["user_id"], name: "index_subscriptions_on_user_id", using: :btree

  create_table "surveys", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.datetime "date_taken"
    t.integer  "user_id",    limit: 4
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  add_index "surveys", ["user_id"], name: "index_surveys_on_user_id", using: :btree

  create_table "user_actions", force: :cascade do |t|
    t.integer  "user_id",       limit: 4
    t.integer  "action_id",     limit: 4
    t.integer  "modal_id",      limit: 4
    t.integer  "page_id",       limit: 4
    t.integer  "sort_param_id", limit: 4
    t.integer  "event_id",      limit: 4
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
  end

  add_index "user_actions", ["action_id"], name: "index_user_actions_on_action_id", using: :btree
  add_index "user_actions", ["event_id"], name: "index_user_actions_on_event_id", using: :btree
  add_index "user_actions", ["modal_id"], name: "index_user_actions_on_modal_id", using: :btree
  add_index "user_actions", ["page_id"], name: "index_user_actions_on_page_id", using: :btree
  add_index "user_actions", ["sort_param_id"], name: "index_user_actions_on_sort_param_id", using: :btree
  add_index "user_actions", ["user_id"], name: "index_user_actions_on_user_id", using: :btree

  create_table "user_actions_interviews", force: :cascade do |t|
    t.integer  "user_action_id", limit: 4
    t.integer  "interview_id",   limit: 4
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  add_index "user_actions_interviews", ["interview_id"], name: "index_user_actions_interviews_on_interview_id", using: :btree
  add_index "user_actions_interviews", ["user_action_id"], name: "index_user_actions_interviews_on_user_action_id", using: :btree

  create_table "user_tracking_tags", force: :cascade do |t|
    t.string   "tag",        limit: 255
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "provider_deprecated",                    limit: 255,   default: "email", null: false
    t.string   "uid_deprecated",                         limit: 255,   default: "",      null: false
    t.string   "encrypted_password",                     limit: 255,   default: "",      null: false
    t.string   "reset_password_token",                   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                          limit: 4,     default: 0,       null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",                     limit: 255
    t.string   "last_sign_in_ip",                        limit: 255
    t.string   "confirmation_token",                     limit: 255
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email",                      limit: 255
    t.string   "name",                                   limit: 255
    t.string   "nickname",                               limit: 255
    t.string   "image",                                  limit: 255
    t.string   "email",                                  limit: 255
    t.text     "tokens",                                 limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "access_group_id",                        limit: 4
    t.string   "user_agreement_status",                  limit: 255
    t.string   "sponsor",                                limit: 255
    t.boolean  "is_admin"
    t.boolean  "is_test_account"
    t.datetime "saw_user_agreement_at"
    t.boolean  "saw_welcome_screen"
    t.boolean  "sent_event_prep_kit_1"
    t.boolean  "sent_event_prep_kit_2"
    t.boolean  "event_prep_kit_opt_out"
    t.datetime "last_survey_reminder_date"
    t.boolean  "never_show_survey_reminder",                           default: false
    t.datetime "last_authentication_merged_at"
    t.datetime "authentication_merged_message_shown_at"
    t.boolean  "need_ftu_opportunity_details",                         default: true
    t.boolean  "allow_password_change",                                default: false,   null: false
    t.datetime "welcome_email_sent_at"
    t.string   "last_authentication_merged_provider",    limit: 255
    t.string   "access_key",                             limit: 255
    t.boolean  "need_ftu_opportunities_index",                         default: true
    t.string   "payments_group",                         limit: 255
    t.datetime "intercom_user_created_at"
    t.string   "intercom_messaging_version",             limit: 255
    t.boolean  "cerebro_opt_in",                                       default: false
    t.boolean  "saw_cerebro_invite",                                   default: false
    t.boolean  "premium_packet_sent",                                  default: false,   null: false
    t.string   "stripe_customer_id",                     limit: 255
    t.string   "intercom_id",                            limit: 255
  end

  add_index "users", ["email"], name: "index_users_on_email", using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "users_user_tracking_tags", force: :cascade do |t|
    t.integer  "user_id",              limit: 4
    t.integer  "user_tracking_tag_id", limit: 4
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  add_index "users_user_tracking_tags", ["user_id"], name: "index_users_user_tracking_tags_on_user_id", using: :btree
  add_index "users_user_tracking_tags", ["user_tracking_tag_id"], name: "index_users_user_tracking_tags_on_user_tracking_tag_id", using: :btree

  add_foreign_key "authentications", "users"
  add_foreign_key "surveys", "users"
end
