const User = require('../../../shared/models/user.model');
const userService = require('../services/user.service');
const catchAsync = require('../../../shared/utils/catchError.utils');
const AppError = require('../../../shared/utils/appError.utils')

exports.createUser = catchAsync(async (req, res, next) => {
    const user = await userService.createUser(req.body)
    console.log(user)
    
    res.status(201).json({
        status: 'success',
        data: user
    });
})


exports.getAllUsers = catchAsync(async (req, res) => {
    // Get page and limit from query params, default to page 1, limit 10

    const { users, pagination } = await userService.getAllUsers(req.query);
    res.status(200).json({
        page: pagination.page,
        limit: pagination.limit,
        totalUsers: pagination.totalUsers,
        totalPages: pagination.totalPages,
        users
    });
})

exports.getUserById = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const user = await userService.getUserById({ id })
    if (!user) return next(new AppError('user not found', 404))

    res.status(200).json({
        message: 'User found successfully',
        user: user
    })
})

exports.deleteUser = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const user = await userService.deleteUser({ id })
    if (!user) return next(new AppError('user not found', 404))

    res.status(200).json({
        message: 'User deleted successfully',
        user: user
    })
})


exports.updateUser = catchAsync(async (req, res, next) => {
    const { id } = req.params; // user id from URL
    const user = await userService.updateUser({ id, ...req.body })

    if (!user) return next(new AppError('user not found', 404))

    res.status(200).json({ message: 'User updated successfully', user });
});
