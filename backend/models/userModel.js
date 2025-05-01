const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
            minlength: [3, 'Password must be at least 6 characters long']
        },
        phone: {
            type: String,
            default: "",
            match: [/^\d{10,15}$/, 'Phone number must contain only digits and be between 10 to 15 characters long']
        },
        address: {
            type: String,
            default: "",
            trim: true
        },
        age: {
            type: Number,
            default: 0,
            min: [0, 'Age must be a positive number'],
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: "other"
        },
        occupation: {
            type: String,
            default: ""
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: 'user'
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
// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  
  // Compare password method
  UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

const User = mongoose.model("User", UserSchema, "user"); // argu3 là tên collection trong db

module.exports = User;
