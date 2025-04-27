const produceEvent = require("../kafka/producer");
const UserBehavior = require("../models/userBehaviorModel");
const Product = require("../models/productModel");



const trackBehaviorUser = async (req, res) => {
  try {
    const { userId, action, selectedItems = [], keyword = "" } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ message: "userId và action là bắt buộc" });
    }

    const kafkaTopic = process.env.KAFKA_TOPIC;
    const logsToSend = [];

    if (action === "search" && selectedItems.length === 0) {
      const event = {
        userId,
        action,
        keyword,
        timestamp: new Date(),
      };
      logsToSend.push(event);
    } else {
      selectedItems.forEach(item => {
        const quantity = item.quantity || 1;
        const now = new Date(); // tạo 1 lần
        for (let i = 0; i < quantity; i++) {
          logsToSend.push({
            userId,
            productId: item.productId,
            action,
            timestamp: now,
          });
        }
      });
    }

    // Gửi Kafka bất đồng bộ (song song)
    await Promise.all(
      logsToSend.map(event => produceEvent(kafkaTopic, event))
    );

    res.status(201).json({
      message: "Behaviors user tracked successfully",
      totalSent: logsToSend,
    });

  } catch (err) {
    console.error("Error tracking behavior:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const getBehaviorLogsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { action, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId là bắt buộc" });
    }

    const filter = { userId };

    // Lọc theo hành động nếu có
    if (action) {
      filter.action = action;
    }
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const logs = await UserBehavior.find(filter)
      .sort({ timestamp: -1 })
      .populate({
        path: "productId",
        select: "name price image description stock rating",
      }).skip(skip).limit(limit);

    res.status(200).json({
      message: "Lấy danh sách hành vi người dùng thành công",
      data: logs,
      totalPages: Math.ceil(await UserBehavior.countDocuments(filter) / limit),
    });
  } catch (error) {
    console.error("Lỗi khi lấy log:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};


const aggregateBehaviorStats = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;


    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    const aggregationPipeline = [
      {
        $group: {
          _id: {
            productId: "$productId",
            action: "$action"
          },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "product",
          localField: "_id.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$_id.productId",
          action: "$_id.action",
          count: 1,
          productName: "$product.name",
          productImage: "$product.thumbnail_url"
        }
      },
      { $sort: { count: -1 } },
      { $skip: skip },
      { $limit: limitVal }
    ];

    const stats = await UserBehavior.aggregate(aggregationPipeline);

    // Get total count for pagination
    const totalCountAggregation = await UserBehavior.aggregate([
      {
        $group: {
          _id: {
            productId: "$productId",
            action: "$action"
          }
        }
      },
      { $count: "total" }
    ]);

    const total = totalCountAggregation[0]?.total || 0;

    res.status(200).json({
      message: "Thống kê hành vi người dùng theo sản phẩm và hành động",
      data: stats,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitVal,
        totalPages: Math.ceil(total / limitVal)
      }
    });
  } catch (error) {
    console.error("Lỗi khi thống kê hành vi:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};




module.exports = {
    trackBehaviorUser,
    getBehaviorLogsByUser,
    aggregateBehaviorStats
};

