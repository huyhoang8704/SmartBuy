const Product = require("../models/productModel");
const searchHelper = require("../utils/searchHelper");

const index = async (req, res) => {
    let find = {
        deleted: false,
    };

    // Filter by category
    if (req.query.category) {
        find.slugCategory = req.query.category;
    }

    // Search dishes
    if (req.query.search) {
        find.name = searchHelper(req);
    }

    // Default sort: newest first
    let sort = {
        createdAt: -1 // Descending: newest first
    };

    // Custom sort
    if (req.query.sortKey && req.query.sortValue) {
        sort = {}; // override default
        sort[req.query.sortKey] = req.query.sortValue === "asc" ? 1 : -1;
    }

    // Pagination
    let limit = parseInt(req.query.limit) || 15;
    let skip = 0;

    if (req.query.page) {
        let page = parseInt(req.query.page);
        skip = (page - 1) * limit;
    }

    const totalItems = await Product.countDocuments(find);
    const totalPages = Math.ceil(totalItems / limit);

    const products = await Product
        .find(find)
        .sort(sort)
        .limit(limit)
        .skip(skip);

    res.status(200).json({
        products,
        totalItems,
        totalPages,
    });
};




module.exports = { 
    index
};