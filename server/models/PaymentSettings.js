const mongoose = require("mongoose");

const PaymentMethodSchema = new mongoose.Schema(
  {
    type: { type: String, default: "other" },
    label: { type: String, default: "" },
    value: { type: String, default: "" },
    is_link: { type: Boolean, default: true },
    qr_code_url: { type: String, default: "" },
  },
  { _id: false }
);

const PaymentSettingsSchema = new mongoose.Schema(
  {
    payment_methods: {
      type: [PaymentMethodSchema],
      default: [],
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PaymentSettings ||
  mongoose.model("PaymentSettings", PaymentSettingsSchema);
