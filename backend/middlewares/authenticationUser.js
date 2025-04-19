const jwt = require('jsonwebtoken');

const User = require('../models/userModel');


// Middleware xác thực JWT từ cookie
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token; // Lấy token từ cookie
    console.log(token)

    if (!token) {
        return res.status(401).json({ message: 'Bạn cần đăng nhập để truy cập tài nguyên này.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(decoded)

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
}; 
module.exports = authenticateToken;
  

