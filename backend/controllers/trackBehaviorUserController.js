const produceEvent = require("../kafka/producer");
const UserBehavior = require("../models/userBehaviorModel");
const Product = require("../models/productModel");
const trackBehaviorUser = async (req, res) => {
    try {
      const { userId, productId, action, keyword } = req.body;
  
      if (!userId && !action) {
        return res.status(400).json({ message: "userId và action là bắt buộc" });
      }
      const product = await Product.findById(productId);
      const behavior = new UserBehavior({ 
        userId, 
        productId, 
        action, 
        keyword,
        category: product.category,
        brand_name: product.brand_name

      });
      await behavior.save();
  
      // await produceEvent("user-behavior", {
      //   userId,
      //   productId,
      //   action,
      //   keyword,
      //   timestamp: new Date(),
      // });
  
      res.status(201).json({ message: "Behavior tracked successfully",
        behavior
       });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
};

const getBehaviorLogsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { action, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId là bắt buộc" });
    }

    const filter = { userId };

    // Lọc theo hành động nếu có
    if (action) {
      filter.action = action;
    }

    const logs = await UserBehavior.find(filter)
      .sort({ timestamp: -1 })
      .populate({
        path: "productId",
        select: "name price image description stock rating",
      });

    res.status(200).json({
      message: "Lấy danh sách hành vi người dùng thành công",
      data: logs,
    });
  } catch (error) {
    console.error("Lỗi khi lấy log:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



module.exports = {
    trackBehaviorUser,
    getBehaviorLogsByUser
};

