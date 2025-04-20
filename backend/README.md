### Backend
```bash
cd backend
npm install
```

#### Cấu hình môi trường
Tạo file `.env` trong thư mục `backend` (nếu chưa có) và thêm các biến môi trường:
```
MONGO_URL=<MongoDB Connection String>
JWT_SECRET=<Your JWT Secret>
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
 -->
