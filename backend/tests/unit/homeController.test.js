const productController = require('../../controllers/homeController');
const Product = require('../../models/productModel');

jest.mock('../../models/productModel');

describe('Product Controller - index()', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return default product list with pagination', async () => {
    Product.countDocuments.mockResolvedValue(30);
    Product.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockResolvedValue([{ name: 'Product 1' }, { name: 'Product 2' }])
    });

    await productController.index(req, res);

    expect(Product.countDocuments).toHaveBeenCalledWith({ deleted: false });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      products: [{ name: 'Product 1' }, { name: 'Product 2' }],
      totalItems: 30,
      totalPages: 2
    });
  });

  it('should filter products by category', async () => {
    req.query.category = 'drinks';

    Product.countDocuments.mockResolvedValue(10);
    Product.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockResolvedValue([{ name: 'Drink 1' }])
    });

    await productController.index(req, res);

    expect(Product.countDocuments).toHaveBeenCalledWith({ deleted: false, slugCategory: 'drinks' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      products: [{ name: 'Drink 1' }],
      totalItems: 10,
      totalPages: 1
    });
  });

  it('should sort by custom sortKey and sortValue', async () => {
    req.query.sortKey = 'price';
    req.query.sortValue = 'asc';

    Product.countDocuments.mockResolvedValue(2);
    Product.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockResolvedValue([{ name: 'Cheap product' }, { name: 'Expensive product' }])
    });

    await productController.index(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      products: [{ name: 'Cheap product' }, { name: 'Expensive product' }],
      totalItems: 2,
      totalPages: 1
    });
  });

  it('should apply pagination based on page and limit', async () => {
    req.query.page = '2';
    req.query.limit = '5';

    Product.countDocuments.mockResolvedValue(20);
    Product.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn((val) => {
        expect(val).toBe(5);
        return {
          skip: jest.fn().mockResolvedValue([{ name: 'Page 2 Product' }])
        };
      }),
      skip: jest.fn()
    });

    await productController.index(req, res);

    expect(Product.countDocuments).toHaveBeenCalledWith({ deleted: false });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
