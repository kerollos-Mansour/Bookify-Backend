const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            maxlength: 50,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            maxlength: 255,
            unique: true,
        },

        password: {
            type: String,
            required: true,
            maxlength: 255,
        },

        role: {
            type: String,
            default: "user",
            enum: ["user", "admin", "vendor"],
        },

        vendorInfo: {
            businessName: {
                type: String,
                maxlength: 200,
            },
            approved: {
                type: Boolean,
                default: false,
            },
            approvedAt: {
                type: Date,
            },
        },

        name: {
            type: String,
            maxlength: 100,
        },

        phoneNo: {
            type: String,
            maxlength: 20,
        },

        country: {
            type: String,
            maxlength: 100,
        },

        dateOfBirth: {
            type: Date,
        },

        gender: {
            type: String,
            maxlength: 20,
        },

        bio: {
            type: String,
        },

        address: {
            type: String,
            maxlength: 255,
        },

        emergencyContact: {
            type: String,
            maxlength: 100,
        },

        accessibilityNeeds: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default: true
        },
        refreshToken: {
            type: String,
        },
        resetToken: {
            type: String,
        },
        resetTokenExpiry: {
            type: Date,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Allows null values while maintaining uniqueness
        },
    },
    { timestamps: true }
); // automatically adds createdAt & updatedAt

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Add index for Google OAuth lookups


const User = mongoose.model("User", userSchema);

module.exports = User;
