const mongoose = require('mongoose');
const bcryptjs = require('bcrypt');

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        maxlength: 50,
        unique: true
    },

    email: {
        type: String,
        required: true,
        maxlength: 255,
        unique: true
    },

    password: {
        type: String,
        required: true,
        maxlength: 255
    },

    name: {
        type: String,
        maxlength: 100
    },

    phoneNo: {
        type: String,
        maxlength: 20
    },

    country: {
        type: String,
        maxlength: 100
    },

    dateOfBirth: {
        type: Date
    },

    gender: {
        type: String,
        maxlength: 20
    },

    bio: {
        type: String
    },

    address: {
        type: String,
        maxlength: 255
    },

    emergencyContact: {
        type: String,
        maxlength: 100
    },

    accessibilityNeeds: {
        type: String
    }

}, { timestamps: true }); // automatically adds createdAt & updatedAt


userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        return next();
    }
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcryptjs.compare(password, this.password);
}

const User = mongoose.model('User', userSchema);

module.exports = User;