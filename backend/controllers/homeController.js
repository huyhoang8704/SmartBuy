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
    const userId = req.user?.userId || null;

    try {
        // Gọi service recommendation
        const response = await axios.get("http://model:8000/recommend/" + userId);
        const { user, recommendations } = response.data;

        const recommendationIds = Array.isArray(recommendations)
            ? recommendations.map(id => id.toString())
            : [];

        // --- Tạo query cơ bản
        const baseQuery = { deleted: false };

        // Filter category
        if (req.query.category) {
            baseQuery.slugCategory = req.query.category;
        }

        // Optional: Filter search
        if (req.query.search) {
            const regex = new RegExp(req.query.search, "i");
            baseQuery.$or = [
                { name: regex },
                { description: regex },
                { category: regex },
            ];
        }

        // Fetch all matching products
        const allProducts = await Product.find(baseQuery);

        // Chia thành hai nhóm: được recommend và không
        const recommendSet = new Set(recommendationIds);
        const recommendMap = {};
        allProducts.forEach(p => {
            const idStr = p._id.toString();
            if (recommendSet.has(idStr)) recommendMap[idStr] = p;
        });

        // Giữ đúng thứ tự recommend
        const recommendedProducts = recommendationIds
            .map(id => recommendMap[id])
            .filter(p => p !== undefined);

        // Lấy các sản phẩm không nằm trong danh sách recommend
        const otherProducts = allProducts.filter(
            p => !recommendSet.has(p._id.toString())
        );

        // Gộp lại: recommend trước, còn lại sau
        let finalProducts = [...recommendedProducts, ...otherProducts];

        // Sort nếu có
        const sortKey = req.query.sortKey;
        const sortValue = req.query.sortValue === "asc" ? 1 : -1;

        if (sortKey === "price" || sortKey === "rating") {
            finalProducts.sort((a, b) => {
                const valA = a[sortKey] || 0;
                const valB = b[sortKey] || 0;
                return (valA - valB) * sortValue;
            });
        }

        // Pagination
        const limit = parseInt(req.query.limit) || 15;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const paginatedProducts = finalProducts.slice(skip, skip + limit);
        const totalItems = finalProducts.length;
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
            success: true,
            user,
            totalItems,
            totalPages,
            products: paginatedProducts,
        });

    } catch (error) {
        console.error("Error fetching recommendation products:", error.message);
        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách sản phẩm.",
        });
    }
};


const getProductsList = async (req, res) => {
    const userId = req.user?.userId || null;

    // --- Tạo query cơ bản
    const baseQuery = { deleted: false };

    // Filter category
    if (req.query.category) {
        baseQuery.slugCategory = req.query.category;
    }

    // Optional: Filter search
    if (req.query.search) {
        const regex = new RegExp(req.query.search, "i");
        baseQuery.$or = [
            { name: regex },
            { description: regex },
            { category: regex },
        ];
    }

    // Pagination
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Sort
    const sortKey = req.query.sortKey;
    const sortValue = req.query.sortValue === "asc" ? 1 : -1;

    try {
        // Nếu có userId => gọi recommendation
        if (userId) {

            // Check Redis cache
            const cacheKey = `products:user:${userId}:page:${page}:limit:${limit}:sort:${sortKey}:${sortValue}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                return res.status(200).json(JSON.parse(cachedData));
            }
            // Fetch service recommendation
            const response = await axios.get("http://model:8000/recommend/" + userId);
            const { user, recommendations } = response.data;

            const recommendationIds = Array.isArray(recommendations)
                ? recommendations.map(id => id.toString())
                : [];

            const allProducts = await Product.find(baseQuery);

            const recommendSet = new Set(recommendationIds);
            const recommendMap = {};
            allProducts.forEach(p => {
                const idStr = p._id.toString();
                if (recommendSet.has(idStr)) recommendMap[idStr] = p;
            });

            const recommendedProducts = recommendationIds
                .map(id => recommendMap[id])
                .filter(p => p !== undefined);

            const otherProducts = allProducts.filter(
                p => !recommendSet.has(p._id.toString())
            );

            let finalProducts = [...recommendedProducts, ...otherProducts];

            if (sortKey === "price" || sortKey === "rating") {
                finalProducts.sort((a, b) => {
                    const valA = a[sortKey] || 0;
                    const valB = b[sortKey] || 0;
                    return (valA - valB) * sortValue;
                });
            }

            const paginatedProducts = finalProducts.slice(skip, skip + limit);
            const totalItems = finalProducts.length;
            const totalPages = Math.ceil(totalItems / limit);

            const responseData = {
                success: true,
                user,
                totalItems,
                totalPages,
                products: paginatedProducts,
            };

            await redisClient.setEx(cacheKey, 900, JSON.stringify(responseData)); // Cache trong 15 phút

            return res.status(200).json(responseData);

        } else {
            // Không có userId => gọi index logic
            const totalItems = await Product.countDocuments(baseQuery);
            const totalPages = Math.ceil(totalItems / limit);

            let sort = { createdAt: -1 }; // Default sort

            if (sortKey && sortValue) {
                sort = {};
                sort[sortKey] = sortValue;
            }

            const products = await Product
                .find(baseQuery)
                .sort(sort)
                .skip(skip)
                .limit(limit);

            return res.status(200).json({
                success: true,
                totalItems,
                totalPages,
                products,
            });
        }

    } catch (error) {
        console.error("Error getting products:", error.message);
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
    getProductsList,
};