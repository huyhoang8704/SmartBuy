// require("dotenv").config();
// const { Kafka } = require("kafkajs");
// const fs = require("fs");

// const kafka = new Kafka({ clientId: process.env.KAFKA_CLIENT_ID, brokers: [process.env.KAFKA_BROKER] });
// const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ANALYST });

// const startConsumerAnalyst = async () => {
//   await consumer.connect();
//   await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       const data = JSON.parse(message.value.toString());
//       // fs.appendFileSync("analyst-data.log", JSON.stringify(data) + "\n");
//       console.log("Analyst captured behavior:", data);
//     },
//   });
// };

// module.exports = startConsumerAnalyst;
