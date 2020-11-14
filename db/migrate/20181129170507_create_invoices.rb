class CreateInvoices < ActiveRecord::Migration
  def change
    create_table :invoices do |t|
      t.belongs_to :subscription, index: true
      t.string :stripe_invoice_id
      t.string :stripe_status

      t.timestamps
    end
  end
end
