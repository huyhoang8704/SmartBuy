require("dotenv").config();
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: 'ecommerce-tracker',
  brokers: ['kafka:9092'],
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

const producer = kafka.producer();

const produceEvent = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic: "user-behavior",
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
};

module.exports = produceEvent;
