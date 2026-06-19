# 🍽️ Servly — Mini QR Ordering System

Servly is a modern, high-fidelity restaurant QR ordering system. It enables customers to scan table-specific QR codes, browse premium menus, adjust cart items, and complete simulated payments. Restaurant operators can track orders, compile revenue statistics, modify order/payment statuses, and print or download custom table QR codes from a dark glassmorphism dashboard.

---

## 🚀 Assessment Evaluation Areas

This repository is designed to showcase core technical capabilities across five critical software engineering domains:

### 1. Problem-Solving Skills
*   **Payment Simulation State Machine:** Rather than using generic alerts, the checkout flow triggers a sandboxed payment state machine (`processing` → `outcome selection` → `submitting` → `success` or `failure`). On payment success, it fires the POST request to the API, clears the customer's cart, and displays a success voucher. If it fails, it records the failure status in the database, preserves the user's cart, and allows a transaction retry.
*   **Dynamic Client-Side QR Export:** To avoid server-side load or external API dependencies, the QR generator directly serializes the live DOM SVG element using `XMLSerializer` and dynamically triggers a client download of a high-resolution, infinitely scalable SVG vector.
*   **Cross-Device Local Testing:** The backend server binds to `0.0.0.0` (rather than restricted `localhost`), allowing customers' physical mobile devices on the same Wi-Fi network to browse and execute orders against the developer's machine.
*   **Seamless Menu Refreshing:** Implemented an in-app refresh button allowing customers to update the live menu without triggering the browser's native `beforeunload` event, thereby preventing accidental session disconnection.

### 2. Code Organization
```
Servly/
├── database/
│   └── servly.sql              # Database schema (orders, order_items, products, settings, table_sessions) and seed data
├── backend/                    # Node.js + Express API
│   ├── controllers/            # Controller layer separating DB logic from routes
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── sessionsController.js
│   │   └── settingsController.js
│   ├── routes/                 # API route definitions
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── sessionsRoutes.js
│   │   └── settingsRoutes.js
│   ├── .env                    # Database & server configuration variables
│   ├── db.js                   # MySQL connection pool configuration
│   ├── package.json            # Node configurations (ES Modules mode)
│   └── index.js                # Entry point and CORS/Express setup
└── frontend/                   # React Client
    ├── public/
    └── src/
        ├── components/         # Reusable UI components
        │   └── Logo.jsx
        ├── pages/              # Dedicated layout layers (views)
        │   ├── WelcomePage.jsx
        │   ├── MenuPage.jsx
        │   ├── CartPage.jsx
        │   ├── CheckoutPage.jsx
        │   └── AdminDashboard.jsx
        ├── App.jsx             # Global State Orchestrator & Router
        ├── index.css           # Vanilla CSS custom theme & global styles
        └── main.jsx            # Client bootstrap
```
*   **Separation of Concerns:** The backend isolates database queries (controllers) from HTTP endpoints (routes). The frontend separates layout logic (pages) from reusable UI components.
*   **State-Driven Routing:** Built a lightweight, reactive routing system inside `App.jsx` based on URL parameter parsing (`?table=X` or `?page=admin`). This avoids the overhead of react-router and ensures seamless tableside onboarding.

### 3. UI/UX (Bespoke & Professional Design)
*   **Color Palette & Typography:** Used an elegant dark/gold color palette (`#d97706` Amber combined with deep Slate) that evokes luxury hospitality. Configured modern typography using the Google Fonts `Plus Jakarta Sans` and `Outfit`.
*   **Micro-interactions & Responsiveness:** Fully mobile-responsive interface mimicking native iOS/Android food delivery apps. Features a floating bottom action dock showing current cart totals, custom hover animations (`hover-lift`), and smooth state transitions.
*   **Operator Dashboard:** Designed a premium glassmorphic control center for restaurant admins, containing live key performance indicators (Revenue, Active Orders, Completed Orders, Payment Failures) and inline status modifiers.
*   **Context-Aware Checkout:** The checkout form intelligently detects if a customer is already bound to a specific table session and automatically locks the table input field, preventing accidental reassignment.

### 4. API Understanding
*   **RESTful Resource Architecture:** Exposes clean, resource-based endpoints (`/api/products`, `/api/orders`, `/api/sessions`, `/api/settings`) using standard HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`) and return codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Server Error`).
*   **Relational Data Integrity:** Normalized the database architecture by extracting order items into a dedicated `order_items` table with a foreign key relationship to `orders`. The backend employs MySQL transactions to guarantee that orders and their associated items are created atomically, eliminating the risk of partial data inserts.

### 5. Development Workflow
*   **Automated Scaffolding & Setup:** Boots quickly with minimal dependencies, using standard `npm` package configurations for both the backend and frontend.
*   **Graceful Recovery & Skeletons:** Implemented loading skeletons and user-friendly error banners to handle database connection issues gracefully.
*   **Live Session Management:** The backend tracks active table sessions via heartbeats. If a session expires or an admin releases a table, the customer's browser is automatically returned to the welcome screen without a page reload.

---

## 🛠️ Step-by-Step Setup Guide

### Prerequisites
*   **XAMPP** (with Apache and MySQL enabled)
*   **Node.js** (v18 or higher recommended)

---

### Step 1: Database Configuration (XAMPP MySQL)
1. Open the **XAMPP Control Panel** and click **Start** next to **MySQL**.
2. Open **phpMyAdmin** (`http://localhost/phpmyadmin`) or your favorite SQL GUI client.
3. Import or execute the contents of the database seeder file: `database/servly.sql`
   * *This will create the `servly` database, all required tables (`products`, `orders`, `order_items`, `settings`, `table_sessions`), and seed the menu with signature items.*

---

### Step 2: Configure & Launch the Backend API
1. Navigate to the `backend` directory.
2. Verify that your `.env` file contains your correct database credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=servly
   FRONTEND_URL=http://localhost:5173
   ```
3. Install dependencies and run the development server:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   * *The server will start at `http://localhost:5000` and output confirmation that it connected to your MySQL instance successfully.*

---

### Step 3: Launch the Frontend Client
1. Navigate to the `frontend` directory.
2. Install dependencies and run the React Vite development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open the menu in your browser at: `http://localhost:5173/?table=1` (or specify any table number in the URL).
4. Access the administrator dashboard by visiting: `http://localhost:5173/admin`.

---

## 💳 Testing the Checkout & Payment Simulation
1. Visit `http://localhost:5173/?table=4`.
2. Add some **Parmesan Truffle Fries** and a **Ceremonial Matcha Latte** to your cart.
3. Click the bottom shopping cart bag to review your basket.
4. Click **Proceed to Checkout**.
5. Input your name and click **Proceed to Payment Simulation**.
6. Select **Simulate Success** or **Simulate Failure**:
   * **Simulate Success:** Will save the order to the database with `payment_status = 'paid'`, clear your cart, and display a green success voucher.
   * **Simulate Failure:** Will save the order to the database with `payment_status = 'failed'`, retain your items in the basket, and let you try again.
7. Open the **Admin Dashboard** (`http://localhost:5173/admin`) to watch your orders appear, update their preparation statuses, and generate QR Codes for new dining tables!
