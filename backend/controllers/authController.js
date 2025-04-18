const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const userService = require("../services/userService");

const generateToken = (user) => {
    return jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
    
        const user = await userService.findUser({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials." });
    
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });
    
        const token = generateToken(user);
        console.log(token)
        res.cookie("token", token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production", // chỉ true khi deploy production
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 ngày
          });
        res.status(200).json({ user, token });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
    
        // Check existing
        const existing = await userService.findUser({ email });
        console.log(existing)
        if (existing) return res.status(400).json({ message: "Email already exists." });
    
        const newUser = await userService.createUser({ name, email, password });
        const token = generateToken(newUser);
        console.log(token)
        res.cookie("token", token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production", // chỉ true khi deploy production
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 ngày
          });

        res.status(201).json({ user: newUser, token });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}
const logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production", // chỉ true khi deploy production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 ngày
      });
    res.status(200).json({ message: "Logout successfully." });
}

module.exports = {
    login,
    register,
    logout
}