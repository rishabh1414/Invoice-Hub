const express = require("express");
const PaymentSettings = require("../models/PaymentSettings");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

const sanitizeMethods = (methods = []) =>
  (methods || []).map((method) => ({
    type: method.type || "other",
    label: method.label || "",
    value: method.value || "",
    is_link: method.is_link !== false,
    qr_code_url: method.qr_code_url || "",
    qr_code_data: method.qr_code_data || "",
    bank_name: method.bank_name || "",
    account_number: method.account_number || "",
    swift_code: method.swift_code || "",
    routing_number: method.routing_number || "",
  }));

router.get("/", authMiddleware, async (req, res) => {
  try {
    const settings = await PaymentSettings.findOne({ user: req.user._id });
    res.json(settings || { payment_methods: [] });
  } catch (error) {
    console.error("Failed to load payment settings", error);
    res.status(500).json({ error: "Failed to load payment settings" });
  }
});

router.put("/", authMiddleware, async (req, res) => {
  try {
    const { payment_methods = [] } = req.body || {};
    const sanitizedMethods = sanitizeMethods(payment_methods);
    const updated = await PaymentSettings.findOneAndUpdate(
      { user: req.user._id },
      { payment_methods: sanitizedMethods, user: req.user._id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("Failed to save payment settings", error);
    res.status(500).json({ error: "Failed to save payment settings" });
  }
});

module.exports = router;
