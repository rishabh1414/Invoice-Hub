const mongoose = require("mongoose");

const LineItemSchema = new mongoose.Schema(
  {
    description: { type: String, default: "" },
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    link: { type: String, default: "" },
    link_label: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const AdjustmentSchema = new mongoose.Schema(
  {
    description: { type: String, default: "" },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const PaymentDetailSchema = new mongoose.Schema(
  {
    type: { type: String, default: "other" },
    label: { type: String, default: "" },
    value: { type: String, default: "" },
    is_link: { type: Boolean, default: true },
    qr_code_url: { type: String, default: "" },
    qr_code_data: { type: String, default: "" },
    bank_name: { type: String, default: "" },
    account_number: { type: String, default: "" },
    swift_code: { type: String, default: "" },
    routing_number: { type: String, default: "" },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoice_number: { type: String, required: true },
    client_name: { type: String, required: true },
    submitted_date: { type: Date, required: true },
    date_range_start: { type: Date },
    date_range_end: { type: Date },
    line_items: { type: [LineItemSchema], default: [] },
    adjustments: { type: [AdjustmentSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    payment_details: { type: [PaymentDetailSchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "pending", "paid", "overdue", "cancelled"],
      default: "draft",
    },
    notes: { type: String, default: "" },
    invoice_style: {
      type: String,
      enum: ["classic", "compact"],
      default: "classic",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

InvoiceSchema.index({ user: 1, invoice_number: 1 }, { unique: true });

module.exports =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
