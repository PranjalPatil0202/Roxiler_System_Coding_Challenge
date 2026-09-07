# Store Rating Platform - Node.js + Express Backend

A robust, production-ready backend for a Store Rating Platform built with **Node.js**, **Express**, and **PostgreSQL** using **Sequelize ORM**.

---

## 🌟 Key Features

- **JWT Authentication & Security**:
  - Secure password hashing with `bcryptjs`.
  - Token-based stateless authentication with expiration.
  - Rate limiting on `/api/auth/login` and `/api/auth/register` (10 requests per 15 min per IP) using `express-rate-limit`.
  - HTTP security headers with `helmet`.
  - CORS enabled and HTTP request logging with `morgan`.
- **Role-Based Access Control (RBAC)**:
  - Three distinct roles: `admin`, `normal_user`, `store_owner`.
  - Granular middleware protecting endpoints based on role.
- **Data Validation**:
  - Strict input validation using `express-validator`:
    - Name: 20 to 60 characters (User and Store).
    - Address: Maximum 400 characters.
    - Password: 8 to 16 characters with at least one uppercase letter and at least one special character.
    - Email: Standard RFC-compliant email validation and normalization.
    - Rating: Integer between 1 and 5.
- **Database Design (Sequelize ORM)**:
  - `Users`, `Stores`, and `Ratings` models with complete associations and cascade rules.
  - Unique compound constraint on `(user_id, store_id)` ensuring a user can submit only one rating per store, with update support.
  - Nullable `owner_id` on `Stores` to allow standalone store creation before assigning to a store owner.
- **Comprehensive Admin Dashboard**:
  - Aggregated stats: `totalUsers`, `totalStores`, `totalRatings`, and `userCountsByRole`.
  - User and Store filtering, sorting, and pagination.
  - Detailed single user breakdown with average ratings across owned stores.
- **Store Owner & Normal User Portals**:
  - Normal users can browse stores, view overall ratings, view their own submitted rating, and submit/update ratings.
  - Store owners can view real-time statistics, average ratings, star distributions (1 to 5 stars), and detailed customer review logs.

---

## 📁 Project Structure

```
├── .env.example
├── .env
├── .gitignore
├── package.json
├── README.md
├── server.js                        # App bootstrap & database connection
├── src/
│   ├── app.js                       # Express configuration & middleware pipeline
│   ├── config/
│   │   ├── config.js                # Centralized environment variable loader
│   │   └── database.js              # Sequelize instance & connection manager
│   ├── models/
│   │   ├── index.js                 # Model relationships & exports
│   │   ├── User.js                  # User model (bcrypt hooks, safe serialization)
│   │   ├── Store.js                 # Store model (nullable owner_id, length validation)
│   │   └── Rating.js                # Rating model (1-5 range, unique index)
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT authentication & optional auth
│   │   ├── role.middleware.js       # Role authorization (admin, normal_user, store_owner)
│   │   ├── rateLimit.middleware.js  # Brute-force protection for auth routes
│   │   ├── validation.middleware.js # Express-validator result interceptor
│   │   └── error.middleware.js      # Global error and 404 handler
│   ├── validators/
│   │   ├── auth.validator.js        # Auth input rules & password regex
│   │   ├── admin.validator.js       # Admin user/store creation & query validation
│   │   ├── store.validator.js       # Store query & route parameter validation
│   │   ├── rating.validator.js      # Rating boundary (1-5) validation
│   │   └── user.validator.js        # Password update validation
│   ├── controllers/
│   │   ├── auth.controller.js       # Registration & login logic
│   │   ├── admin.controller.js      # Dashboard stats & admin operations
│   │   ├── store.controller.js      # Store listing & contextual rating calculation
│   │   ├── rating.controller.js     # Rating submission & upsert logic
│   │   ├── storeOwner.controller.js # Store owner stats & customer logs
│   │   └── user.controller.js       # Password changes & user profile
│   ├── routes/
│   │   ├── index.js                 # API route aggregator (/api)
│   │   ├── auth.routes.js           # /api/auth
│   │   ├── admin.routes.js          # /api/admin
│   │   ├── store.routes.js          # /api/stores
│   │   ├── rating.routes.js         # /api/ratings
│   │   ├── storeOwner.routes.js     # /api/store-owner
│   │   └── user.routes.js           # /api/users
│   └── seeds/
│       └── seed.js                  # Automated database reset & mock seeder
└── tests/
    └── api.test.js                  # Integration test suite
```

