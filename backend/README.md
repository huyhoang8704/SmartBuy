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
### Tải redis trên docker
```
docker run -d --name redis-container -p 6379:6379 redis
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



### Test redis Docker
```
docker exec -it redis-container redis-cli
KEYS userBehavior:*
```