const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const createOrderFromSelectedCartItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const selectedItems = req.body.selectedItems;

    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      return res.status(400).json({ message: "No items selected" });
    }

    // 1. Lấy giỏ hàng người dùng
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Lấy thông tin sản phẩm từ DB
    const productIds = selectedItems.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // 3. Tạo orderItems (có giá)
    const orderItems = selectedItems.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      };
    });

    // 4. Tính tổng tiền
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // 5. Tạo order
    const newOrder = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      paymentMethod: req.body.paymentMethod || "cash"
    });

    // 6. Xóa các sản phẩm đã mua khỏi cart
    const remainingCartItems = cart.items.filter(cartItem =>
      !selectedItems.some(sel => sel.productId === cartItem.productId.toString())
    );

    cart.items = remainingCartItems;
    cart.updatedAt = new Date();
    await cart.save();

    res.status(201).json({
      message: "Order created from selected cart items successfully",
      order: newOrder
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create order", error });
  }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate("userId").populate("items.productId");
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Failed to get order", error });
    }
};

const getOrdersByUserId = async (req, res) => {
    try {
      const  userId = req.user.userId;

      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
  
      const orders = await Order.find({ userId }).populate("items.productId")
        .skip(skip).limit(limit).sort({ createdAt: -1 });
      if(!orders) return res.status(404).json({ message: "Orders not found" });
  
      res.status(200).json({
        message: "Fetched orders successfully",
        orders
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders", error });
    }
  };

module.exports = { 
    createOrderFromSelectedCartItems,
    getOrderById,
    getOrdersByUserId 
};