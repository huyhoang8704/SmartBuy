
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, when, to_timestamp, current_timestamp, window
from pyspark.sql.types import StructType, StringType
from pymongo import MongoClient
import pickle
import numpy as np

# 1. Tạo SparkSession kết nối MongoDB Atlas
spark = SparkSession.builder \
    .appName("KafkaToMongoPreprocessing") \
    .config("spark.mongodb.output.uri", "mongodb+srv://huyhoang8704:huyhoang8704@cluster0.zpf0zj3.mongodb.net/ecommerce.processed_behavior?retryWrites=true&w=majority&appName=Cluster0") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

# 2. Định nghĩa schema JSON
schema = StructType() \
    .add("userId", StringType()) \
    .add("productId", StringType()) \
    .add("action", StringType()) \
    .add("timestamp", StringType())

# 3. Đọc dữ liệu từ Kafka
df_raw = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "user-behavior") \
    .option("startingOffsets", "latest") \
    .load()

# 4. Parse JSON và chuẩn hóa
df_parsed = df_raw.selectExpr("CAST(value AS STRING)") \
    .select(from_json(col("value"), schema).alias("data")) \
    .select("data.*") \
    .withColumnRenamed("userId", "visitorid") \
    .withColumnRenamed("productId", "itemid")

# 5. Convert timestamp
df_parsed = df_parsed.withColumn("event_time", to_timestamp(col("timestamp")))

# 6. Gán điểm hành vi
df_scored = df_parsed.withColumn(
    "score",
    when(col("action") == "transaction", 5)
    .when(col("action") == "addtocart", 3)
    .when(col("action") == "view", 2)
    .when(col("action") == "click", 1)
    .otherwise(0)
)

# 7. Tổng hợp điểm theo user + item
df_grouped = df_scored \
    .withWatermark("event_time", "1 minute") \
    .groupBy("visitorid", "itemid") \
    .sum("score") \
    .withColumnRenamed("sum(score)", "score") \
    .withColumn("timestamp", current_timestamp())

def write_to_mongo(batch_df, batch_id):
    count = batch_df.count()
    if count > 0:
        print(f" Batch {batch_id}: writing {count} rows to processed_behavior")
    batch_df.write \
        .format("mongo") \
        .option("spark.mongodb.connection.uri", "mongodb+srv://huyhoang8704:huyhoang8704@cluster0.zpf0zj3.mongodb.net/ecommerce.processed_behavior?retryWrites=true&w=majority&appName=Cluster0") \
        .option("spark.mongodb.database", "ecommerce") \
        .option("spark.mongodb.collection", "processed_behavior") \
        .mode("append") \
        .save()

df_grouped.writeStream \
    .foreachBatch(write_to_mongo) \
    .outputMode("update") \
    .option("checkpointLocation", "/tmp/spark-checkpoint") \
    .start()


# 8. Load mô hình LightFM và các encoder
try:
    with open("lightfm_model.pkl", "rb") as f:
        saved = pickle.load(f)
    model = saved["model"]
    user_enc = saved["user_enc"]
    item_enc = saved["item_enc"]
    item_features = saved["item_features"]
    print("LightFM model loaded")
except Exception as e:
    print(f"Failed to load LightFM model: {e}")
    model = None

# 9. Hàm dự đoán
def recommend_top_k(raw_user, k=5):
    if model is None or raw_user not in user_enc.classes_:
        return []
    uid = user_enc.transform([raw_user])[0]
    scores = model.predict(np.full(item_features.shape[0], uid), np.arange(item_features.shape[0]), item_features=item_features)
    top_items = np.argsort(-scores)[:k]
    return item_enc.inverse_transform(top_items).tolist()

# 10. Tìm user hoạt động gần đây (1 phút)
df_active_users = df_scored \
    .withWatermark("event_time", "1 minute") \
    .groupBy(
        window(col("event_time"), "1 minute"),
        col("visitorid")
    ).count().select("visitorid")

def predict_and_store(batch_df, batch_id):
    users = list(set(row["visitorid"] for row in batch_df.collect()))
    print(f" Batch {batch_id}: users to predict = {users}")
    if not users:
        return

    client = MongoClient("mongodb+srv://huyhoang8704:huyhoang8704@cluster0.zpf0zj3.mongodb.net/ecommerce.processed_behavior?retryWrites=true&w=majority&appName=Cluster0")
    db = client["ecommerce"]
    coll = db["recommendations"]

    docs = []
    for uid in users:
        recs = recommend_top_k(uid)
        if recs:
            docs.append({"visitorid": uid, "recommended": recs})
            print(f" {uid} => {recs}")

    if docs:
        try:
            coll.insert_many(docs)
            print(f"Stored recommendations for {len(docs)} users")
        except Exception as e:
            print(f"Failed to insert into MongoDB: {e}")
    client.close()

df_active_users.writeStream \
    .foreachBatch(predict_and_store) \
    .outputMode("update") \
    .trigger(processingTime="30 seconds") \
    .option("checkpointLocation", "/tmp/recommend-checkpoint") \
    .start() \


# 11. Chạy Spark Streaming
spark.streams.awaitAnyTermination()
