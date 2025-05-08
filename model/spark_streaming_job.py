from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, unix_timestamp, to_timestamp
from pyspark.sql.types import StructType, StringType, LongType
from pymongo import MongoClient
import requests
from bson import ObjectId
from datetime import timezone, datetime

# Khởi tạo Spark
spark = SparkSession.builder \
    .appName("KafkaStreamProcessor") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

# Schema cho sự kiện Kafka
schema = StructType().add("userId", StringType()) \
                     .add("productId", StringType()) \
                     .add("action", StringType()) \
                     .add("timestamp", StringType())

# Đọc stream từ Kafka
df = spark.readStream.format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "user-behavior") \
    .option("startingOffsets", "latest") \
    .load()

parsed = df.selectExpr("CAST(value AS STRING)") \
    .select(from_json(col("value"), schema).alias("data")) \
    .select("data.*")

parsed = parsed.withColumn(
    "parsed_timestamp",
    unix_timestamp(to_timestamp(col("timestamp")))*1000
)


# Ghi vào MongoDB
def write_to_mongo(batch_df, batch_id):
    count = batch_df.count()
    if count == 0:
        return

    records = batch_df.toPandas().to_dict("records")
    
    transformed = []
    for event in records:
        try:
            transformed.append({
                "_id": ObjectId(),  # Tạo ID mới
                "userId": ObjectId(event["userId"]),
                "productId": ObjectId(event["productId"]),
                "action": event["action"],
                "keyword": "",  # default nếu không có
                "timestamp": datetime.fromtimestamp(event["parsed_timestamp"] / 1000, tz=timezone.utc),
                "__v": 0
            })
        except Exception as e:
            print("Skipping invalid record:", event, "| Error:", e)

    if not transformed:
        return

    try:
        client = MongoClient("mongodb+srv://huyhoang8704:huyhoang8704@cluster0.zpf0zj3.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0")
        db = client["ecommerce"]
        db["user_behaviors"].insert_many(transformed)
        client.close()
        print(f"Inserted {len(transformed)} documents into MongoDB")
    except Exception as e:
        print("Failed to insert into MongoDB:", e)

    for event in records:
        try:
            response = requests.post("http://model:8000/log_event", json={
                "userId": event["userId"],
                "productId": event["productId"],
                "action": event["action"]
            }, timeout=1)
            print(f"POST /log_event: {response.status_code}")
        except Exception as e:
            print("Failed to send to /log_event:", e)

query = parsed.writeStream \
    .foreachBatch(write_to_mongo) \
    .outputMode("append") \
    .start()

query.awaitTermination()
