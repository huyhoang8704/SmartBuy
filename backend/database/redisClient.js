const { createClient } = require("redis");

const redisClient = createClient({
    url: "redis://redis:6379"
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
    await redisClient.connect();
    console.log('Redis Client Connected');
})();

module.exports = redisClient;
