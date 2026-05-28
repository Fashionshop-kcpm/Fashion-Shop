# FashionShop — Tài Liệu Tái Cấu Trúc & AI Prompt
> Phân tích repo gốc · Yêu cầu hệ thống · Kiến trúc mới (React + Laravel) · Prompt phát triển

---

## 1. PHÂN TÍCH REPO GỐC

### 1.1 Tổng quan kỹ thuật hiện tại

| Hạng mục | Hiện trạng |
|---|---|
| Ngôn ngữ | PHP 8.0 thuần (monolithic, không framework) |
| Database | MySQL / MariaDB 10.4, kết nối qua `mysqli_*` |
| Frontend | PHP + HTML nhúng, CSS module, Vanilla JS |
| Triển khai | Docker + Apache, CI/CD chưa rõ ràng |
| Auth | Session PHP, **mật khẩu lưu plain-text** |
| API | Không có — form POST redirect truyền thống |

### 1.2 Cấu trúc file gốc

```
FashionShop/
├── config/
│   ├── database.php         # Credentials hardcode + env fallback
│   └── fashion.sql          # Schema + seed data (10 tables)
├── process/                 # Xử lý logic (auth, cart, order...)
├── admin/                   # Dashboard admin (PHP)
├── assets/                  # CSS, JS, images (23 MB ảnh)
├── includes/                # Header, footer, alert partial
├── *.php                    # Các trang: index, detail, cart...
├── Dockerfile
└── docker-compose.yml
```

### 1.3 Database Schema (10 bảng)

```
admin            id, fullname, email, phone, password, created_at
user             id, fullname, email, phone, gender, password, created_at
user_addresses   id, user_id, fullname, phone, address_details, is_default
categories       id, ten_danh_muc
products         id, ten_sp, gia, gia_cu, mo_ta, so_luong, gioi_tinh,
                 category_id, hinh_anh
cart             id, user_id, product_id, quantity, size
orders           id, user_id, fullname, phone, address, payment,
                 total, status, created_at
order_details    id, order_id, product_id, quantity, price, size
reviews          id, product_id, user_id, rating, comment,
                 shop_reply, created_at
contacts         id, fullname, email, message, status, created_at
```

### 1.4 Vấn đề bảo mật & kỹ thuật cần khắc phục

| # | Vấn đề | Mức độ | Giải pháp trong kiến trúc mới |
|---|---|---|---|
| 1 | **Mật khẩu plain-text** trong DB (admin & user) | 🔴 Nghiêm trọng | Dùng `bcrypt` qua Laravel Hash |
| 2 | **SQL Injection** — dùng string interpolation thay vì prepared statements | 🔴 Nghiêm trọng | Eloquent ORM / Query Builder của Laravel |
| 3 | **Credentials hardcode** trong `database.php` (host, user, pass lộ trên GitHub) | 🔴 Nghiêm trọng | `.env` + GitHub Secrets |
| 4 | **Không có CSRF protection** trên form POST | 🟠 Cao | Laravel Sanctum CSRF token |
| 5 | **XSS** — output không dùng `htmlspecialchars` | 🟠 Cao | React tự escape, Laravel `e()` |
| 6 | **File upload không validate** type/size ảnh sản phẩm | 🟠 Cao | Laravel Storage + MIME validation |
| 7 | **Không phân quyền rõ ràng** — admin/user cùng session | 🟡 Trung bình | JWT + Role-based middleware |
| 8 | **Mã lỗi SQL lộ ra client** (`die(mysqli_error(...))`) | 🟡 Trung bình | Exception Handler trả JSON chuẩn |
| 9 | **Không có rate limiting** cho login/register | 🟡 Trung bình | Laravel Throttle middleware |
| 10 | **Logic phí ship hardcode** (`+30000`) | 🟢 Thấp | Config DB hoặc biến môi trường |

---

## 2. YÊU CẦU HỆ THỐNG (REQUIREMENTS)

### 2.1 Actors

