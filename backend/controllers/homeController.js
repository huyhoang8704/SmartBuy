const Product = require("../models/productModel");
const searchHelper = require("../utils/searchHelper");

const index = async (req, res) => {
    let find = {
        deleted : false,
    }
    // Categories
    if (req.query.category) {
        find.slugCategory = req.query.category;
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
    const totalItems = await Product.countDocuments(find);
    const totalPages = Math.ceil(totalItems / limit);

    const products = await Product
        .find(find)
        .sort(sort)
        .limit(limit)
        .skip(skip)

    categories = [
        {
            category: "Phụ kiện thời trang",
            slugCategory: "phu-kien-thoi-trang"
        },
        {
            category: "Phụ kiện tóc",
            slugCategory: "phu-kien-toc"
        },
        {
            category: "Phụ kiện mắt kính",
            slugCategory: "phu-kien-mat-kinh"
        },        
    ]


    res.status(200).json({
        products,
        totalItems,
        totalPages,
        categories
    });
}




module.exports = { 
    index
};