const cartController = require('../../controllers/cartController');
const Cart = require('../../models/cartModel');
const mongoose = require('mongoose');

jest.mock('../../models/cartModel');

describe('Cart Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('addProductToCart', () => {
    it('should create a new cart if none exists', async () => {
      req.body = {
        userId: 'user123',
        productId: new mongoose.Types.ObjectId(),
        quantity: 2
      };

      Cart.findOne.mockResolvedValue(null);
      Cart.prototype.save = jest.fn().mockResolvedValue({
        userId: req.body.userId,
        items: [{ productId: req.body.productId, quantity: 2 }]
      });

      await cartController.addProductToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        userId: req.body.userId,
        items: [{ productId: req.body.productId, quantity: 2 }]
      });
    });

    it('should update quantity if product already in cart', async () => {
      const productId = new mongoose.Types.ObjectId();
      req.body = { userId: 'user123', productId, quantity: 3 };

      const cart = {
        items: [{ productId, quantity: 2 }],
        updatedAt: null,
        save: jest.fn().mockResolvedValue({
          items: [{ productId, quantity: 5 }]
        })
      };

      Cart.findOne.mockResolvedValue(cart);

      await cartController.addProductToCart(req, res);

      expect(cart.items[0].quantity).toBe(5);
      expect(res.json).toHaveBeenCalledWith({ items: [{ productId, quantity: 5 }] });
    });
  });

  describe('getCartbyUserId', () => {
    it('should return populated cart', async () => {
      req.user.userId = 'user123';

      const populatedCart = {
        items: [{ productId: { name: 'Test' }, quantity: 1 }]
      };

      Cart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(populatedCart)
      });

      await cartController.getCartbyUserId(req, res);

      expect(res.json).toHaveBeenCalledWith(populatedCart);
    });

    it('should return message if cart not found', async () => {
      req.user.userId = 'user123';

      Cart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await cartController.getCartbyUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart empty!', cart: [] });
    });
  });

  describe('updateCart', () => {
    it('should update quantity or remove product', async () => {
      const productId = new mongoose.Types.ObjectId();
      req.user.userId = 'user123';
      req.body = { productId, quantity: 0 };

      const cart = {
        items: [{ productId, quantity: 2 }],
        updatedAt: null,
        save: jest.fn().mockResolvedValue({ items: [] })
      };

      Cart.findOne.mockResolvedValue(cart);

      await cartController.updateCart(req, res);

      expect(cart.items.length).toBe(0);
      expect(res.json).toHaveBeenCalledWith({ items: [] });
    });

    it('should return 404 if cart not found', async () => {
      req.user.userId = 'user123';
      Cart.findOne.mockResolvedValue(null);

      await cartController.updateCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found' });
    });
  });

  describe('removeProductFromCart', () => {
    it('should remove a product from cart', async () => {
      const productId = new mongoose.Types.ObjectId();
      req.body.userId = 'user123';
      req.params.productId = productId;

      const cart = {
        items: [{ productId, quantity: 1 }],
        updatedAt: null,
        save: jest.fn().mockResolvedValue({ items: [] })
      };

      Cart.findOne.mockResolvedValue(cart);

      await cartController.removeProductFromCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ items: [] });
    });

    it('should return 404 if product not in cart', async () => {
      req.body.userId = 'user123';
      req.params.productId = new mongoose.Types.ObjectId();

      const cart = {
        items: [],
      };

      Cart.findOne.mockResolvedValue(cart);

      await cartController.removeProductFromCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found in cart' });
    });
  });
});
