from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, when, to_timestamp, current_timestamp
from pyspark.sql.types import StructType, StringType

# 1. Tạo Spark session có Kafka và MongoDB
spark = SparkSession.builder \
    .appName("KafkaToMongoPreprocessing") \
    .config("spark.mongodb.output.uri", "mongodb+srv://huyhoang8704:huyhoang8704@cluster0.zpf0zj3.mongodb.net/ecommerce.processed_behavior") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

# 2. Định nghĩa schema đúng theo dữ liệu bạn gửi
schema = StructType() \
    .add("userId", StringType()) \
    .add("productId", StringType()) \
    .add("action", StringType()) \
    .add("timestamp", StringType())  # ISO format, e.g. "2025-04-21T10:08:16.030+00:00"

# 3. Đọc dữ liệu từ Kafka
df_raw = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "user-behavior") \
    .option("startingOffsets", "latest") \
    .load()

# 4. Parse JSON và chọn các cột cần thiết
df_parsed = df_raw.selectExpr("CAST(value AS STRING)") \
    .select(from_json(col("value"), schema).alias("data")) \
    .select("data.*") \
    .withColumnRenamed("userId", "visitorid") \
    .withColumnRenamed("productId", "itemid")

# 5. Chuyển timestamp ISO ➝ Spark TimestampType
df_parsed = df_parsed.withColumn("event_time", to_timestamp(col("timestamp")))

# 6. Ánh xạ điểm số từ hành vi
df_scored = df_parsed.withColumn(
    "score",
    when(col("action") == "transaction", 5)
    .when(col("action") == "addtocart", 3)
    .when(col("action") == "view", 2)
    .when(col("action") == "click", 1)
    .otherwise(0)
)

# 7. Group theo userId + productId + gộp score
df_grouped = df_scored \
    .withWatermark("event_time", "1 minute") \
    .groupBy("visitorid", "itemid") \
    .sum("score") \
    .withColumnRenamed("sum(score)", "score") \
    .withColumn("timestamp", current_timestamp()) 

# 8. Ghi kết quả vào MongoDB
def write_to_mongo(batch_df, batch_id):
    batch_df.write \
        .format("mongo") \
        .mode("append") \
        .save()

df_grouped.writeStream \
    .foreachBatch(write_to_mongo) \
    .outputMode("update") \
    .option("checkpointLocation", "/tmp/spark-checkpoint") \
    .start() \
    .awaitTermination()
