const orderController = require('../../controllers/orderController');
const Order = require('../../models/orderModel');
const Cart = require('../../models/cartModel');
const Product = require('../../models/productModel');

jest.mock('../../models/orderModel');
jest.mock('../../models/cartModel');
jest.mock('../../models/productModel');

describe('Order Controller - createOrderFromSelectedCartItems', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 'user123' },
      body: {
        selectedItems: [
          { productId: 'prod1', quantity: 2 },
          { productId: 'prod2', quantity: 1 }
        ],
        paymentMethod: 'cash'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  it('should return 400 if no items are selected', async () => {
    req.body.selectedItems = [];

    await orderController.createOrderFromSelectedCartItems(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'No items selected' });
  });

  it('should return 400 if cart is empty', async () => {
    Cart.findOne.mockResolvedValue({ items: [] });

    await orderController.createOrderFromSelectedCartItems(req, res);

    expect(Cart.findOne).toHaveBeenCalledWith({ userId: 'user123' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cart is empty' });
  });

  it('should create order and remove selected items from cart', async () => {
    const cartMock = {
      items: [
        { productId: 'prod1', quantity: 2 },
        { productId: 'prod2', quantity: 1 },
        { productId: 'prod3', quantity: 5 }
      ],
      save: jest.fn(),
      updatedAt: new Date()
    };

    const productMock = [
      { _id: 'prod1', price: 10 },
      { _id: 'prod2', price: 20 }
    ];

    const orderMock = { id: 'order123', items: [], totalAmount: 40 };

    Cart.findOne.mockResolvedValue(cartMock);
    Product.find.mockResolvedValue(productMock);
    Order.create.mockResolvedValue(orderMock);

    await orderController.createOrderFromSelectedCartItems(req, res);

    expect(Product.find).toHaveBeenCalledWith({ _id: { $in: ['prod1', 'prod2'] } });
    expect(Order.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
      totalAmount: 40,
      paymentMethod: 'cash',
    }));
    expect(cartMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Order created from selected cart items successfully',
      order: orderMock
    });
  });
});
