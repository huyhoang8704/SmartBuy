// const kafka = require("./kafkaClient");

// const consumer = kafka.consumer({ groupId: "recommendation-group" });

// const UserBehavior = require("../models/UserBehaviorModel");

// const startConsumer = async () => {
//   await consumer.connect();
//   await consumer.subscribe({ topic: "user-behavior", fromBeginning: false });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       const event = JSON.parse(message.value.toString());
//       console.log("📥 Behavior event received:", event);
//       // TODO: save to DB / push to model / redis queue, v.v...
//       const behavior = new UserBehavior(event);
//       await behavior.save();

//       console.log("✅ Saved to MongoDB");
//     },
//   });
// };

// module.exports = startConsumer;
