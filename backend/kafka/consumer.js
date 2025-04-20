const kafka = require("./kafkaClient");

const consumer = kafka.consumer({ groupId: "recommendation-group" });

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "user-behavior", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      console.log("📥 Behavior event received:abc", event);
      // TODO: save to DB / push to model / redis queue, v.v...
    },
  });
};

module.exports = startConsumer;
