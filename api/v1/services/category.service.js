const Category = require("../../../shared/models/category.model");
const AppError = require("../../../shared/utils/appError.utils");


const createCategory = async (data) => {
    // Check if category name already exists (handled by unique index too, but good for explicit error)
    const existingCategory = await Category.findOne({ name: data.name });
    if (existingCategory) {
        throw new AppError("Category with this name already exists", 400);
    }

    const category = await Category.create(data);
    return category;
};

const getAllCategories = async (query = {}) => {
    // If includeInactive is "true", fetch all. Otherwise, fetch only active.
    const filter = query.includeInactive === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });
    return categories;
};


const getCategoryById = async (id) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new AppError("Category not found", 404);
    }
    return category;
};


const updateCategory = async (id, data) => {
    const category = await Category.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });

    if (!category) {
        throw new AppError("Category not found", 404);
    }
    return category;
};


const deleteCategory = async (id) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        throw new AppError("Category not found", 404);
    }
    return category;
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
