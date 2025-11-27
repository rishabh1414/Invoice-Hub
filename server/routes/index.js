const express = require("express");
const invoicesRouter = require("./invoices");
const paymentSettingsRouter = require("./paymentSettings");
const invoiceCounterRouter = require("./invoiceCounter");
const authRouter = require("./auth");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/invoices", invoicesRouter);
router.use("/payment-settings", paymentSettingsRouter);
router.use("/invoice-counter", invoiceCounterRouter);

module.exports = router;
