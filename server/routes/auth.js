const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );

router.post("/register", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body || {};
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), password_hash });
    const token = signToken(user);
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ email: user.email, invoice_template: user.invoice_template });
  } catch (error) {
    console.error("Register failed", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    let user = await User.findOne({ email: email.toLowerCase() });
    // Bootstrap convenience: if no users exist yet, create the first one on login
    if (!user) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        const password_hash = await bcrypt.hash(password, 10);
        user = await User.create({
          email: email.toLowerCase(),
          password_hash,
        });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(user);
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ email: user.email, invoice_template: user.invoice_template });
  } catch (error) {
    console.error("Login failed", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token").json({ success: true });
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    email: req.user.email,
    invoice_template: req.user.invoice_template,
  });
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { invoice_template } = req.body || {};
    if (invoice_template && !["classic", "compact"].includes(invoice_template)) {
      return res.status(400).json({ error: "Invalid template" });
    }
    req.user.invoice_template = invoice_template || req.user.invoice_template;
    await req.user.save();
    res.json({
      email: req.user.email,
      invoice_template: req.user.invoice_template,
    });
  } catch (error) {
    console.error("Update profile failed", error);
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;
