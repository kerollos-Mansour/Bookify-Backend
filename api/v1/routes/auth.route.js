const express = require("express");
const router = express.Router();
const { register, login, forgotPassword } = require("../controller/auth.controller");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const validate = require("../../../shared/middlewares/validate.middleware");

// post new destination
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", forgotPassword);
// router.get('/:id', getUserById)
// router.delete('/:id', deleteUser)
// router.put('/:id', updateUser)

module.exports = router;
