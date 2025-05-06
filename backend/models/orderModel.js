const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  paymentMethod: {
    type: String,
    enum: ["cash", "creditCard"],
    default: "cash"
  },
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },
  userInformation: {
    name: String,
    phone: String,
    address: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema, "order");
