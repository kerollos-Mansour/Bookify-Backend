const express = require("express");
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById,
    deleteUser,
    updateUser,
    changeUserRole,
    sendResetPassword,
} = require("../controller/user.controller");
const { protect, allowTo } = require("../../../shared/middlewares/jwt.middleware");
const validate = require("../../../shared/middlewares/validate.middleware");
const {
    createUserSchema,
    updateUserSchema,
    userIdSchema,
    changeUserRoleSchema,
} = require("../validators/user.validator");

// protect all user routes

router.get("/", getAllUsers);
router.get("/:id", validate({ params: userIdSchema }), getUserById);

router.use(protect);
// post new user
router.post("/", allowTo("admin"), validate(createUserSchema), createUser);
router.delete(
    "/:id",
    allowTo("admin"),
    validate({ params: userIdSchema }),
    deleteUser
);
router.put(
    "/:id",
    allowTo("admin"),
    validate({ params: userIdSchema, body: updateUserSchema }),
    updateUser
);

router.patch(
    "/:id",
    allowTo("admin"),
    validate({ params: userIdSchema, body: changeUserRoleSchema }),
    changeUserRole
);

router.post(
    "/:id/reset-password",
    allowTo("admin"),
    validate({ params: userIdSchema }),
    sendResetPassword
);

module.exports = router;
