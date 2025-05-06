const UserBehavior = require("../models/userBehaviorModel");
require("dotenv").config();
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: 'ecommerce-tracker',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'group-mongo' });

const buffer = [];
const BATCH_SIZE = 100; // số lượng event tối đa mỗi lần lưu
const BATCH_TIMEOUT = 2000; // thời gian tối đa (ms) nếu chưa đủ batch
let batchTimer;

const saveBatch = async () => {
  if (buffer.length === 0) return;

  const docs = [...buffer];
  buffer.length = 0; // clear buffer

  try {
    await UserBehavior.insertMany(docs, { ordered: false }); 
    console.log(`✅ Inserted ${docs.length} behaviors into MongoDB`);
  } catch (err) {
    console.error("❌ Error inserting batch into MongoDB:", err);
  }
};

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "user-behavior", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        console.log("📥 Behavior event received:", event);

        buffer.push(event);

        if (buffer.length >= BATCH_SIZE) {
          clearTimeout(batchTimer);
          await saveBatch();
        } else {
          clearTimeout(batchTimer);
          batchTimer = setTimeout(saveBatch, BATCH_TIMEOUT);
        }
      } catch (err) {
        console.error("❌ Error processing message:", err);
      }
    },
  });
};

module.exports = startConsumer;
