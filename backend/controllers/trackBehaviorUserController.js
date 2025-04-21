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

module.exports = {
    trackBehaviorUser
};

