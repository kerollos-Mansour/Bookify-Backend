const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, resetPassword, googleAuth, googleAuthCallback } = require("../controller/auth.controller");
const { refreshToken } = require("../controller/refresh.controller");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const validate = require("../../../shared/middlewares/validate.middleware");

// Authentication routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

module.exports = router;