```
┌─────────────────────────────────────────────────────────────────┐
│                          HỆ THỐNG                               │
│                                                                 │
│   👤 GUEST          👥 USER (Đã đăng nhập)    🛡️ ADMIN          │
│   (Khách vãng lai)  (Khách hàng)              (Quản trị viên)   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.2 GUEST — Khách chưa đăng nhập

#### Chức năng được phép

| ID | Requirement |
|---|---|
| G-01 | Xem trang chủ: sản phẩm Nổi Bật, Bán Chạy, Khuyến Mãi |
| G-02 | Duyệt danh mục sản phẩm (Quần Tây, Jean, Kaki, Short, Polo, Sơ Mi, Khoác) |
| G-03 | Lọc sản phẩm theo giới tính (Nam / Nữ) và danh mục |
| G-04 | Tìm kiếm sản phẩm theo tên |
| G-05 | Xem trang chi tiết sản phẩm (hình ảnh, mô tả, giá, kích cỡ, đánh giá) |
| G-06 | Xem điểm rating trung bình và bình luận của sản phẩm |
| G-07 | Đăng ký tài khoản mới (họ tên, email, SĐT, giới tính, mật khẩu) |
| G-08 | Đăng nhập bằng email + mật khẩu |
| G-09 | Gửi form liên hệ (họ tên, email, nội dung) |

#### Chức năng bị chặn (redirect về login)

| ID | Requirement |
|---|---|
| G-10 | Thêm sản phẩm vào giỏ hàng → redirect login |
| G-11 | Mua ngay → redirect login |
| G-12 | Xem giỏ hàng → redirect login |
| G-13 | Tiến hành thanh toán → redirect login |
| G-14 | Xem lịch sử đơn hàng → redirect login |
| G-15 | Viết đánh giá sản phẩm → redirect login |

---

### 2.3 USER — Khách hàng đã đăng nhập

#### Tài khoản & Hồ sơ

| ID | Requirement |
|---|---|
| U-01 | Xem và cập nhật thông tin cá nhân (email, SĐT, giới tính) |
| U-02 | Đổi mật khẩu (nhập mật khẩu cũ, mật khẩu mới, xác nhận) |
| U-03 | Quản lý danh sách địa chỉ giao hàng (thêm, xóa, đặt mặc định) |
| U-04 | Đăng xuất |

#### Mua sắm

| ID | Requirement |
|---|---|
| U-05 | Tất cả quyền của GUEST (G-01 đến G-09) |
| U-06 | Thêm sản phẩm vào giỏ hàng với size và số lượng chọn sẵn |
| U-07 | Bấm "Mua ngay" — thêm vào giỏ rồi chuyển thẳng sang thanh toán |
| U-08 | Xem giỏ hàng: danh sách sản phẩm, size, số lượng, giá, tổng tiền |
| U-09 | Cập nhật số lượng sản phẩm trong giỏ |
| U-10 | Xóa một sản phẩm khỏi giỏ |
| U-11 | Xóa nhiều sản phẩm đã chọn khỏi giỏ |

#### Thanh toán & Đơn hàng

| ID | Requirement |
|---|---|
| U-12 | Điền thông tin giao hàng (họ tên, SĐT, địa chỉ) hoặc chọn từ địa chỉ đã lưu |
| U-13 | Chọn phương thức thanh toán: **Thanh toán khi nhận hàng (COD)** |
| U-14 | Xem tóm tắt đơn hàng trước khi xác nhận (sản phẩm, phí ship 30.000đ, tổng) |
| U-15 | Đặt hàng thành công → hiện trang xác nhận kèm mã đơn |
| U-16 | Xem danh sách toàn bộ đơn hàng đã đặt (mã, ngày, tổng, trạng thái) |
| U-17 | Xem chi tiết đơn hàng (từng sản phẩm, size, số lượng, giá) |
| U-18 | Hủy đơn hàng khi trạng thái còn **"Chờ xử lý"** |

#### Đánh giá

| ID | Requirement |
|---|---|
| U-19 | Viết đánh giá sản phẩm (1–5 sao + bình luận văn bản) |
| U-20 | Xem phản hồi của shop (shop_reply) trên bình luận của mình |

---

### 2.4 ADMIN — Quản trị viên

#### Dashboard

| ID | Requirement |
|---|---|
| A-01 | Xem tổng quan: tổng doanh thu (đơn "Hoàn thành"), tổng đơn hàng, tổng khách hàng |
| A-02 | Xem 7 đơn hàng mới nhất trên dashboard |
| A-03 | Cập nhật nhanh trạng thái đơn hàng ngay từ dashboard |

#### Quản lý Sản phẩm

| ID | Requirement |
|---|---|
| A-04 | Xem danh sách sản phẩm (tìm kiếm, phân trang) |
| A-05 | Thêm sản phẩm mới: tên, giá, giá cũ, mô tả, số lượng, giới tính, danh mục, ảnh |
| A-06 | Sửa thông tin sản phẩm |
| A-07 | Xóa sản phẩm |
| A-08 | Upload ảnh sản phẩm (validate MIME type, giới hạn dung lượng 5MB) |

#### Quản lý Danh mục

| ID | Requirement |
|---|---|
| A-09 | Thêm danh mục mới |
| A-10 | Sửa tên danh mục |
| A-11 | Xóa danh mục (chỉ khi không có sản phẩm liên kết) |

#### Quản lý Đơn hàng

| ID | Requirement |
|---|---|
| A-12 | Xem tất cả đơn hàng (lọc theo trạng thái, tìm theo mã/tên khách) |
| A-13 | Xem chi tiết đơn hàng |
| A-14 | Cập nhật trạng thái: Chờ xử lý → Đang giao → Hoàn thành / Đã hủy |

#### Quản lý Người dùng

| ID | Requirement |
|---|---|
| A-15 | Xem danh sách toàn bộ khách hàng |
| A-16 | Xem chi tiết thông tin khách hàng |

#### Quản lý Đánh giá

| ID | Requirement |
|---|---|
| A-17 | Xem tất cả đánh giá sản phẩm |
| A-18 | Phản hồi đánh giá (shop_reply) |
| A-19 | Xóa đánh giá vi phạm |

#### Quản lý Liên hệ

| ID | Requirement |
|---|---|
| A-20 | Xem danh sách tin nhắn liên hệ từ khách |
| A-21 | Đánh dấu trạng thái: new / read / resolved |

---

## 3. KIẾN TRÚC MỚI

### 3.1 Tổng quan

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│    ┌──────────────────────────────┐  ┌──────────────────────────┐   │
│    │   React App (Customer)       │  │   React App (Admin)      │   │
│    │   /shop  (port 3000)         │  │   /admin  (port 3001)    │   │
│    │   React 18 + Vite            │  │   React 18 + Vite        │   │
│    │   Tailwind CSS               │  │   Tailwind + shadcn/ui   │   │
│    │   React Query + Zustand      │  │   React Query + Zustand  │   │
│    └──────────────┬───────────────┘  └────────────┬─────────────┘   │
└───────────────────┼─────────────────────────────── ┼───────────────┘
                    │   HTTPS / JSON                  │
┌───────────────────▼─────────────────────────────── ▼───────────────┐
│                         API GATEWAY (Nginx)                         │
│                    api.fashionshop.com / :8000                      │
└─────────────────────────────┬───────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                  Laravel 11 Backend (REST API)                      │
│                                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│   │ Auth     │  │ Products │  │ Orders   │  │ Admin            │   │
│   │ Module   │  │ Module   │  │ Module   │  │ Module           │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                                     │
│   Laravel Sanctum (JWT-like SPA Auth)                               │
│   Eloquent ORM · Laravel Storage · Mail                             │
└─────────────────────────────┬───────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                         DATA LAYER                                  │
│   ┌─────────────────────┐    ┌────────────────────────────────┐     │
│   │   MySQL 8.0          │    │   Laravel Storage (images)     │     │
│   │   (fashionshop DB)   │    │   storage/app/public/products  │     │
│   └─────────────────────┘    └────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Cấu trúc thư mục

#### Backend — Laravel 11

```
fashionshop-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php       # login, register, logout, me
│   │   │   ├── Customer/
│   │   │   │   ├── ProductController.php    # index, show, search
│   │   │   │   ├── CategoryController.php   # index
│   │   │   │   ├── CartController.php       # index, store, update, destroy
│   │   │   │   ├── OrderController.php      # index, store, show, cancel
│   │   │   │   ├── ReviewController.php     # store
│   │   │   │   ├── AddressController.php    # index, store, update, destroy
│   │   │   │   ├── ProfileController.php    # show, update, changePassword
│   │   │   │   └── ContactController.php    # store
│   │   │   └── Admin/
│   │   │       ├── DashboardController.php  # stats, recentOrders
│   │   │       ├── ProductController.php    # CRUD + upload
│   │   │       ├── CategoryController.php   # CRUD
│   │   │       ├── OrderController.php      # index, show, updateStatus
│   │   │       ├── UserController.php       # index, show
│   │   │       ├── ReviewController.php     # index, reply, destroy
│   │   │       └── ContactController.php    # index, updateStatus
│   │   ├── Middleware/
│   │   │   ├── IsAdmin.php                  # role = admin check
│   │   │   └── IsUser.php                   # role = user check
│   │   └── Requests/                        # Form Requests (validation)
│   │       ├── Auth/
│   │       │   ├── LoginRequest.php
│   │       │   └── RegisterRequest.php
│   │       ├── Product/
│   │       │   └── StoreProductRequest.php
│   │       └── Order/
│   │           └── PlaceOrderRequest.php
│   ├── Models/
│   │   ├── Admin.php
│   │   ├── User.php
│   │   ├── Category.php
│   │   ├── Product.php
│   │   ├── Cart.php
│   │   ├── Order.php
│   │   ├── OrderDetail.php
│   │   ├── Review.php
│   │   ├── UserAddress.php
│   │   └── Contact.php
│   └── Services/                            # Business logic tách riêng
│       ├── OrderService.php
│       ├── CartService.php
│       └── ProductService.php
├── database/
│   ├── migrations/                          # Thay thế fashion.sql
│   └── seeders/
│       ├── AdminSeeder.php
│       ├── CategorySeeder.php
│       └── ProductSeeder.php
├── routes/
│   ├── api.php                              # /api/v1/...
│   └── channels.php
├── storage/app/public/products/             # Ảnh sản phẩm
├── .env.example
└── Dockerfile
```

#### Frontend — React (Customer)

```
fashionshop-web/
├── src/
│   ├── api/                                 # Axios instance + API calls
│   │   ├── axios.js
│   │   ├── authApi.js
│   │   ├── productApi.js
│   │   ├── cartApi.js
│   │   └── orderApi.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx                   # Nav + cart icon + auth state
│   │   │   └── Footer.jsx
│   │   ├── ui/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── StarRating.jsx
│   │   │   ├── SaleBadge.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   └── modals/
│   │       └── QuickViewModal.jsx
│   ├── pages/
│   │   ├── Home.jsx                         # Trang chủ (tabs: NB/BC/KM)
│   │   ├── Category.jsx                     # Lọc theo danh mục + giới tính
│   │   ├── ProductDetail.jsx                # Chi tiết SP + reviews
│   │   ├── Search.jsx                       # Kết quả tìm kiếm
│   │   ├── ShoppingCart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderSuccess.jsx
│   │   ├── OrderList.jsx                    # Lịch sử đơn hàng
│   │   ├── OrderDetail.jsx
│   │   ├── Profile.jsx                      # Hồ sơ + đổi mật khẩu
│   │   ├── Address.jsx                      # Địa chỉ giao hàng
│   │   ├── Contact.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── store/                               # Zustand stores
│   │   ├── authStore.js
│   │   └── cartStore.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useCart.js
│   ├── routes/
│   │   ├── PrivateRoute.jsx                 # Bảo vệ route cần đăng nhập
│   │   └── AppRouter.jsx
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   └── constants.js                     # STATUS_MAP, SIZES...
│   └── App.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
└── Dockerfile
```

#### Frontend — React (Admin)

```
fashionshop-admin/
├── src/
│   ├── api/
│   │   └── adminApi.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── AdminHeader.jsx
│   │   └── ui/
│   │       ├── StatCard.jsx
│   │       ├── StatusBadge.jsx
│   │       └── DataTable.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx                    # Stats + recent orders
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductForm.jsx              # Add / Edit
│   │   │   └── ProductDetail.jsx
│   │   ├── orders/
│   │   │   ├── OrderList.jsx
│   │   │   └── OrderDetail.jsx
│   │   ├── users/
│   │   │   └── UserList.jsx
│   │   ├── reviews/
│   │   │   └── ReviewList.jsx
│   │   └── contacts/
│   │       └── ContactList.jsx
│   ├── store/
│   │   └── adminAuthStore.js
│   └── App.jsx
└── Dockerfile
```

---

## 4. THIẾT KẾ API (REST)

### 4.1 Base URL & Convention

```
Base URL:   https://api.fashionshop.com/api/v1
Auth:       Bearer Token (Laravel Sanctum)
Format:     JSON (Content-Type: application/json)
Pagination: ?page=1&per_page=12
```

### 4.2 Auth Endpoints

```
POST   /auth/register          Đăng ký (guest)
POST   /auth/login             Đăng nhập (guest)
POST   /auth/logout            Đăng xuất (auth:sanctum)
GET    /auth/me                Thông tin user hiện tại
```

### 4.3 Product / Category (Public)

```
GET    /products               Danh sách SP (filter: category_id, gioi_tinh, search, tab)
GET    /products/{id}          Chi tiết SP + reviews
GET    /categories             Danh sách danh mục
GET    /products/search?q=...  Tìm kiếm
```

### 4.4 Cart (Cần auth — User)

```
GET    /cart                   Xem giỏ hàng của user hiện tại
POST   /cart                   Thêm sản phẩm { product_id, quantity, size }
PUT    /cart/{id}              Cập nhật số lượng { quantity }
DELETE /cart/{id}              Xóa 1 sản phẩm
DELETE /cart                   Xóa nhiều { ids: [...] }
```

### 4.5 Order (Cần auth — User)

```
GET    /orders                 Lịch sử đơn hàng
POST   /orders                 Đặt hàng { fullname, phone, address, payment_method }
GET    /orders/{id}            Chi tiết đơn hàng
PATCH  /orders/{id}/cancel     Hủy đơn (chỉ khi "Chờ xử lý")
```

### 4.6 Review (Cần auth — User)

```
POST   /reviews                Gửi đánh giá { product_id, rating, comment }
```

### 4.7 Profile & Address (Cần auth — User)

```
GET    /profile                Xem hồ sơ
PUT    /profile                Cập nhật thông tin
PUT    /profile/password       Đổi mật khẩu

