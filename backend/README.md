### Backend
```bash
cd backend
npm install
```

#### Cấu hình môi trường
Tạo file `.env` trong thư mục `backend` (nếu chưa có) và thêm các biến môi trường:
```
MONGO_URL=abc

JWT_SECRET=abc

TTL =120
# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Kafka
KAFKA_BROKER=kafka:9092
KAFKA_CLIENT_ID=ecommerce-tracker
KAFKA_TOPIC=user-behavior
KAFKA_GROUP_MONGO=group-mongo
KAFKA_GROUP_ANALYST=group-analyst
```

### Set up Kafka (dont care)
```
docker run -d --name zookeeper -e ZOOKEEPER_CLIENT_PORT=2181 -p 2181:2181 confluentinc/cp-zookeeper:latest
docker run -d --name kafka --link zookeeper:zookeeper -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 -e KAFKA_LISTENER_SECURITY_PROTOCOL=PLAINTEXT -e KAFKA_LISTENER_NAME=PLAINTEXT -e KAFKA_LISTENER_PORT=9092 -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -e KAFKA_BROKER_ID=1 -p 9092:9092 confluentinc/cp-kafka:latest

```
#### Chạy Backend khi có kafka
```bash
docker compose up --build
```

#### Chạy Backend
```bash
npm start
```
API sẽ chạy tại `http://localhost:4000`.

---


<!-- 
docker compose down --volumes --remove-orphans
docker compose up --build
docker exec -it redis-cache redis-cli
127.0.0.1:6379> KEYS *
1) "products:user:123:page:1:limit:15:sort:price:asc"
127.0.0.1:6379> GET "products:user:123:page:1:limit:15:sort:price:asc"


 -->
