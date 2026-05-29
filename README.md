# FashionShop

Hệ thống thương mại điện tử bán quần áo thời trang nam/nữ, xây dựng theo kiến trúc **API-first** với backend Laravel và hai frontend React riêng biệt.

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Tech Stack](#2-tech-stack)
3. [Tính năng](#3-tính-năng)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Cấu trúc thư mục](#5-cấu-trúc-thư-mục)
6. [Yêu cầu môi trường](#6-yêu-cầu-môi-trường)
7. [Cài đặt - Laragon (Local Dev)](#7-cài-đặt---laragon-local-dev)
8. [Cài đặt - Docker (Local)](#8-cài-đặt---docker-local)
9. [Biến môi trường](#9-biến-môi-trường)
10. [API Reference](#10-api-reference)
11. [CI/CD](#11-cicd)
12. [Postman Collection](#12-postman-collection)
13. [Database Schema](#13-database-schema)

---

## 1. Tổng quan

FashionShop gồm 3 ứng dụng độc lập giao tiếp qua REST API:

| Ứng dụng | Mô tả | Port mặc định |
|---|---|---|
| `fashionshop-api` | Laravel 11 REST API | `8000` |
| `fashionshop-web` | React — Storefront cho khách hàng | `5173` |
| `fashionshop-admin` | React — Dashboard quản trị viên | `5174` |

---

## 2. Tech Stack

### Backend — `fashionshop-api`

| Thành phần | Công nghệ |
|---|---|
| Framework | Laravel 11 |
| Ngôn ngữ | PHP 8.3 |
| Auth | Laravel Sanctum (Bearer Token) |
| ORM | Eloquent |
| Database | MySQL 8 |
| File Storage | Laravel Storage (`storage/app/public`) |
| Testing | PHPUnit (SQLite in-memory) |
| Code Style | Laravel Pint |

### Frontend — `fashionshop-web` & `fashionshop-admin`

| Thành phần | Công nghệ |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router v7 |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| Form | React Hook Form + Zod |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Notifications | React Hot Toast |

### DevOps

| Thành phần | Công nghệ |
|---|---|
| CI | GitHub Actions |
| CD | Docker + Docker Compose |
| Web Server (container) | Nginx Alpine |

---

## 3. Tính năng

### Khách chưa đăng nhập (Guest)
- Xem trang chủ với các tab: Nổi Bật, Bán Chạy, Khuyến Mãi
- Duyệt sản phẩm theo danh mục và giới tính (Nam/Nữ)
- Tìm kiếm sản phẩm theo tên
- Xem chi tiết sản phẩm và đánh giá
- Đăng ký tài khoản, đăng nhập
- Gửi form liên hệ

### Khách hàng đã đăng nhập (User)
- Thêm sản phẩm vào giỏ (chọn size S/M/L/XL, số lượng)
- Quản lý giỏ hàng (cập nhật số lượng, xóa)
- Đặt hàng với phương thức COD (phí ship 30.000đ)
- Xem lịch sử và chi tiết đơn hàng
- Hủy đơn hàng khi còn trạng thái "Chờ xử lý"
- Viết đánh giá sản phẩm (1–5 sao + bình luận)
- Quản lý địa chỉ giao hàng (thêm, xóa, đặt mặc định)
- Xem và cập nhật hồ sơ cá nhân, đổi mật khẩu

### Quản trị viên (Admin)
- Dashboard thống kê (doanh thu, tổng đơn, tổng khách hàng)
- Quản lý sản phẩm: CRUD đầy đủ + upload ảnh (MIME validate, max 5MB)
- Quản lý đơn hàng: xem danh sách, chi tiết, cập nhật trạng thái
- Quản lý người dùng: xem danh sách và chi tiết
- Quản lý đánh giá: phản hồi hoặc xóa
- Quản lý liên hệ: xem và cập nhật trạng thái (new / read / resolved)

---

## 4. Kiến trúc hệ thống

```
┌──────────────────────────┐     ┌──────────────────────────┐
│   fashionshop-web        │     │   fashionshop-admin       │
│   React (Storefront)     │     │   React (Dashboard)       │
│   :5173                  │     │   :5174                   │
└─────────────┬────────────┘     └────────────┬─────────────┘
              │  HTTP + Bearer Token           │
              └──────────────┬─────────────────┘
                             │
              ┌──────────────▼─────────────────┐
              │        fashionshop-api          │
              │   Laravel 11 REST API :8000     │
              │   /api/v1/...                   │
              └──────────────┬─────────────────┘
                             │
              ┌──────────────▼─────────────────┐
              │     MySQL 8 (Clever Cloud)      │
              └─────────────────────────────────┘
```

**Luồng xác thực:**
1. Client gửi `POST /api/v1/login` với email + password
2. API trả về Bearer token
3. Client lưu token (localStorage) và gửi kèm mọi request: `Authorization: Bearer {token}`
4. API verify token qua Laravel Sanctum
5. Middleware `IsAdmin` kiểm tra thêm role cho route admin

---

## 5. Cấu trúc thư mục

```
Fashion-Shop/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI
├── fashionshop-api/                # Laravel 11 Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   ├── Admin/
│   │   │   │   │   │   ├── ContactController.php
│   │   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   │   ├── OrderController.php
│   │   │   │   │   │   ├── ProductController.php
│   │   │   │   │   │   ├── ReviewController.php
│   │   │   │   │   │   └── UserController.php
│   │   │   │   │   ├── AdminAuthController.php
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── CartController.php
│   │   │   │   │   ├── CategoryController.php
│   │   │   │   │   ├── ContactController.php
│   │   │   │   │   ├── OrderController.php
│   │   │   │   │   ├── ProductController.php
│   │   │   │   │   ├── ProfileController.php
│   │   │   │   │   ├── ReviewController.php
│   │   │   │   │   └── UserAddressController.php
│   │   │   └── Middleware/
│   │   │       └── IsAdmin.php
│   │   └── Models/
│   │       ├── Admin.php
│   │       ├── Cart.php
│   │       ├── Category.php
│   │       ├── Contact.php
│   │       ├── Order.php
│   │       ├── OrderDetail.php
│   │       ├── Product.php
│   │       ├── Review.php
│   │       ├── User.php
│   │       └── UserAddress.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   ├── storage/app/public/products/ # Ảnh sản phẩm
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── phpunit.xml
│
├── fashionshop-web/                # React Storefront
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js            # Axios instance + interceptors
│   │   │   ├── authApi.js
│   │   │   ├── cartApi.js
│   │   │   ├── orderApi.js
│   │   │   ├── productApi.js
│   │   │   ├── reviewApi.js
│   │   │   ├── addressApi.js
│   │   │   ├── profileApi.js
│   │   │   └── contactApi.js
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Footer.jsx
│   │   │   └── ui/
│   │   │       ├── ProductCard.jsx
│   │   │       ├── StarRating.jsx
│   │   │       ├── SaleBadge.jsx
│   │   │       ├── StatusBadge.jsx
│   │   │       └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Category.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Address.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── stores/
│   │   │   ├── authStore.js        # Zustand: token, user
│   │   │   └── cartStore.js        # Zustand: cart item count
│   │   └── utils/
│   │       ├── constants.js        # SIZES, SHIPPING_FEE, ORDER_STATUS, GENDER_MAP
│   │       └── formatCurrency.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── fashionshop-admin/              # React Admin Dashboard
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js            # Axios instance admin + interceptors
│   │   │   ├── authApi.js
│   │   │   ├── productApi.js
│   │   │   ├── categoryApi.js
│   │   │   ├── orderApi.js
│   │   │   ├── userApi.js
│   │   │   ├── reviewApi.js
│   │   │   ├── contactApi.js
│   │   │   └── dashboardApi.js
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── ui/
│   │   │       ├── Pagination.jsx
│   │   │       ├── Spinner.jsx
│   │   │       └── StatusBadge.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Reviews.jsx
│   │   │   └── Contacts.jsx
│   │   └── stores/
│   │       └── authStore.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── postman/
│   └── FashionShop_Collection.postman_collection.json
├── docker-compose.yml
└── README.md
```

---

## 6. Yêu cầu môi trường

### Chạy với Laragon (khuyến nghị cho dev)

| Công cụ | Phiên bản tối thiểu |
|---|---|
| PHP | 8.2+ |
| Composer | 2.x |
| Node.js | 18+ |
| npm | 9+ |
| MySQL | 8.0 |

> **Laragon** tích hợp sẵn PHP, MySQL, Apache. Tải tại [laragon.org](https://laragon.org/download/)

### Chạy với Docker

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Docker Desktop | 4.x |
| Docker Compose | v2 |

---

## 7. Cài đặt - Laragon (Local Dev)

### Bước 1 — Clone project

```bash
git clone <your-repo-url> Fashion-Shop
cd Fashion-Shop
```

### Bước 2 — Cài đặt API

```bash
cd fashionshop-api

# Cài dependencies PHP
composer install

# Tạo file .env từ mẫu
cp .env.example .env

# Tạo APP_KEY
php artisan key:generate
```

Cập nhật `.env` với thông tin database của bạn (xem [Biến môi trường](#9-biến-môi-trường)).

```bash
# Tạo symlink để serve ảnh upload
php artisan storage:link

# Chạy migration
php artisan migrate

# (Tuỳ chọn) Seed dữ liệu mẫu
php artisan db:seed

# Khởi động server API tại http://127.0.0.1:8000
php artisan serve
```

### Bước 3 — Cài đặt Web (Storefront)

Mở terminal mới:

```bash
cd fashionshop-web
npm install
npm run dev
# Truy cập: http://localhost:5173
```

### Bước 4 — Cài đặt Admin Dashboard

Mở terminal mới:

```bash
cd fashionshop-admin
npm install
npm run dev
# Truy cập: http://localhost:5174
```

### Kiểm tra

| URL | Ứng dụng |
|---|---|
| `http://127.0.0.1:8000/api/v1/products` | API — danh sách sản phẩm |
| `http://localhost:5173` | Storefront |
| `http://localhost:5174` | Admin Dashboard |

---

## 8. Cài đặt - Docker (Local)

Docker Compose sẽ build và chạy cả 3 service cùng lúc. Đảm bảo file `fashionshop-api/.env` đã được cấu hình đúng trước khi chạy.

### Lần đầu (build image)

```bash
cd Fashion-Shop

docker-compose up --build
```

Quá trình build lần đầu khoảng 3–5 phút. Container API sẽ tự động:
- Chạy `php artisan storage:link`
- Chạy `php artisan migrate --force`
- Khởi động server tại `0.0.0.0:8000`

### Chạy nền

```bash
docker-compose up --build -d
```

### Các lần sau (không thay đổi code)

```bash
docker-compose up -d
```

### Tắt

```bash
docker-compose down
```

### Xóa toàn bộ (kể cả volume ảnh)

```bash
docker-compose down -v
```

### URL sau khi chạy Docker

| URL | Ứng dụng |
|---|---|
| `http://localhost:8000` | API |
| `http://localhost:5173` | Storefront |
| `http://localhost:5174` | Admin Dashboard |

> **Lưu ý:** Ảnh upload được lưu trong Docker volume `api_storage` — không bị mất khi rebuild container. Chỉ mất khi chạy `docker-compose down -v`.

---

## 9. Biến môi trường

### `fashionshop-api/.env`

```env
APP_NAME=FashionShop
APP_ENV=local
APP_KEY=                        # Tự động tạo bằng: php artisan key:generate
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000   # Quan trọng: ảnh URL dùng APP_URL

DB_CONNECTION=mysql
DB_HOST=127.0.0.1               # Hoặc host Clever Cloud của bạn
DB_PORT=3306
DB_DATABASE=fashionshop
DB_USERNAME=root
DB_PASSWORD=

FILESYSTEM_DISK=local
```

> **Quan trọng:** `APP_URL` phải đúng với địa chỉ bạn chạy API. Nếu dùng `php artisan serve` thì là `http://127.0.0.1:8000`. Nếu dùng Docker thì là `http://localhost:8000`.

### `fashionshop-admin/src/api/axios.js`

```js
baseURL: "http://127.0.0.1:8000/api/v1/admin"
```

### `fashionshop-admin/src/utils/constants.js`

```js
export const IMG_BASE = "http://127.0.0.1:8000/storage/";
```

### `fashionshop-web/src/api/axios.js`

```js
baseURL: "http://127.0.0.1:8000/api/v1"
```

---

## 10. API Reference

**Base URL:** `http://127.0.0.1:8000/api/v1`

**Auth header:** `Authorization: Bearer {token}`

**Format:** `application/json`

---

### Auth — User

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| `POST` | `/register` | — | Đăng ký tài khoản |
| `POST` | `/login` | — | Đăng nhập |
| `POST` | `/logout` | ✅ | Đăng xuất |

**POST `/register`**
```json
{
  "fullname": "Nguyễn Văn A",
  "email": "user@gmail.com",
  "phone": "0912345678",
  "gender": "Nam",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**POST `/login`**
```json
{
  "email": "user@gmail.com",
  "password": "password123"
}
```
Response:
```json
{
  "message": "Đăng nhập thành công",
  "user": { "id": 1, "fullname": "...", "email": "..." },
  "token": "1|abc123..."
}
```

---

### Auth — Admin

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| `POST` | `/admin/login` | — | Đăng nhập admin |
| `POST` | `/admin/logout` | ✅ Admin | Đăng xuất admin |

---

### Products (Public)

| Method | Endpoint | Query Params | Mô tả |
|---|---|---|---|
| `GET` | `/products` | `page`, `keyword`, `category_id`, `gender` | Danh sách sản phẩm (phân trang 10/trang) |
| `GET` | `/products/{id}` | — | Chi tiết sản phẩm |

**GET `/products` Response:**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "ten_sp": "Áo Polo Nam",
      "gia": 250000,
      "gia_cu": 300000,
      "so_luong": 50,
      "gioi_tinh": 1,
      "hinh_anh": "products/abc.jpg",
      "category": { "id": 1, "ten_danh_muc": "Áo Polo" }
    }
  ],
  "total": 45,
  "per_page": 10
}
```

---

### Categories (Public)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/categories` | Danh sách tất cả danh mục |

---

### Reviews (Public + Auth)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| `GET` | `/products/{id}/reviews` | — | Xem đánh giá của sản phẩm |
| `POST` | `/products/{id}/reviews` | ✅ | Viết đánh giá |

**POST `/products/{id}/reviews`**
```json
{
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}
```

---

### Contacts (Public)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/contacts` | Gửi form liên hệ |

```json
{
  "fullname": "Nguyễn Khách",
  "email": "khach@gmail.com",
  "message": "Tôi muốn hỏi về sản phẩm"
}
```

---

### Profile (Auth — User)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/profile` | Xem thông tin cá nhân |
| `PUT` | `/profile` | Cập nhật thông tin |
| `PUT` | `/profile/password` | Đổi mật khẩu |

**PUT `/profile/password`**
```json
{
  "current_password": "matkhaucu",
  "password": "matkhaumoi",
  "password_confirmation": "matkhaumoi"
}
```

---

### Addresses (Auth — User)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/addresses` | Danh sách địa chỉ |
| `POST` | `/addresses` | Thêm địa chỉ mới |
| `DELETE` | `/addresses/{id}` | Xóa địa chỉ |
| `PATCH` | `/addresses/{id}/default` | Đặt làm địa chỉ mặc định |

**POST `/addresses`**
```json
{
  "fullname": "Nguyễn Văn A",
  "phone": "0912345678",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

---

### Cart (Auth — User)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/cart` | Xem giỏ hàng |
| `POST` | `/cart` | Thêm sản phẩm vào giỏ |
| `PATCH` | `/cart/{id}` | Cập nhật số lượng |
| `DELETE` | `/cart/{id}` | Xóa khỏi giỏ |

**POST `/cart`**
```json
{
  "product_id": 1,
  "quantity": 2,
  "size": "M"
}
```

---

### Orders (Auth — User)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/orders` | Lịch sử đơn hàng |
| `POST` | `/orders` | Đặt hàng (từ giỏ hàng hiện tại) |
| `GET` | `/orders/{id}` | Chi tiết đơn hàng |
| `PATCH` | `/orders/{id}/cancel` | Hủy đơn (chỉ khi status=pending) |

**POST `/orders`**
```json
{
  "fullname": "Nguyễn Văn A",
  "phone": "0912345678",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "payment": "COD"
}
```

> Phí ship cộng tự động: **30.000đ**. Giỏ hàng sẽ bị xóa sau khi đặt hàng thành công.

---

### Admin — Dashboard

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/dashboard` | Thống kê tổng quan |

---

### Admin — Products

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/products` | Danh sách sản phẩm (page, keyword) |
| `POST` | `/admin/products` | Thêm sản phẩm (`multipart/form-data`) |
| `POST` | `/admin/products/{id}` | Cập nhật sản phẩm (`multipart/form-data`) |
| `DELETE` | `/admin/products/{id}` | Xóa sản phẩm |

> **Lưu ý:** Cập nhật sản phẩm dùng `POST` thay vì `PUT` vì PHP không hỗ trợ `multipart/form-data` với `PUT`.

**Form-data fields khi thêm/sửa sản phẩm:**

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `ten_sp` | string | ✅ | Tên sản phẩm |
| `gia` | integer | ✅ | Giá bán (VNĐ) |
| `gia_cu` | integer | — | Giá cũ (để hiển thị giảm giá) |
| `mo_ta` | string | — | Mô tả sản phẩm |
| `so_luong` | integer | ✅ | Số lượng tồn kho |
| `gioi_tinh` | `0` hoặc `1` | ✅ | `1`=Nam, `0`=Nữ |
| `category_id` | integer | — | ID danh mục |
| `hinh_anh` | file | — | Ảnh (jpg/jpeg/png/webp, max 5MB) |

---

### Admin — Orders

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/orders` | Danh sách đơn hàng |
| `GET` | `/admin/orders/{id}` | Chi tiết đơn hàng |
| `PATCH` | `/admin/orders/{id}/status` | Cập nhật trạng thái |

**PATCH `/admin/orders/{id}/status`**
```json
{
  "status": "shipping"
}
```

Các giá trị status hợp lệ: `pending` → `shipping` → `completed` / `cancelled`

---

### Admin — Users

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/users` | Danh sách người dùng |
| `GET` | `/admin/users/{id}` | Chi tiết người dùng |

---

### Admin — Reviews

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/reviews` | Danh sách đánh giá |
| `PATCH` | `/admin/reviews/{id}/reply` | Phản hồi đánh giá |
| `DELETE` | `/admin/reviews/{id}` | Xóa đánh giá |

**PATCH `/admin/reviews/{id}/reply`**
```json
{
  "reply": "Cảm ơn bạn đã đánh giá sản phẩm!"
}
```

---

### Admin — Contacts

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/contacts` | Danh sách liên hệ |
| `PATCH` | `/admin/contacts/{id}/status` | Cập nhật trạng thái |

**PATCH `/admin/contacts/{id}/status`**
```json
{
  "status": "read"
}
```

Các giá trị: `new` / `read` / `resolved`

---

### HTTP Status Codes

| Code | Ý nghĩa |
|---|---|
| `200` | Thành công |
| `201` | Tạo mới thành công |
| `400` | Request không hợp lệ (vd: giỏ hàng trống) |
| `401` | Chưa xác thực (thiếu/sai token) |
| `403` | Không có quyền (user vào route admin) |
| `404` | Không tìm thấy resource |
| `422` | Validation thất bại |
| `500` | Lỗi server |

---

## 11. CI/CD

### CI — GitHub Actions

File: `.github/workflows/ci.yml`

Tự động chạy khi **push lên `main`/`develop`** hoặc **mở Pull Request vào `main`**.

**3 job chạy song song:**

| Job | Bước |
|---|---|
| `api` (PHP 8.3) | `composer install` → copy `.env.example` → `key:generate` → `php artisan test` (SQLite) |
| `admin` (Node 20) | `npm ci` → `npm run build` |
| `web` (Node 20) | `npm ci` → `npm run lint` → `npm run build` |

Xem kết quả CI tại tab **Actions** trên GitHub repository.

---

### CD — Docker (Local)

Không có auto-deploy lên VPS. Toàn bộ CD chạy trên máy local qua Docker Compose.

**Quy trình phát triển:**

```
code → git push → GitHub Actions CI (pass) → docker-compose up --build (local)
```

**Các file Docker:**

| File | Mô tả |
|---|---|
| `docker-compose.yml` | Orchestrate 3 services |
| `fashionshop-api/Dockerfile` | PHP 8.3 CLI Alpine + Composer |
| `fashionshop-api/docker-entrypoint.sh` | Chạy migrate + storage:link khi start |
| `fashionshop-admin/Dockerfile` | Multi-stage: Node build → Nginx serve |
| `fashionshop-admin/nginx.conf` | Nginx config cho React SPA |
| `fashionshop-web/Dockerfile` | Multi-stage: Node build → Nginx serve |
| `fashionshop-web/nginx.conf` | Nginx config cho React SPA |

---

## 12. Postman Collection

File: `postman/FashionShop_Collection.postman_collection.json`

**Import vào Postman Desktop:**

1. Mở Postman → nhấn **Import**
2. Kéo thả file `FashionShop_Collection.postman_collection.json`
3. Nhấn **Import**

**Collection gồm 10 nhóm request với test tự động:**

| Nhóm | Số request |
|---|---|
| Auth - User (Register, Login, Logout) | 4 |
| Auth - Admin | 2 |
| Products (Public) | 4 |
| Categories | 1 |
| Reviews | 2 |
| Contacts | 1 |
| Profile | 3 |
| Addresses | 4 |
| Cart | 4 |
| Orders | 4 |
| Admin - Dashboard | 1 |
| Admin - Products | 4 |
| Admin - Orders | 3 |
| Admin - Users | 2 |
| Admin - Reviews | 3 |
| Admin - Contacts | 2 |
| Bảo mật | 2 |

**Tính năng tự động:**
- Login/Register → token tự lưu vào `{{user_token}}`
- Admin Login → token tự lưu vào `{{admin_token}}`
- Tất cả request sau tự dùng token, không cần điền tay
- ID (product, order, cart...) tự lưu từ response trước sang request sau

**Chạy toàn bộ collection:**

`Chuột phải vào "FashionShop API"` → `Run collection` → `Run FashionShop API`

---

## 13. Database Schema

10 bảng chính:

```
admin
├── id, fullname, email, phone, password (bcrypt), created_at

users
├── id, fullname, email, phone, gender (Nam/Nữ), password (bcrypt), created_at

user_addresses
├── id, user_id (FK), fullname, phone, address, is_default, created_at

categories
├── id, ten_danh_muc

products
├── id, ten_sp, gia, gia_cu, mo_ta, so_luong
├── gioi_tinh (1=Nam, 0=Nữ), category_id (FK)
├── hinh_anh (path: "products/filename.jpg")
├── created_at, updated_at

cart
├── id, user_id (FK), product_id (FK), quantity, size, created_at

orders
├── id, user_id (FK), fullname, phone, address
├── payment (COD), total, status
├── status: pending | shipping | completed | cancelled
├── created_at, updated_at

order_details
├── id, order_id (FK), product_id (FK)
├── quantity, price (snapshot lúc đặt), size

reviews
├── id, product_id (FK), user_id (FK)
├── rating (1-5), comment, shop_reply (nullable)
├── created_at

contacts
├── id, fullname, email, message
├── status: new | read | resolved
├── created_at
```

**Ảnh sản phẩm:**
- Lưu tại: `fashionshop-api/storage/app/public/products/`
- Truy cập qua URL: `http://127.0.0.1:8000/storage/products/{filename}`
- Cột `hinh_anh` trong bảng `products` lưu path dạng: `products/abc123.jpg`
- Yêu cầu chạy `php artisan storage:link` để tạo symlink

---

*Được xây dựng với Laravel 11 + React 19*
