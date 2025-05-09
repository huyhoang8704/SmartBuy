const Product = require("../models/productModel");
const mongoose = require('mongoose');
const searchHelper = require("../utils/searchHelper");
const axios = require("axios");
const redisClient = require("../database/redisClient");


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

const getProductList = async (req, res) => {
    const userId = req.user?.userId || null;
    console.log("userId", userId);

    let recommendationIds = [];

    if (userId) {
        try {
            const response = await axios.get(`http://model:8000/recommend/${userId}`);
            const { recommendations } = response.data;

            if (Array.isArray(recommendations) && recommendations.length > 0) {
                recommendationIds = recommendations.map(id => new mongoose.Types.ObjectId(id));
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error.message);
        }
    }

    // Base match query
    const matchQuery = { deleted: false };

    if (req.query.category) {
        matchQuery.slugCategory = req.query.category;
    }

    if (req.query.search) {
        const regex = searchHelper(req.query.search);
        matchQuery.$or = [
            { name: regex },
            { description: regex },
            { category: regex },
        ];
    }

    // Pagination
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Sorting
    let sortField = req.query.sortKey || "createdAt";
    let sortOrder = req.query.sortValue === "asc" ? 1 : -1;

    try {
        const pipeline = [
            { $match: matchQuery },
            {
                $addFields: {
                    isRecommended: {
                        $cond: [
                            { $in: ["$_id", recommendationIds] },
                            true,
                            false
                        ]
                    }
                }
            },
            { $sort: { isRecommended: -1, [sortField]: sortOrder } },
            { $skip: skip },
            { $limit: limit }
        ];

        const countPipeline = [
            { $match: matchQuery },
            { $count: "total" }
        ];

        const [products, countResult] = await Promise.all([
            Product.aggregate(pipeline),
            Product.aggregate(countPipeline)
        ]);

        const totalItems = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
            success: true,
            user: userId || null,
            totalItems,
            totalPages,
            products,
        });
    } catch (err) {
        console.error("Error fetching products:", err.message);
        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách sản phẩm.",
        });
    }
};


const getProductListWithCache = async (req, res) => {
    const userId = req.user?.userId || null;
    let recommendationIds = [];

    // 1. Nếu có user → kiểm tra trong Redis
    if (userId) {
        const redisKey = `recommendationIds:${userId}`;
        const cached = await redisClient.get(redisKey);

        if (cached) {
            recommendationIds = JSON.parse(cached).map(id => new mongoose.Types.ObjectId(id));
        } else {
            try {
                const response = await axios.get(`http://model:8000/recommend/${userId}`);
                const { recommendations } = response.data;

                if (Array.isArray(recommendations) && recommendations.length > 0) {
                    recommendationIds = recommendations.map(id => new mongoose.Types.ObjectId(id));
                    await redisClient.setEx(redisKey, 900, JSON.stringify(recommendations)); // Cache trong 15 phút
                }
            } catch (error) {
                console.error("Error fetching recommendations:", error.message);
            }
        }
    }

    // 2. Build query cơ bản
    const matchQuery = { deleted: false };

    if (req.query.category) {
        matchQuery.slugCategory = req.query.category;
    }

    if (req.query.search) {
        const regex = searchHelper(req.query.search);
        matchQuery.$or = [
            { name: regex },
            { description: regex },
            { category: regex },
        ];
    }

    // 3. Pagination & Sorting
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const sortField = req.query.sortKey || "createdAt";
    const sortOrder = req.query.sortValue === "asc" ? 1 : -1;

    try {
        // 4. Dùng aggregation pipeline để thêm trường isRecommended và sort
        const pipeline = [
            { $match: matchQuery },
            {
                $addFields: {
                    isRecommended: {
                        $cond: [
                            { $in: ["$_id", recommendationIds] },
                            true,
                            false
                        ]
                    }
                }
            },
            { $sort: { isRecommended: -1, [sortField]: sortOrder } },
            { $skip: skip },
            { $limit: limit }
        ];

        const countPipeline = [
            { $match: matchQuery },
            { $count: "total" }
        ];

        const [products, countResult] = await Promise.all([
            Product.aggregate(pipeline),
            Product.aggregate(countPipeline)
        ]);

        const totalItems = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
            success: true,
            user: userId || null,
            totalItems,
            totalPages,
            products,
        });
    } catch (err) {
        console.error("Error fetching products:", err.message);
        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách sản phẩm.",
        });
    }
};

module.exports = { 
    index,
    recommendation,
    getProductList,
};