const mongoose = require("mongoose");

const InvoiceCounterSchema = new mongoose.Schema(
  {
    last_number: {
      type: Number,
      default: 0,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.InvoiceCounter ||
  mongoose.model("InvoiceCounter", InvoiceCounterSchema);
