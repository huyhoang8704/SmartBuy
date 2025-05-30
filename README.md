<div style="display: flex; align-items: center; justify-content: center; color:#00B14F; font-weight: bold; font-size: 150%; margin-left: 20px;">
  <img src="frontend/public/Grab.svg" alt="Logo" width="40" style="margin-right: 10px; ">
  <span>Bootcamp Internship Programming</span>
</div>

# 🛒 E-commerce Recommendation System

This project is an intelligent recommendation system integrated into an e-commerce platform. It leverages user behavior, product data, and streaming pipelines to suggest relevant products in real time.


## ✅ Functional Requirements
- User Authentication
- Product Catalog
- Shopping Cart
- Order Management
- User Behavior Tracking from clickstream data
- Recommendation API

## ⚙️ Non-Functional Requirements

- **Scalability**: Horizontally scalable components (Kafka, backend, ML service).
- **Availablity**: 99.9% uptime across all core services
- **Low Latency**: Recommendation API responds within 300ms with cache; under 1s without cache.
- **Portability**: Entire system containerized using Docker.
- **Security**: API input sanitized; JWT for authentication.
- **Observability**: Logging, health checks, and performance monitoring integrated (future: Prometheus + Grafana).

## 1. Architecture
![alt text](Architecture.png)


## 2. Front-end <p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nuxtjs,tailwind" />
  </a>
</p>

#### Install dependencies
Vào thư mục `frontend`
```bash
cd frontend
```
Trong thư mục `frontend`, chạy lệnh sau:
```bash
npm install
```

#### Chạy server phát triển
Chạy lệnh sau trong thư mục `frontend`:
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`.

## 3. Backend <p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=expressjs,nodejs,mongodb,redis,kafka,nginx" />
  </a>
</p>



#### Cấu hình môi trường
Tạo file `.env` trong thư mục `backend` (nếu chưa có) và thêm các biến môi trường sau:
```env
MONGO_URL=mongodb://mongodb:27017/ecommerce
JWT_SECRET=your_jwt_secret
TTL=120

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

#### Chạy Backend và Model bằng Docker Compose
Vào thư mục `model`
```bash
cd model
```
Trong thư mục `model`, tạo thêm folder models để lưu model:
```bash
mkdir models
```


Chạy cả 2 server Backend và Model bên ngoài
```bash
docker-compose up --build
```

API sẽ chạy tại `http://localhost:4000`.

---

## 4. Devops <p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=docker,jenkins" />
  </a>
</p>


[📽️ Xem Video Demo tại đây](https://www.youtube.com/watch?v=dMUiVATeCpM)

## Scripts hữu ích

### Backend
- `docker-compose up --build`: Build và chạy backend với Docker Compose.
- `docker-compose down --volumes --remove-orphans`: Dừng và xóa các container backend.

### Frontend
- `npm run dev`: Chạy server phát triển Nuxt.
- `npm run build`: Build ứng dụng Nuxt cho production.
- `npm run preview`: Xem trước ứng dụng đã build.

---

## Ghi chú
- Đảm bảo Docker và Docker Compose đã được cài đặt trên máy.
- Nếu gặp lỗi, kiểm tra log của backend và frontend để tìm nguyên nhân.