const kafka = require("./kafkaClient");

const producer = kafka.producer();

const produceEvent = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
};

module.exports = produceEvent;


// ? Example
// const produceEvent = require("./kafka/producer");

// await produceEvent("user-behavior", {
//   userId: "u123",
//   action: "click",
//   productId: "p456",
//   timestamp: Date.now(),
// });