GET    /addresses              Danh sách địa chỉ
POST   /addresses              Thêm địa chỉ
PUT    /addresses/{id}         Sửa địa chỉ
DELETE /addresses/{id}         Xóa địa chỉ
PATCH  /addresses/{id}/default Đặt mặc định
```

### 4.8 Contact (Public)

```
POST   /contacts               Gửi form liên hệ
```

### 4.9 Admin Endpoints (Cần auth — Admin role)

```
# Dashboard
GET    /admin/dashboard        Stats + recent orders

# Products
GET    /admin/products         Danh sách (search, filter, paginate)
POST   /admin/products         Thêm SP (multipart/form-data có ảnh)
GET    /admin/products/{id}    Chi tiết
PUT    /admin/products/{id}    Sửa SP
DELETE /admin/products/{id}    Xóa SP

# Categories
GET    /admin/categories
POST   /admin/categories
PUT    /admin/categories/{id}
DELETE /admin/categories/{id}

# Orders
GET    /admin/orders
GET    /admin/orders/{id}
PATCH  /admin/orders/{id}/status   { status: "Đang giao" }

# Users
GET    /admin/users
GET    /admin/users/{id}

# Reviews
GET    /admin/reviews
PATCH  /admin/reviews/{id}/reply   { shop_reply: "..." }
DELETE /admin/reviews/{id}

