const mongoose = require('mongoose');
const UserBehavior = require('../models/userBehaviorModel'); // Model MongoDB của bạn

// Kết nối Redis và MongoDB
const redisClient = require('../database/redisClient');

const syncLogsToMongo = async () => {
    try {
      const keys = await redisClient.keys("userBehavior:*");
        console.log("Tôi đã ở đây")
      if (keys.length === 0) {
        console.log("[Sync] Không có log nào để đồng bộ.");
        return;
      }
  
      for (const key of keys) {
        const logs = await redisClient.lRange(key, 0, -1);
  
        if (logs.length > 0) {
          const parsedLogs = logs.map(log => JSON.parse(log));
          await UserBehavior.insertMany(parsedLogs);
          console.log(`[Sync] Đồng bộ ${logs.length} logs từ ${key} vào MongoDB.`);
  
          // Xóa key sau khi sync
          await redisClient.del(key);
        }
      }
    } catch (error) {
      console.error("[Sync] Lỗi khi đồng bộ logs từ Redis -> MongoDB:", error);
    }
  };

// setInterval(syncLogsToMongo, 120 * 1000); // 15 phút = 900000 ms

module.exports = syncLogsToMongo;
