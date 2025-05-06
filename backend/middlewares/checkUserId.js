const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


// Middleware xác thực JWT từ cookie
const checkUserId = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Invalid token:", err.message);
        next();
    }
};
module.exports = checkUserId;
  

