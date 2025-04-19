const Cart = require("../models/cartModel");


const addProductToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // if cart does not exist
      const newCart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });
      const savedCart = await newCart.save();
      return res.status(201).json(savedCart);
    }

    const itemIndex = cart.items.findIndex(item =>
      item.productId.equals(productId)
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    cart.updatedAt = new Date();
    const updatedCart = await cart.save();
    return res.json(updatedCart);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/cart/:userId
const getCartbyUserId = async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.params.userId }).populate("items.productId");
      if (!cart) return res.status(404).json({ message: "Cart not found" });
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

// PUT /api/cart/:userId
const updateCart = async (req, res) => {
    const { productId, quantity } = req.body;
  
    try {
      const cart = await Cart.findOne({ userId: req.params.userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });
  
      const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
  
      if (itemIndex > -1) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }
      } else {
        cart.items.push({ productId, quantity });
      }
  
      cart.updatedAt = new Date();
      const updated = await cart.save();
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  

module.exports = {
    addProductToCart,
    getCartbyUserId,
    updateCart
};