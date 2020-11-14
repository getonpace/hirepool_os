class CreatePayments < ActiveRecord::Migration
  def change
    create_table :payments do |t|
      t.belongs_to :user, index: true
      t.timestamp :attempted_at
      t.timestamp :completed_at
      t.integer :amount
      t.string :status
      t.string :token
      t.text :payment_hash
      t.timestamps null: false
    end
  end
end
