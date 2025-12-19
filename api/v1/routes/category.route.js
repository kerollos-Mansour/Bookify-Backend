const express = require("express");
const categoryController = require("../controller/category.controller");
const validateRequest = require("../../../shared/middlewares/validate.middleware");
// const validate = require("../../../shared/middlewares/validate.middleware");
// const validateRequest = require("../../../shared/middlewares/");

// Assuming you have a generic validator middleware
const { createCategorySchema, updateCategorySchema } = require("../validators/category.validator");

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.post("/", validateRequest(createCategorySchema), categoryController.createCategory);
router.get("/:id", categoryController.getCategoryById);
router.patch("/:id", validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
