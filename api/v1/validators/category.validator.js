const Joi = require("joi");

const createCategorySchema = Joi.object({
    name: Joi.string().trim().required().messages({
        "any.required": "Category name is required",
        "string.empty": "Category name cannot be empty",
    }),
    slug: Joi.string().trim().lowercase().required().messages({
        "any.required": "Slug is required",
        "string.empty": "Slug cannot be empty",
    }),
    description: Joi.string().trim().optional().allow(""),
    icon: Joi.string().optional().allow(""),
    image: Joi.string().uri().optional().allow(""),
    isActive: Joi.boolean().default(true),
    displayOrder: Joi.number().default(0),
});

const updateCategorySchema = Joi.object({
    name: Joi.string().trim().optional(),
    slug: Joi.string().trim().lowercase().optional(),
    description: Joi.string().trim().optional().allow(""),
    icon: Joi.string().optional().allow(""),
    image: Joi.string().uri().optional().allow(""),
    isActive: Joi.boolean().optional(),
    displayOrder: Joi.number().optional(),
});

module.exports = {
    createCategorySchema,
    updateCategorySchema,
};