# Contacts
GET    /admin/contacts
PATCH  /admin/contacts/{id}/status { status: "read" }
```

### 4.10 Response Format chuẩn

```json
// ✅ Success
{
  "success": true,
  "data": { ... },
  "message": "Thành công"
}

// ✅ Paginated
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 12,
    "total": 58
  }
}

// ❌ Error
{
  "success": false,
  "message": "Email hoặc mật khẩu không chính xác",
  "errors": { "email": ["Email không hợp lệ"] }
}
```

---

## 5. DATABASE SCHEMA MỚI

> Cải tiến so với bản gốc: thêm `updated_at`, rename field tiếng Việt → tiếng Anh, thêm `deleted_at` (soft delete) cho products

```sql
-- Users (tách admin ra bảng riêng)
CREATE TABLE users (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  fullname     VARCHAR(100) NOT NULL,
  email        VARCHAR(100) UNIQUE NOT NULL,
  phone        VARCHAR(15),
  gender       TINYINT DEFAULT 1,           -- 1=Nam, 0=Nữ
  password     VARCHAR(255) NOT NULL,       -- bcrypt
  role         ENUM('user','admin') DEFAULT 'user',
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

-- User Addresses
CREATE TABLE user_addresses (
  id               BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id          BIGINT UNSIGNED NOT NULL,
  fullname         VARCHAR(100) NOT NULL,
  phone            VARCHAR(15) NOT NULL,
  address_details  TEXT NOT NULL,
  is_default       TINYINT DEFAULT 0,
  created_at       TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories
CREATE TABLE categories (
  id    BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name  VARCHAR(255) NOT NULL
);

-- Products
CREATE TABLE products (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(255) NOT NULL,
  price        INT NOT NULL,
  original_price INT DEFAULT 0,
  description  TEXT,
  stock        INT DEFAULT 0,
  gender       TINYINT DEFAULT 1,           -- 1=Nam, 0=Nữ
  category_id  BIGINT UNSIGNED NOT NULL,
  image        VARCHAR(255),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  deleted_at   TIMESTAMP NULL,              -- Soft delete
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Cart
CREATE TABLE carts (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  product_id  BIGINT UNSIGNED NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  size        VARCHAR(5) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE orders (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED,
  fullname        VARCHAR(100) NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  address         TEXT NOT NULL,
  payment_method  ENUM('cod','bank_transfer') DEFAULT 'cod',
  subtotal        INT NOT NULL,
  shipping_fee    INT NOT NULL DEFAULT 30000,
  total           INT NOT NULL,
  status          ENUM('pending','shipping','completed','cancelled')
                  DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON SET NULL
);

-- Order Details
CREATE TABLE order_details (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  order_id    BIGINT UNSIGNED NOT NULL,
  product_id  BIGINT UNSIGNED,
  name        VARCHAR(255) NOT NULL,        -- Snapshot tên SP lúc đặt
  price       INT NOT NULL,                 -- Snapshot giá lúc đặt
  quantity    INT NOT NULL,
  size        VARCHAR(5) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON SET NULL
);

-- Reviews
CREATE TABLE reviews (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  product_id  BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  shop_reply  TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contacts
CREATE TABLE contacts (
  id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  fullname   VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  status     ENUM('new','read','resolved') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. SECURITY CHECKLIST

| # | Bảo mật | Cách triển khai |
|---|---|---|
| ✅ | Mật khẩu hash | `Hash::make()` + `Hash::check()` (bcrypt) |
| ✅ | SQL Injection | Eloquent ORM / Query Builder với binding |
| ✅ | Auth | Laravel Sanctum + Bearer Token |
| ✅ | CORS | `config/cors.php` — chỉ cho phép domain frontend |
| ✅ | Rate Limiting | `throttle:6,1` cho login/register route |
| ✅ | Input Validation | Form Request classes |
| ✅ | File Upload | MIME check (`image/jpeg,image/png,image/webp`), max 5MB |
| ✅ | Role Authorization | `IsAdmin` middleware cho tất cả `/admin/*` |
| ✅ | XSS | React tự escape, Laravel `e()` khi cần |
| ✅ | Env secrets | `.env` không commit, `config/database.php` dùng `env()` |
| ✅ | HTTPS | Nginx reverse proxy với SSL |
| ✅ | Soft Delete | `SoftDeletes` trait trên Product |

---

## 7. AI DEVELOPMENT PROMPT

> Copy toàn bộ prompt dưới đây để dùng với Cursor / GitHub Copilot / Claude Code

---

### 7.1 BACKEND PROMPT (Laravel 11)

```
You are an expert Laravel 11 backend developer. Build a RESTful API for "FashionShop" — a Vietnamese fashion e-commerce platform.

## TECH STACK
- Laravel 11 (PHP 8.2+)
- MySQL 8.0
- Laravel Sanctum (SPA / Token authentication)
- Eloquent ORM
- Laravel Storage (for product image uploads)
- Laravel Throttle (rate limiting)

## PROJECT CONTEXT
FashionShop sells clothing (quần áo) for men and women.
Categories: Quần Tây, Quần Jean, Quần Kaki, Quần Short, Áo Polo, Áo Sơ Mi, Áo Khoác
Products have: name, price, original_price (for discount), description, stock, gender (1=male/0=female), category_id, image
Orders go through statuses: pending → shipping → completed / cancelled
Shipping fee is 30,000 VND flat rate (store in config/app.php)

## ACTORS & PERMISSIONS
Three actor types with different access:

1. GUEST (unauthenticated):
   - Can view products, categories, product detail with reviews
   - Can search products
   - Can register and login
   - Can submit contact form
   - Cannot access cart, orders, or write reviews

2. USER (authenticated, role='user'):
   - All guest permissions
   - Full cart CRUD (add/update/delete items with size selection)
   - Place orders (COD payment only)
   - View own order history and details
   - Cancel own orders (only when status='pending')
   - Write product reviews (rating 1-5 + comment text)
   - Manage delivery addresses (add/set default/delete)
   - Update profile and change password

3. ADMIN (authenticated, role='admin'):
   - Login via same /auth/login endpoint
   - Full CRUD on products and categories
   - View all orders, update order status
   - View all users
   - Reply to reviews or delete them
   - Manage contact messages (mark read/resolved)
   - View dashboard stats: total revenue (completed orders), total orders, total users

## DATABASE SCHEMA
Use these exact table names and columns (migrations required):
- users: id, fullname, email, phone, gender, password (bcrypt), role (enum: user/admin), timestamps
- user_addresses: id, user_id(FK), fullname, phone, address_details, is_default, created_at
- categories: id, name
- products: id, name, price, original_price, description, stock, gender, category_id(FK), image, timestamps, deleted_at (soft delete)
- carts: id, user_id(FK), product_id(FK), quantity, size, created_at
- orders: id, user_id(FK nullable), fullname, phone, address, payment_method (enum:cod), subtotal, shipping_fee, total, status (enum:pending/shipping/completed/cancelled), timestamps
- order_details: id, order_id(FK), product_id(FK nullable), name (snapshot), price (snapshot), quantity, size
- reviews: id, product_id(FK), user_id(FK), rating (1-5), comment, shop_reply (nullable), created_at
- contacts: id, fullname, email, message, status (enum:new/read/resolved), created_at

## API STRUCTURE
All routes prefixed with /api/v1

### Public routes (no auth):
POST   /auth/register
POST   /auth/login
GET    /products              (query params: category_id, gender, search, tab=[featured|bestseller|sale], page)
GET    /products/{id}
GET    /categories
POST   /contacts

### User routes (middleware: auth:sanctum, role=user):
GET|POST|PUT|DELETE  /cart, /cart/{id}
GET|POST             /orders, /orders/{id}
PATCH                /orders/{id}/cancel
POST                 /reviews
GET|PUT              /profile, /profile/password
GET|POST|PUT|DELETE|PATCH  /addresses, /addresses/{id}, /addresses/{id}/default
GET                  /auth/me
POST                 /auth/logout

### Admin routes (middleware: auth:sanctum, role=admin):
GET    /admin/dashboard
CRUD   /admin/products, /admin/categories, /admin/orders
GET    /admin/users, /admin/users/{id}
GET|PATCH|DELETE  /admin/reviews
GET|PATCH  /admin/contacts

## RESPONSE FORMAT
Always return JSON:
// Success: { "success": true, "data": {...}, "message": "..." }
// Paginated: { "success": true, "data": [...], "meta": { current_page, last_page, per_page, total } }
// Error: { "success": false, "message": "...", "errors": {...} }

## SECURITY REQUIREMENTS
- Passwords: always use Hash::make() and Hash::check() — NEVER store plain text
- Use Form Request classes for all input validation
- Admin routes: IsAdmin middleware (check user->role === 'admin')
- User routes: ensure users can only access their own cart/orders/addresses
- Product images: validate MIME (jpeg/png/webp), max 5MB, store in storage/app/public/products
- Rate limit login/register to 6 requests/minute per IP
- Enable CORS for frontend origins in config/cors.php

## VALIDATION RULES
Register: fullname required, email unique|email, phone digits:10, password min:8|regex:/[A-Z]/
Login: email required|email, password required
Product (admin): name required, price integer|min:0, stock integer|min:0, image file|mimes:jpeg,png,webp|max:5120
Order: fullname required, phone digits:10, address required, payment_method in:cod

## TASKS
1. Generate all migrations in the correct foreign-key order
2. Create Models with relationships (User hasMany Orders, Product belongsTo Category, etc.)
3. Create Form Request classes for validation
4. Create Controllers with proper authorization checks
5. Create IsAdmin and IsUser middleware
6. Register all routes in routes/api.php
7. Create seeders for admin user, categories, and sample products
8. Create OrderService.php that handles: get cart items → calculate totals → insert order → insert order_details → clear cart (in a DB transaction)

Start with the migrations and models, then move to routes and controllers.
```

---

### 7.2 FRONTEND CUSTOMER PROMPT (React)

```
You are an expert React 18 frontend developer. Build the customer-facing storefront for "FashionShop" — a Vietnamese fashion e-commerce platform.

## TECH STACK
- React 18 + Vite
- React Router v6
- Tailwind CSS v3
- Axios (API calls)
- TanStack Query v5 (React Query — server state)
- Zustand (client state: auth, cart count)
- React Hook Form + Zod (forms/validation)
- Lucide React (icons)

## API BASE URL
http://localhost:8000/api/v1
All authenticated requests include: Authorization: Bearer {token}

## ACTORS & PAGES
This app serves two actors:

### GUEST (not logged in):
- Can view all pages below EXCEPT cart, checkout, orders, profile, address
- Cart icon shows login prompt instead of count
- "Thêm Giỏ" / "Mua Ngay" buttons redirect to /login

### USER (logged in):
- Full access to all pages

## PAGES TO BUILD

### 1. Home (/):
- Hero section: full-width banner with "Khám Phá Ngay" button
- Service highlights: Miễn Phí Giao Hàng, Dịch Vụ 24/7, Bảo Hành, Hoàn Trả Tiền
- Featured categories: Thời Trang Nam / Thời Trang Nữ cards
- Tab section with 3 tabs: "Nổi Bật" | "Bán Chạy" | "Khuyến Mãi"
  Each tab shows product grid using GET /products?tab=featured|bestseller|sale

### 2. Category (/category):
- Sidebar: filter by category (GET /categories), filter by gender (Nam/Nữ)
- Product grid with pagination
- URL reflects active filters: /category?category_id=2&gender=1

### 3. Product Detail (/product/:id):
- Main image, product name, price (with original_price strikethrough + % discount badge)
- Size selector: S, M, L, XL (radio buttons)
- Quantity input
- "Thêm Giỏ" button → POST /cart (auth required)
- "Mua Ngay" button → POST /cart then navigate to /checkout (auth required)
- Star rating average (calculated from reviews)
- Reviews section: list of reviews with username, date, star rating, comment, shop_reply

### 4. Search (/search?q=):
- Uses GET /products?search=...
- Shows product grid

### 5. Shopping Cart (/cart) [auth required]:
- Table: image, name, size, price, quantity stepper, delete button
- Multi-select checkboxes + "Xóa đã chọn" button
- Order summary: subtotal, shipping (30,000đ fixed), total
- "Tiến hành thanh toán" button → /checkout

### 6. Checkout (/checkout) [auth required]:
- Delivery form: fullname, phone, address (or pick from saved addresses)
- Order summary (product list, shipping, total)
- Payment method: COD only (radio button pre-selected)
- "Đặt Hàng" submit button → POST /orders

### 7. Order Success (/order-success/:orderId):
- Confirmation message + order ID
- Link to view order detail

### 8. Order History (/orders) [auth required]:
- List of orders: ID, date, total, status badge
- Clickable rows → /orders/:id

### 9. Order Detail (/orders/:id) [auth required]:
- Product list with snapshot name/price/size/quantity
- Total breakdown
- Status badge: Chờ xử lý (yellow) | Đang giao (blue) | Hoàn thành (green) | Đã hủy (red)
- "Hủy đơn" button (visible only when status=pending)

### 10. Profile (/profile) [auth required]:
- View/edit: fullname (read-only), email, phone, gender
- Change password form: old password, new password, confirm

### 11. Address (/address) [auth required]:
- Address cards with default badge
- Add address form modal
- "Đặt mặc định" + delete buttons

### 12. Contact (/contact):
- Form: fullname, email, message → POST /contacts

### 13. Login (/login):
- Email + password form
- Link to /register

### 14. Register (/register):
- Lastname, firstname, email, phone, gender, password

## STATE MANAGEMENT
Zustand stores:
- authStore: { user, token, setAuth(user, token), logout() }
- cartStore: { count, setCount(n) }

React Query:
- useProducts(filters) — with caching + refetch on filter change
- useProduct(id) — product detail
- useCart() — cart items
- useOrders() — order history

## ROUTING
Protected routes (redirect /login if not auth):
  /cart, /checkout, /orders, /orders/:id, /profile, /address

## UI CONVENTIONS
- Language: Vietnamese
- Currency: format as "320.000đ" (use Intl.NumberFormat or custom util)
- Toast notifications for: add to cart success, order placed, errors
- Loading skeletons for product grids
- Empty state components for empty cart / no orders
- Mobile-responsive (flex/grid with Tailwind responsive prefixes)
- Status badge colors: pending=yellow, shipping=blue, completed=green, cancelled=red

## TASKS
1. Set up Vite + React + Tailwind + React Router
2. Create Axios instance with interceptors (attach token, handle 401)
3. Create Zustand stores (auth, cart)
4. Build reusable components: ProductCard, StarRating, SaleBadge, StatusBadge, LoadingSpinner
5. Build Header with: logo, nav links, search bar, cart icon with count badge, user menu
6. Build all 14 pages listed above
7. Implement PrivateRoute wrapper

Start with the project setup, then the Axios instance and stores, then the Header, then pages in this order: Home → Category → ProductDetail → Cart → Checkout → Orders.
```

---

### 7.3 FRONTEND ADMIN PROMPT (React)

```
You are an expert React 18 frontend developer. Build the admin dashboard for "FashionShop".

## TECH STACK
- React 18 + Vite
- React Router v6
- Tailwind CSS v3 + shadcn/ui (Table, Dialog, Badge, Input, Button components)
- Axios
- TanStack Query v5
- Recharts (for revenue chart on dashboard)
- React Hook Form + Zod

## API BASE URL
http://localhost:8000/api/v1/admin
All requests: Authorization: Bearer {token}

## LAYOUT
Sidebar navigation + top header (breadcrumb + admin name).

Sidebar links:
- Dashboard (chart icon)
- Sản phẩm (product icon)
- Đơn hàng (shopping cart icon)
- Khách hàng (users icon)
- Đánh giá (star icon)
- Liên hệ (mail icon)

## PAGES

### 1. Admin Login (/admin/login):
- Email + password form (same POST /auth/login endpoint)
- Validate role === 'admin' from response
- Store token in adminAuthStore

### 2. Dashboard (/admin):
- Stats row: 4 StatCards — Doanh Thu, Tổng Đơn, Khách Hàng, Sản Phẩm
  (GET /admin/dashboard)
- Recent orders table: ID, Khách hàng, Tổng tiền, Trạng thái, Ngày đặt
  Each row has an inline status <select> → PATCH /admin/orders/{id}/status

### 3. Products (/admin/products):
- Search bar (debounced 300ms)
- "Thêm sản phẩm" button → opens Add modal
- Table: Image thumbnail, Tên SP, Danh mục, Giá, Tồn kho, Giới tính, Actions (Edit/Delete)
- Add/Edit modal (Dialog): all product fields + image upload preview
  Upload uses multipart/form-data to POST/PUT /admin/products
- Delete: confirm dialog before DELETE /admin/products/{id}
- Pagination: 10 items/page

### 4. Orders (/admin/orders):
- Tabs filter: Tất cả | Chờ xử lý | Đang giao | Hoàn thành | Đã hủy
- Table: ID, Khách hàng, SĐT, Tổng, Phương thức TT, Trạng thái badge, Ngày
- Click row → /admin/orders/:id
- Order Detail page: full product list, delivery info, status update select

### 5. Customers (/admin/users):
- Table: ID, Họ tên, Email, SĐT, Giới tính, Ngày đăng ký
- Search by name/email

### 6. Reviews (/admin/reviews):
- Table: Sản phẩm, Khách hàng, Sao, Nội dung, Phản hồi shop, Ngày
- "Phản hồi" button → inline text input → PATCH /admin/reviews/{id}/reply
- "Xóa" button → DELETE /admin/reviews/{id}

### 7. Contacts (/admin/contacts):
- Table: Họ tên, Email, Nội dung, Trạng thái, Ngày
- Status badges: new (red dot), read (gray), resolved (green)
- Click row → expand full message + status update

## STATE
- adminAuthStore (Zustand): { admin, token, setAuth, logout }

## TASKS
1. Set up project with Vite + Tailwind + shadcn/ui
2. Create Axios admin instance
3. Create AdminLayout (Sidebar + Header)
4. Create PrivateAdminRoute
5. Build all pages in order: Login → Dashboard → Products → Orders → Customers → Reviews → Contacts

Use Vietnamese text throughout. Format prices as "320.000đ".
```

---

### 7.4 DOCKER / DEVOPS PROMPT

```
You are a DevOps engineer. Set up the Docker development and production environment for FashionShop — a decoupled architecture with:
- fashionshop-api (Laravel 11, PHP 8.2, port 8000)
- fashionshop-web (React customer app, port 3000)
- fashionshop-admin (React admin app, port 3001)
- MySQL 8.0 (port 3306)
- Nginx (port 80/443 as reverse proxy)

## docker-compose.yml requirements:
- Service: api — build from fashionshop-api/Dockerfile, env from .env
- Service: web — build from fashionshop-web/Dockerfile, depends_on: api
- Service: admin — build from fashionshop-admin/Dockerfile, depends_on: api
- Service: db — mysql:8.0, volume for persistence, healthcheck
- Service: nginx — routes /api → api:8000, / → web:3000, /admin → admin:3001

## Environment variables needed:
APP_KEY, APP_ENV, DB_HOST=db, DB_DATABASE=fashionshop, DB_USERNAME, DB_PASSWORD
FRONTEND_URL (for CORS)
SANCTUM_STATEFUL_DOMAINS

## Dockerfile for Laravel (fashionshop-api/Dockerfile):
- php:8.2-fpm base
- Install: pdo_mysql, mbstring, exif, pcntl, bcmath, gd, zip
- Install Composer
- Copy source, run composer install --no-dev --optimize-autoloader
- php artisan key:generate, storage:link, migrate --seed on startup

## Dockerfile for React apps:
- node:20-alpine build stage → nginx:alpine serve stage
- Multi-stage build for small image size

## Health checks:
- MySQL: mysqladmin ping
- Laravel: curl /api/v1/health

Create: docker-compose.yml, fashionshop-api/Dockerfile, fashionshop-web/Dockerfile, fashionshop-admin/Dockerfile, nginx/nginx.conf
```

---

## 8. MIGRATION PATH TỪ REPO GỐC

### Bước 1 — Setup dự án mới
```bash
# Backend
composer create-project laravel/laravel fashionshop-api
cd fashionshop-api && composer require laravel/sanctum

# Frontend (Customer)
npm create vite@latest fashionshop-web -- --template react
cd fashionshop-web && npm install @tanstack/react-query zustand axios react-router-dom

# Frontend (Admin)
npm create vite@latest fashionshop-admin -- --template react
cd fashionshop-admin && npm install @tanstack/react-query zustand axios react-router-dom
```

### Bước 2 — Migrate data
```bash
# Export từ DB gốc, chạy script convert password plain-text → bcrypt
# (cần reset password tất cả users và thông báo họ)
php artisan db:seed --class=MigrateOldDataSeeder
```

### Bước 3 — Migrate images
```bash
# Copy từ FashionShop/assets/images/ sang fashionshop-api/storage/app/public/products/
cp FashionShop/assets/images/*.png fashionshop-api/storage/app/public/products/
php artisan storage:link
```

### Bước 4 — Kiểm tra feature parity
Dùng bảng requirements ở Phần 2 để test từng tính năng trên hệ thống mới.

---

*Tài liệu được tạo bởi Claude — dựa trên phân tích repo https://github.com/KCPM-Nhom/FashionShop.git*
*Ngày: 27/05/2026*
