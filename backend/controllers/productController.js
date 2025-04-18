const Product = require('../models/productModel')



const createProduct = async (req, res) => {
    try {
        const existingProduct = await Product.findOne({ name: req.body.name });
        if (existingProduct) {
            return res.status(400).json({ message: "Product name already exists" });
        } else {
            // let STT = await Product.countDocuments() + 1;
            const newProduct = new Product({
                STT: req.body.STT,
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
                STT: product.STT,
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                thumbnail_url: product.thumbnail_url,
                stock: product.stock,
                brand_name: product.brand_name
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

        const products = await Product.find({ deleted: false }).sort({
        STT : "desc",
      });
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

const getProductBySlug = async (req, res) => {
    try {
      const product = await Product.findOne({ slug: req.params.slug, deleted: false });
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
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
        console.log(req.params.slug)
        const products = await Product.find({ slugCategory: req.params.slug, deleted: false });
        res.json(products);
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
  
