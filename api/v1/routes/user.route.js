const express = require("express");
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById,
    deleteUser,
    updateUser,
    changeUserRole,
} = require("../controller/user.controller");
const { protect, allowTo } = require("../../../shared/middlewares/jwt.middle");
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

module.exports = router;
