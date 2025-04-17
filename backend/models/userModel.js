const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Full name is required'],
            minlength: [3, 'Full name must be at least 3 characters long'],
            maxlength: [50, 'Full name must be at most 50 characters long'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [3, 'Password must be at least 6 characters long']
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^\d{10,15}$/, 'Phone number must contain only digits and be between 10 to 15 characters long']
        },
        address: {
            type: String,
            default: "",
            trim: true
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: 'user'
        },
        token: {
            type: String,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", UserSchema, "user"); // argu3 là tên collection trong db

module.exports = User;
