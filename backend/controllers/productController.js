const Product = require('../models/productModel')



const createProduct = async (req, res) => {
    try {
        const existingProduct = await Product.findOne({ name: req.body.name });
        if (existingProduct) {
            return res.status(400).json({ message: "Product name already exists" });
        } else {
            let STT = await Product.countDocuments() + 1;
            const newProduct = new Product({
                STT: STT,
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                price: req.body.price,
                thumbnail_url: req.body.thumbnail_url,
                stock: req.body.stock,
                brand_name: req.body.brand_name
            });
            const saved = await newProduct.save();
            res.status(201).json({
                message: "Product created successfully",
                product: saved
            });
        }

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
};
const createManyProducts = async (req, res) => {
    try {
        const products = req.body.products; // Danh sách sản phẩm gửi từ client
        const insertedProducts = [];
        const skippedProducts = [];

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const existingProduct = await Product.findOne({ name: product.name });

            if (existingProduct) {
                skippedProducts.push({
                    name: product.name,
                    reason: "Product name already exists"
                });
                continue;
            }

            const newProduct = new Product({
                name: product.name,
                category: product.category,
                price: product.price,
                thumbnail_url: product.thumbnail_url,
                brand_name: product.brand_name,
                rating: product.rating,
            });

            const savedProduct = await newProduct.save();
            insertedProducts.push(savedProduct);
        }

        res.status(201).json({
            message: "Product import completed",
            insertedCount: insertedProducts.length,
            skippedCount: skippedProducts.length,
            insertedProducts,
            skippedProducts
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const getAllProducts = async (req, res) => {
    try {
        let find = {
            deleted : false,
        }
        // Search dishes
        if(req.query.search){
            find.name = searchHelper(req);
        }
        // Sort Dishes
        let sort = {
            STT : "desc"
        };

        if(req.query.sortKey && req.query.sortValue){
            delete sort.STT;
            sort[req.query.sortKey] = req.query.sortValue
        }
        // Pagination
        let limit = 0; // Number of items in a page
        if(req.query.limit) {
            limit = parseInt(req.query.limit)
        } else {
            limit = 15
        }
        let skip = 0;  // Default skip is 0
        if (req.query.page) {
            let page = parseInt(req.query.page); // Current Page
            skip = (page - 1) * limit;
        }
        const totalItems = await Product.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);

        const products = await Product
            .find(find)
            .sort(sort)
            .limit(limit)
            .skip(skip)
        res.status(200).json({
            products,
            totalPages,
            totalItems
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const getProductBySlug = async (req, res) => {
    try {
      const product = await Product.findOne({ slug: req.params.slug, deleted: false });
      if (!product) return res.status(404).json({ message: "Product not found" });
  
      // Tìm các sản phẩm cùng category, loại trừ chính sản phẩm đó
      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        deleted: false
      }).limit(10); // Giới hạn số lượng related products nếu muốn
  
      res.json({
        product,
        relatedProducts
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

const updateProduct = async (req, res) => {
    try {
        const slugProduct = req.params.slug;
        const updateInf = req.body;

        const existingProduct = await Product.findOne({
            slug: slugProduct,
            deleted: false,
        });

        if (!existingProduct) {
            return res.status(404).json({ message: "Dish not found." });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { slug : slugProduct },
            { $set: updateInf },
            { new: true, fields: '-name' }
        );

        res.status(200).json({
            message: "Update product successfully.",
            product: updatedProduct,
        });
    } catch (error) {
        res.status(400).json({
            message: "Error!",
            error: error.message,
        });
    }
};

const getProductByCategory = async (req, res) => {
    try {
        let find = {
            deleted : false,
            slugCategory: req.params.slug
        }
        // Search dishes
        if(req.query.search){
            find.name = searchHelper(req);
        }
        // Sort Dishes
        let sort = {
            STT : "desc"
        };
    
        if(req.query.sortKey && req.query.sortValue){
            delete sort.STT;
            sort[req.query.sortKey] = req.query.sortValue
        }
        // Pagination
        let limit = 0; // Number of items in a page
        if(req.query.limit) {
            limit = parseInt(req.query.limit)
        } else {
            limit = 15
        }
        let skip = 0;  // Default skip is 0
        
        if (req.query.page) {
            let page = parseInt(req.query.page); // Current Page
            skip = (page - 1) * limit;
        }
        const totalItems = await Product.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);

        const products = await Product
            .find(find)
            .sort(sort)
            .limit(limit)
            .skip(skip)
        res.status(200).json({
            products,
            totalPages,
            totalItems
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductBySlug,
    updateProduct,
    getProductByCategory,
    createManyProducts
}
  
