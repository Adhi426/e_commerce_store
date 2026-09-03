# 🛒 NEXORA — Modern Full-Stack E-Commerce Platform

> **"Shop Smarter. Live Better."**
> 
> Developed for **CodeAlpha Full Stack Development Internship – Task 1: Simple E-commerce Store**.

---

## 🌟 Project Overview

**NEXORA** is a production-grade, full-stack e-commerce web application engineered with a modern, ultra-clean UI/UX design system, resilient REST API architecture, JWT authentication, and MongoDB database integration.

The application features a responsive design (Desktop, Laptop, Tablet, Mobile), real-time stock management, search with debouncing, multi-category filters, price sorting, interactive shopping cart, multi-step checkout wizard with demo payment simulation, user profile management, order history tracking, and a comprehensive **Admin Portal**.

---

## ✨ Key Features

### 🛍️ Customer Storefront
- **Sticky Glassmorphic Header**: Blur backdrop navigation with live cart count badge, wishlist indicator, and user session menu.
- **Hero & Category Showcase**: Interactive visual banners and category filter chips (*Electronics, Fashion, Accessories, Home & Living, Beauty, Sports*).
- **Product Catalog (`/products.html`)**: Instant debounced search by keyword, multi-filter, price sorting (*Low to High, High to Low, Highest Rated, Newest*), and pagination.
- **Product Details (`/product.html`)**: Image thumbnail gallery, live stock availability, quantity selector, specifications table, and customer reviews.
- **Shopping Cart (`/cart.html`)**: Dynamic quantity adjustments, coupon discount engine, GST tax calculations, and free shipping triggers.
- **Multi-Step Checkout (`/checkout.html`)**: Pre-filled shipping address, cart item review, payment simulation (*Cash on Delivery, Demo Credit/Debit Card, UPI Demo*), and unique Order ID generation (`NX-2026-XXXX`).
- **Order History (`/orders.html`)**: Order status timeline tracking (*Confirmed, Processing, Shipped, Delivered, Cancelled*) and detailed digital invoice receipts.

### 👑 Admin Control Center (`/admin.html`)
- **Real-Time Analytics**: Total Revenue, Total Orders, Product Count, Registered Users, and Pending Orders.
- **Inventory CRUD Management**: Add new products, update pricing/stock, and delete items.
- **Order Processing**: Update order fulfillment statuses in real-time.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Design Tokens, CSS Variables, Flexbox/Grid, Animations), Vanilla JavaScript (ES6+), Fetch API |
| **Backend** | Node.js, Express.js (REST API Architecture) |
| **Database** | MongoDB, Mongoose ODM (with hybrid resilient in-memory fallback store) |
| **Security & Auth** | JSON Web Tokens (JWT), Password Hashing (`bcryptjs`), Protected Middleware, Environment Variables (`dotenv`) |

---

## 📁 Project Structure

```text
NEXORA/
│
├── client/
│   ├── index.html            # Landing Home Page
│   ├── products.html         # Shop Listing Catalog
│   ├── product.html          # Product Detail & Gallery View
│   ├── cart.html             # Shopping Cart Summary
│   ├── checkout.html         # Multi-step Checkout Wizard
│   ├── orders.html           # User Order History Page
│   ├── profile.html          # User Profile & Address Settings
│   ├── login.html            # User/Admin Sign In
│   ├── register.html         # Account Registration
│   ├── admin.html            # Admin Management Portal
│   │
│   ├── css/
│   │   ├── style.css         # Tokens, typography, reset & animations
│   │   ├── components.css    # Cards, navbar, grids, forms & buttons
│   │   └── responsive.css    # Mobile/Tablet breakpoints
│   │
│   └── js/
│       ├── app.js            # Core App, API fetch wrapper, Toast, Cart state
│       ├── auth.js           # Login & Registration handlers
│       ├── products.js       # Search, filter, sorting & pagination
│       ├── product-details.js# Product gallery & Buy Now shortcuts
│       ├── cart.js           # Cart breakdown calculations
│       ├── checkout.js       # Checkout wizard & demo payment
│       ├── orders.js         # Order history & receipt modal
│       ├── profile.js        # Profile edit form & settings
│       └── admin.js          # Admin dashboard analytics & CRUD
│
├── server/
│   ├── server.js             # Express application entrypoint
│   ├── seedData.js           # Catalog database seeding (18+ items)
│   │
│   ├── config/
│   │   └── db.js             # MongoDB Mongoose connection
│   │
│   ├── models/
│   │   ├── User.js           # User Mongoose schema
│   │   ├── Product.js        # Product Mongoose schema
│   │   └── Order.js          # Order Mongoose schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js     # Auth API routes
│   │   ├── productRoutes.js  # Product API routes
│   │   ├── orderRoutes.js    # Order API routes
│   │   └── userRoutes.js     # User & Admin stats routes
│   │
│   ├── controllers/
│   │   ├── authController.js # Auth business logic
│   │   ├── productController.js# Product CRUD logic
│   │   ├── orderController.js# Order placement logic
│   │   └── userController.js # Profile & Admin stats logic
│   │
│   └── middleware/
│       └── authMiddleware.js # JWT protection & Admin authorization
│
├── .env                      # Environment Variables
├── .gitignore                # Git Exclusion rules
├── package.json              # Project dependencies & scripts
└── README.md                 # Project documentation
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (Local daemon or MongoDB Atlas connection string)

### 1. Installation
Navigate into the `NEXORA` directory and install dependencies:

```bash
npm install
```

### 2. Configure Environment Variables
Verify `.env` configuration:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nexora_db
JWT_SECRET=nexora_super_secret_jwt_key_2026_codealpha
```

### 3. Run Application
Start the NEXORA Express server:

```bash
npm start
```

The Express server will launch at:
👉 **`http://localhost:5000`**

*(Seed data with 18+ products across 6 categories will automatically populate on startup!)*

---

## 🔑 Demo Login Credentials

For quick testing, use the built-in demo credentials on the Login page:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Customer User** | `alex@example.com` | `user123` | Cart, Checkout, Order History, Profile |
| **Administrator** | `admin@nexora.com` | `admin123` | Full Admin Portal, Product CRUD, Order Status Manager |

---

## 📡 REST API Documentation

### Auth Endpoints
- `POST /api/auth/register` — Create a new user account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET  /api/auth/me` — Fetch authenticated user profile

### Product Endpoints
- `GET    /api/products` — Retrieve product catalog (Supports `search`, `category`, `sort`, `page`, `limit`)
- `GET    /api/products/:id` — Get detailed product info by ID
- `POST   /api/products` — *(Admin)* Create a new product
- `PUT    /api/products/:id` — *(Admin)* Update existing product details
- `DELETE /api/products/:id` — *(Admin)* Remove product from catalog

### Order Endpoints
- `POST   /api/orders` — Place order, reduce product stock, clear cart
- `GET    /api/orders` — Retrieve user orders (or all orders for Admin)
- `GET    /api/orders/:id` — Get single order details
- `PUT    /api/orders/:id/status` — *(Admin)* Update order status

### User & Admin Stats
- `GET /api/users/profile` — Fetch user profile
- `PUT /api/users/profile` — Update user name, phone, and shipping address
- `GET /api/users/admin/stats` — *(Admin)* Retrieve dashboard revenue & analytics

---

## 👨‍💻 Internship Credit

This application was designed & engineered by **Adhithya & Akhash** for the **CodeAlpha Full Stack Development Internship**.
