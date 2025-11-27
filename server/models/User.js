const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password_hash: { type: String, required: true },
    invoice_template: {
      type: String,
      enum: ["classic", "compact"],
      default: "classic",
    },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
