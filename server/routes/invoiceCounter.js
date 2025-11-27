const express = require("express");
const InvoiceCounter = require("../models/InvoiceCounter");
const { formatInvoiceNumber } = require("../utils/formatInvoiceNumber");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/next", authMiddleware, async (req, res) => {
  try {
    const counter = await InvoiceCounter.findOne({ user: req.user._id });
    const nextNumber = (counter?.last_number || 0) + 1;
    res.json({
      next_number: nextNumber,
      next_invoice_number: formatInvoiceNumber(nextNumber),
    });
  } catch (error) {
    console.error("Failed to fetch invoice counter", error);
    res.status(500).json({ error: "Failed to fetch invoice counter" });
  }
});

module.exports = router;
