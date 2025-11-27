const express = require("express");
const PaymentSettings = require("../models/PaymentSettings");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

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
    const updated = await PaymentSettings.findOneAndUpdate(
      { user: req.user._id },
      { payment_methods, user: req.user._id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("Failed to save payment settings", error);
    res.status(500).json({ error: "Failed to save payment settings" });
  }
});

module.exports = router;
