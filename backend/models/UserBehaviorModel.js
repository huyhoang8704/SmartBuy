const mongoose = require("mongoose");

const userBehaviorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    action: {
        type: String,
        enum: ["view", "search", "addtocart", "transaction"],
        required: true,
    },
    keyword: { 
        type: String,
    }, // dùng cho hành vi search
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserBehavior", userBehaviorSchema, "user_behaviors");
