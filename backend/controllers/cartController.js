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


module.exports = {
    addProductToCart
};