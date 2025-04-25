const UserBehavior = require("../models/userBehaviorModel");
require("dotenv").config();
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER],
  });

  const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_MONGO });


const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      console.log("📥 Behavior event received:", event);
      // TODO: save to DB / push to model / redis queue, v.v...
      const behavior = new UserBehavior(event);
      await behavior.save();

      console.log("✅ Saved to MongoDB");
    },
  });
};

module.exports = startConsumer;
