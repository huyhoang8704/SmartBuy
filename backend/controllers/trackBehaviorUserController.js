const produceEvent = require("../kafka/producer");
const UserBehavior = require("../models/UserBehaviorModel");

const trackBehaviorUser = async (req, res) => {
    try {
      const { userId, productId, action, keyword } = req.body;
  
      if (!userId && !action) {
        return res.status(400).json({ message: "userId và action là bắt buộc" });
      }
  
      const behavior = new UserBehavior({ userId, productId, action, keyword });
      await behavior.save();
  
      await produceEvent("user-behavior", {
        userId,
        productId,
        action,
        keyword,
        timestamp: new Date(),
      });
  
      res.status(201).json({ message: "Behavior tracked successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    trackBehaviorUser
};