---

## 🛠️ Getting Started

### 🐳 1. Quick Start with Docker Compose (Recommended)

Run the entire full-stack application (PostgreSQL 16, Node Express Backend, and Nginx React Frontend) with a single command:

```bash
docker compose up --build
```
*(or `docker-compose up --build`)*

#### Service Architecture & Ports
| Service | Container Name | Port Mapping | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `store_rating_frontend` | `http://localhost:3000` | Nginx Alpine serving production React build & reverse-proxying `/api` |
| **Backend** | `store_rating_backend` | `http://localhost:5000` | Node.js 20 Alpine running Express REST API |
| **Database** | `store_rating_postgres` | `localhost:5432` | PostgreSQL 16 Alpine with persistent volume `store_rating_postgres_data` |

#### Automatic First-Run Seeding
When the containers launch for the first time, the platform automatically checks if the database contains records. On initial run (empty database), it seeds the 3 default demo accounts, 3 sample stores, and customer ratings. On subsequent container restarts, **it detects existing data and skips seeding**, guaranteeing your data is never wiped.

#### Default Demo Credentials
| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@example.com` | `Admin@Password1` | Full administrative governance, user/store CRUD, analytics |
| **Store Owner (Merchant)** | `owner1@example.com` | `Owner@Password1` | Store portal, rating distribution breakdown, customer feedback |
| **Normal User (Customer)** | `user1@example.com` | `User@Password1` | Browse stores, submit ratings (1-5 stars), update feedback |

---

### 💻 2. Local Manual Setup (Without Docker)

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (or SQLite for development/testing)

#### Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`):
```env
# Server
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_LOGGING=false
DB_SSL=false

# Authentication
JWT_SECRET=super_secret_store_rating_platform_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=10
```

### 4. Database Setup & Seeding
Ensure your PostgreSQL server is running and the database specified in `.env` exists (`createdb store_rating_db`).
Then run the seed script:
```bash
npm run seed
```

This will automatically create all tables and populate sample records:
- **Admin**: `admin@example.com` / `Admin@Password1`
- **Store Owner 1**: `owner1@example.com` / `Owner@Password1`
- **Store Owner 2**: `owner2@example.com` / `Owner@Password2`
- **Normal User 1**: `user1@example.com` / `User@Password1`
- **Normal User 2**: `user2@example.com` / `User@Password2`
- **Normal User 3**: `user3@example.com` / `User@Password3`

### 5. Run the Servers
```bash
# Backend (Port 5000)
npm run dev

# Frontend (Port 3000)
npm run client:dev
```

Visit **http://localhost:3000** in your browser.

---

## 💻 Frontend Application Overview

The frontend is built with **React**, **Vite**, **React Router v6**, **Axios**, and the **Context API**.

### 🎨 Design System & Visual Hierarchy
- **Typographic Scale**: Headings in `Plus Jakarta Sans`, body & controls in `Inter`, tabular numbers for metrics and scores.
- **8px Grid System**: Consistent spacing, margins, padding, and border radii.
- **Theming**: Light mode default + persistent Dark mode (`data-theme="dark"` stored in `localStorage`).
- **Role-Specific Accents**:
  - 👑 **Admin**: Royal Indigo (`#4f46e5` / `#6366f1`)
  - 👤 **Normal User**: Emerald Mint (`#059669` / `#10b981`)
  - 🏪 **Store Owner**: Warm Amber / Gold (`#d97706` / `#f59e0b`)

### 🛡️ Security & In-Memory Token Handling
- JWT token is held **strictly in React in-memory state** (`AuthContext`).
- No localStorage or cookie persistence for tokens.
- Axios request interceptor injects the in-memory token.
- `401 Unauthorized` responses automatically trigger logout and redirect to `/login`.

### 📱 Views & Features
1. **Login & Signup**:
   - One-click **Demo Account Pills** on the login page (Admin, Store Owner, Normal User).
   - Live validation criteria checklist on signup (Name 20-60 chars, Password 8-16 chars + uppercase + special char, Email, Address max 400 chars).
