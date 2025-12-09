const User = require('../../../shared/models/user.model');
const catchAsync = require('../../../shared/utils/catchError.utils');
const AppError = require('../../../shared/utils/appError.utils')

const sanitizeUser = (user) => { // to remove pass from response
    const { password, ...safeUser } = user.toObject();
    return safeUser;
};

exports.createUser = catchAsync(async (data) => {
    const {
        username,
        email,
        password,
        name,
        phoneNo,
        country,
        dateOfBirth,
        gender,
        bio,
        address,
        emergencyContact,
        accessibilityNeeds
    } = data;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new AppError('Username or email already exists', 400);
    }
    const user = new User({
        username,
        email,
        password,
        name,
        phoneNo,
        country,
        dateOfBirth,
        gender,
        bio,
        address,
        emergencyContact,
        accessibilityNeeds
    });
    await user.save();
    return sanitizeUser(user);
})

exports.getAllUsers = catchAsync(async (data) => {
    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments(); // total users in DB
    const users = await User.find().select('-password').skip(skip).limit(limit);
    return {
        users,
        pagination: {
            page, limit, skip, totalUsers,
            totalPages: Math.ceil(totalUsers / limit)
        }
    };
})

exports.getUserById = catchAsync(async (data) => {
    const user = await User.findById(data.id).select('-password');
    if (!user) throw new AppError('user not found', 404)
    return user
})

exports.deleteUser = catchAsync(async (data) => {
    let deletedUser = await User.findByIdAndDelete(data.id);
    if (!deletedUser) throw new AppError('User not found', 404)
    return { message: 'User deleted successfully' };
})

exports.updateUser = async (data) => {
    const { id, username, email, password, name, phoneNo, country, dateOfBirth, gender, bio, address, emergencyContact, accessibilityNeeds } = data;

    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (username && username !== user.username) {
        const existing = await User.findOne({ username, _id: { $ne: id } });
        if (existing) throw new AppError('Username already exists', 400);
    }
    if (email && email !== user.email) {
        const existing = await User.findOne({ email, _id: { $ne: id } });
        if (existing) throw new AppError('Email already exists', 400);
    }

    // Update
    Object.assign(user, {
        ...(username && { username }),
        ...(email && { email }),
        ...(name && { name }),
        ...(phoneNo && { phoneNo }),
        ...(country && { country }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(gender && { gender }),
        ...(bio && { bio }),
        ...(address && { address }),
        ...(emergencyContact && { emergencyContact }),
        ...(accessibilityNeeds && { accessibilityNeeds }),
        ...(password && { password }) // plain → model hashes
    });

    await user.save();
    return sanitizeUser(user);
};