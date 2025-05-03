// require("dotenv").config();
// const { Kafka } = require("kafkajs");
// const axios = require("axios");

// const kafka = new Kafka({
//   clientId: process.env.KAFKA_CLIENT_ID,
//   brokers: [process.env.KAFKA_BROKER],
// });

// const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ALGOLIA });

// const buffer = [];
// const BATCH_SIZE = 100;
// const BATCH_TIMEOUT = 2000; // 2s
// let batchTimer;

// const saveBatchToAlgolia = async () => {
//   if (buffer.length === 0) return;

//   const events = buffer.map(event => {
//     let eventType = '';
//     let eventName = '';

//     switch (event.action) {
//         case 'view':
//             eventType = 'view';
//             eventName = 'Viewed Product';
//             break;
//         case 'addtocart':
//             eventType = 'click';
//             eventName = 'Added to Cart';
//             break;
//         case 'transaction':
//             eventType = 'conversion';
//             eventName = 'Completed Purchase';
//             break;
//         case 'search':
//             eventType = 'view'; // Algolia không support "search" riêng
//             eventName = 'Searched Product';
//             break;
//         default:
//             eventType = 'view';
//             eventName = 'Viewed Product';
//     }

//     return {
//         eventType,
//         eventName,
//         index: 'products',
//         userToken: event.userId.toString(),
//         objectIDs: event.productId ? [event.productId.toString()] : [],
//         timestamp: new Date(event.timestamp).getTime(),
//         ...(event.action === 'search' && event.keyword ? { queryID: event.keyword } : {})
//     };
// });


//   buffer.length = 0; // clear buffer

//   try {
//     const response = await axios.post('https://insights.algolia.io/1/events', 
//       { events },
//       {
//         headers: {
//           'X-Algolia-Application-Id': process.env.ALGOLIA_APP_ID,
//           'X-Algolia-API-Key': process.env.ALGOLIA_API_KEY_INSIGHTS,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
//     console.log(`✅ Pushed ${events.length} behaviors to Algolia Insights`);
//   } catch (error) {
//     console.error('❌ Error pushing batch to Algolia:', error.response?.data || error.message);
//   }
// };

// const startAlgoliaConsumer = async () => {
//   await consumer.connect();
//   await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       try {
//         const event = JSON.parse(message.value.toString());
//         console.log("📥 Behavior event received for Algolia:", event);

//         buffer.push(event);

//         if (buffer.length >= BATCH_SIZE) {
//           clearTimeout(batchTimer);
//           await saveBatchToAlgolia();
//         } else {
//           clearTimeout(batchTimer);
//           batchTimer = setTimeout(saveBatchToAlgolia, BATCH_TIMEOUT);
//         }
//       } catch (err) {
//         console.error("❌ Error processing message for Algolia:", err);
//       }
//     },
//   });
// };

// module.exports = startAlgoliaConsumer;
