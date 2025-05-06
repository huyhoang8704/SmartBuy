const Product = require("../models/productModel");
const mongoose = require('mongoose');
const searchHelper = require("../utils/searchHelper");
const axios = require("axios");

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
        const regex = searchHelper(req.query.search);
        find.$or = [
            { name: regex },
            { description: regex },
            { category: regex },
        ];
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

const recommendation = async (req, res) => {
    const { userId } = req.params;

    try {
        // Gọi service recommendation
        const response = await axios.get(`http://model:8000/recommend/${userId}`);

        const { user, recommendations } = response.data;

        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            return res.status(200).json({
                success: true,
                user,
                products: [],
                totalItems: 0,
                totalPages: 0,
            });
        }
        const recommendationIds = recommendations.map(id => new mongoose.Types.ObjectId(id));

        // Base query
        let query = {
            _id: { $in: recommendationIds },
            deleted: false,
        };

        // Filter by category 
        if (req.query.category) {
            query.slugCategory = req.query.category;
        }

        // Search
        if (req.query.search) {
            const regex = searchHelper(req.query.search);
            query.$or = [
                { name: regex },
                { description: regex },
                { category: regex },
            ];
        }

        // Sort
        let sort = { createdAt: -1 };
        if (req.query.sortKey && req.query.sortValue) {
            sort = {};
            sort[req.query.sortKey] = req.query.sortValue === "asc" ? 1 : -1;
        }

        // Pagination
        const limit = parseInt(req.query.limit) || 15;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const totalItems = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        const products = await Product.find(query)
            .sort(sort)
            .limit(limit)
            .skip(skip);

        return res.status(200).json({
            success: true,
            user,
            totalItems,
            totalPages,
            products,
        });

    } catch (error) {
        console.error("Error fetching recommendation products:", error.message);
        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách sản phẩm gợi ý.",
        });
    }
};


module.exports = { 
    index,
    recommendation
};