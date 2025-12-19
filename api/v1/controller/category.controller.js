const categoryService = require("../services/category.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");

const createCategory = catchAsync(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { category },
    });
});

const getAllCategories = catchAsync(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        results: categories.length,
        data: { categories },
    });
});

const getCategoryById = catchAsync(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { category },
    });
});

const updateCategory = catchAsync(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { category },
    });
});

const deleteCategory = catchAsync(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "Category deleted successfully",
    });
});

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
