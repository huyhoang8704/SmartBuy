const Product = require("../models/productModel");
const searchHelper = require("../utils/searchHelper");

const index = async (req, res) => {
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
        totalItems,
        totalPages
    });
}

const getProductByCategory = async (req, res) => {
    let find = {
        deleted : false,
        slugCategory : req.params.slug
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
        totalItems,
        totalPages
    });
}


module.exports = { 
    index,
    getProductByCategory 
};