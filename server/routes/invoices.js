const express = require("express");
const Invoice = require("../models/Invoice");
const InvoiceCounter = require("../models/InvoiceCounter");
const { formatInvoiceNumber } = require("../utils/formatInvoiceNumber");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const sanitizeLineItems = (items = []) =>
  (items || []).map((item) => ({
    description: item.description || "",
    hours: Number(item.hours) || 0,
    minutes: Number(item.minutes) || 0,
    rate: Number(item.rate) || 0,
    total: Number(item.total) || 0,
    link: item.link || "",
    link_label: item.link_label || "",
    note: item.note || "",
  }));

const sanitizeAdjustments = (adjustments = []) =>
  (adjustments || []).map((adj) => ({
    description: adj.description || "",
    amount: Number(adj.amount) || 0,
  }));

const sanitizePaymentDetails = (details = []) =>
  (details || []).map((detail) => ({
    type: detail.type || "other",
    label: detail.label || "",
    value: detail.value || "",
    is_link: detail.is_link !== false,
    qr_code_url: detail.qr_code_url || "",
    qr_code_data: detail.qr_code_data || "",
    bank_name: detail.bank_name || "",
    account_number: detail.account_number || "",
    swift_code: detail.swift_code || "",
    routing_number: detail.routing_number || "",
  }));

router.get("/", authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(invoices);
  } catch (error) {
    console.error("Failed to list invoices", error);
    res.status(500).json({ error: "Failed to list invoices" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    console.error("Failed to fetch invoice", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const payload = req.body || {};
    const {
      invoice_number,
      line_items,
      adjustments,
      payment_details,
      submitted_date,
      date_range_start,
      date_range_end,
      ...rest
    } = payload;

    const sanitizedLineItems = sanitizeLineItems(line_items);
    const sanitizedAdjustments = sanitizeAdjustments(adjustments);
    const sanitizedPaymentDetails = sanitizePaymentDetails(payment_details);

    const subtotal =
      typeof payload.subtotal === "number"
        ? payload.subtotal
        : sanitizedLineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const total =
      typeof payload.total === "number"
        ? payload.total
        : subtotal +
          sanitizedAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);

    let assignedNumber = invoice_number;

    if (!assignedNumber) {
      const counter = await InvoiceCounter.findOneAndUpdate(
        { user: req.user._id },
        { $inc: { last_number: 1 }, user: req.user._id },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      assignedNumber = formatInvoiceNumber(counter.last_number);
    } else {
      const numericPart = parseInt(
        String(assignedNumber).replace(/\D/g, ""),
        10
      );
      if (!Number.isNaN(numericPart)) {
        await InvoiceCounter.findOneAndUpdate(
          { user: req.user._id },
          { $max: { last_number: numericPart }, user: req.user._id },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    const invoice = await Invoice.create({
      invoice_number: assignedNumber,
      line_items: sanitizedLineItems,
      adjustments: sanitizedAdjustments,
      payment_details: sanitizedPaymentDetails,
      submitted_date,
      date_range_start,
      date_range_end,
      subtotal,
      total,
      invoice_style: payload.invoice_style || req.user.invoice_template,
      user: req.user._id,
      ...rest,
    });

    res.status(201).json(invoice);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Invoice number already exists" });
    }
    console.error("Failed to create invoice", error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const payload = req.body || {};
    const {
      line_items,
      adjustments,
      payment_details,
      submitted_date,
      date_range_start,
      date_range_end,
      ...rest
    } = payload;

    const sanitizedLineItems = sanitizeLineItems(line_items);
    const sanitizedAdjustments = sanitizeAdjustments(adjustments);
    const sanitizedPaymentDetails = sanitizePaymentDetails(payment_details);

    const subtotal =
      typeof payload.subtotal === "number"
        ? payload.subtotal
        : sanitizedLineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const total =
      typeof payload.total === "number"
        ? payload.total
        : subtotal +
          sanitizedAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        line_items: sanitizedLineItems,
        adjustments: sanitizedAdjustments,
        payment_details: sanitizedPaymentDetails,
        submitted_date,
        date_range_start,
        date_range_end,
        subtotal,
        total,
        invoice_style: payload.invoice_style || req.user.invoice_template,
        ...rest,
      },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("Failed to update invoice", error);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete invoice", error);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

module.exports = router;