2. **Admin Operations**:
   - KPI metrics dashboard (`totalUsers`, `totalStores`, `totalRatings`, role demographic badges).
   - Users management table with live filtering (Name/Email/Address/Role) and sorting.
   - User detail inspection modal showing store ownership, store reviews, and overall average scores.
   - Stores management table with sorting, filtering, and "Register Store" modal.
   - "Add User" modal with role assignment.
3. **Normal User Portal**:
   - Store catalog with search (name/address) and sorting (highest rated, name, newest).
   - Interactive star rating widget allowing instant inline rating submission & updates.
4. **Store Owner Portal**:
   - Hero card with Prominent Average Rating (e.g. 4.67 ★ / 5.0) and review counts.
   - 1–5 Star Rating Distribution breakdown chart.
   - Verified customer review logs table with customer name, email, star score, and timestamp.
5. **Shared Features**:
   - Responsive navbar with theme switcher, user avatar, and role indicator.
   - Password update modal accessible from anywhere.
   - Floating glassmorphic toast notification container.
   - Shimmer skeleton loaders and clean empty states.

---

### 6. Run Automated Tests
```bash
npm test
```

---

## 📚 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new normal user (rate limited) | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token (rate limited) | Public |

#### Register Payload Example:
```json
{
  "name": "Johnathan Alexander Doe User",
  "email": "john.doe@example.com",
  "password": "SecurePassword@123",
  "address": "123 Main Street, Suite 400"
}
```

---

### 🛡️ Admin Endpoints (`/api/admin`)
*Requires `Authorization: Bearer <token>` with `role: admin`*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Aggregated platform statistics (`totalUsers`, `totalStores`, `totalRatings`, `userCountsByRole`) |
| `POST` | `/api/admin/users` | Create user with any role (`admin`, `normal_user`, `store_owner`) |
| `GET` | `/api/admin/users` | List users with filters (`name`, `email`, `address`, `role`) and sorting |
| `GET` | `/api/admin/users/:id` | Single user detail (includes owned stores & average rating if store owner) |
| `POST` | `/api/admin/stores` | Create a new store (with optional `owner_id`) |
| `GET` | `/api/admin/stores` | List stores with filters, sorting, and computed average rating |

#### Admin Dashboard Response Example:
```json
{
  "success": true,
  "data": {
    "totalUsers": 6,
    "totalStores": 3,
    "totalRatings": 6,
    "userCountsByRole": {
      "admin": 1,
      "normal_user": 3,
      "store_owner": 2
    }
  }
}
```

---

### 🏪 Stores Endpoints (`/api/stores`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/stores` | List stores with average rating, total ratings, and current user's rating | Public / Optional Auth |
| `GET` | `/api/stores/:id` | Get store details with ratings breakdown | Public / Optional Auth |

#### Query Parameters for `/api/stores`:
- `search`: Filter across store name and address.
- `name`: Filter by store name.
- `address`: Filter by store address.
- `sortBy`: Sort by `name`, `address`, `rating`, `created_at` (default: `created_at`).
- `sortOrder`: `ASC` or `DESC` (default: `DESC`).
- `page` & `limit`: Pagination parameters.

---

### ⭐ Ratings Endpoints (`/api/ratings`)
*Requires `Authorization: Bearer <token>` with `role: normal_user`*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ratings` | Submit or upsert rating (1-5) for a store |
| `PUT` | `/api/ratings/:storeId` | Update user's existing rating for a store |

#### Submit Rating Payload Example:
```json
{
  "store_id": 1,
  "rating": 5
}
```

---

### 🏬 Store Owner Endpoints (`/api/store-owner`)
*Requires `Authorization: Bearer <token>` with `role: store_owner`*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/store-owner/ratings` | List all customer reviews and ratings for stores owned by this owner |
| `GET` | `/api/store-owner/stats` | Average rating, rating count, and 1-5 star distribution |

#### Store Owner Stats Response Example:
```json
{
  "success": true,
  "data": {
    "hasStores": true,
    "totalStores": 1,
    "totalRatings": 3,
    "averageRating": 4.67,
    "ratingDistribution": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 1,
      "5": 2
    },
    "stores": [...]
  }
}
```

---

### 👤 User Endpoints (`/api/users`)
*Requires `Authorization: Bearer <token>`*

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/api/users/update-password` | Update current user's password |
| `GET` | `/api/users/me` | Fetch authenticated user profile |
