# 🤖 AI-Driven Smart Point of Sale (POS) Decision Support System

> An intelligent, full-stack POS system powered by machine learning — built for modern retail with real-time AI recommendations, customer segmentation, demand forecasting, and live inventory management.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Test Credentials](#test-credentials)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)

---

## 🌟 Overview

This system combines a full POS billing engine with an AI decision support layer. Cashiers process transactions through a clean, role-restricted interface while managers gain real-time insights via analytics dashboards, AI demand forecasts, and customer segmentation powered by RFM (Recency, Frequency, Monetary) analysis.

---

## ✨ Features

### 🛒 Cashier Dashboard
| Feature | Description |
|---|---|
| **Product Listing** | Browse, search, and filter products by category with real-time stock levels |
| **Cart Engine** | Add/remove items, adjust quantities, stock-overflow protection |
| **Customer Lookup** | Search by phone → shows name, segment (Loyal/At-Risk/New/Regular), total spent, visit count |
| **AI Recommendations** | Real-time product suggestions based on current cart (confidence score shown) |
| **Payment Processing** | Cash / Card / UPI with optional discount and order notes |
| **Invoice Generation** | Auto-generated invoice with line items, tax breakdown, and print support |
| **Shift Summary** | Live stats (revenue, transactions, avg ticket) with auto-refresh every 30s |

### 📊 Manager Dashboard
| Feature | Description |
|---|---|
| **Overview** | KPI cards (today's sales, monthly revenue, low-stock alerts, total customers) |
| **Analytics** | Sales trend charts, hourly distribution, top products, revenue comparison |
| **AI Forecast** | ML-based demand forecasting per product using historical sales data |
| **Inventory** | Real-time stock levels, low-stock alerts, reorder management |

### 🔒 Authentication
- JWT-based login with **role-based access control**
- Cashier → can only access POS screen
- Manager → has full dashboard access
- Unauthorized access auto-redirects

---

## 🛠 Tech Stack

### Frontend
- **React 18** + Vite
- **Redux Toolkit** — state management
- **React Router DOM** — navigation
- **Recharts** — data visualization
- **Pure Inline Styles** — guaranteed rendering, no Tailwind dependency

### Backend
- **FastAPI** — async REST API
- **Motor** — async MongoDB driver
- **MongoDB** — primary database
- **PyJWT** — authentication tokens
- **Pydantic v2** — request/response schemas

### AI / ML
- **Demand Forecasting** — time-series prediction on 30-day sales history
- **Product Recommendations** — collaborative filtering based on transaction co-occurrence
- **Customer Segmentation** — RFM (Recency, Frequency, Monetary) clustering

---

## 📁 Project Structure

```
Website 2/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Marketing landing page
│   │   │   ├── AuthPage.jsx          # Login / Signup
│   │   │   ├── ManagerDashboard.jsx  # Manager analytics dashboard
│   │   │   └── CashierPOS.jsx        # Cashier POS terminal (4 tabs)
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   ├── authSlice.js          # JWT auth state
│   │   │   ├── posSlice.js           # POS + cart + shift state
│   │   │   └── dashboardSlice.js     # Manager dashboard state
│   │   ├── services/
│   │   │   └── api.js                # Axios instance
│   │   └── App.jsx                   # Routing + sidebar layout
│
├── backend/
│   ├── main.py                       # FastAPI app entry point
│   ├── database.py                   # MongoDB connection
│   ├── schemas.py                    # Pydantic models
│   ├── routes/
│   │   ├── auth.py                   # Login / register
│   │   ├── products.py               # Product CRUD
│   │   ├── transactions.py           # Create tx, recent list, shift stats
│   │   ├── dashboard.py              # Stats, charts, customer lookup
│   │   └── ml.py                     # Recommendations, forecast, segments
│   └── services/
│       ├── recommendation_service.py
│       ├── forecast_service.py
│       └── segmentation_service.py
│
└── seed.py                           # Seed products & sample data
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB running locally (`mongodb://localhost:27017`)

### 1. Backend Setup

```bash
# Navigate to the project root directory
cd POS-Project-

# Create virtual environment inside backend directory
python -m venv backend/venv

# Activate virtual environment
# Windows (PowerShell):
.\backend\venv\Scripts\Activate.ps1
# Windows (CMD):
.\backend\venv\Scripts\activate.bat
# Linux/macOS:
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Seed the database (first time only)
python backend/seed.py

# Start the backend (Always run this from the project root directory)
python -m uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### 3. Access the app

| URL | Description |
|---|---|
| `http://localhost:5173` | Landing page |
| `http://localhost:5173/login` | Login page |
| `http://localhost:5173/manager` | Manager dashboard |
| `http://localhost:5173/pos` | Cashier POS terminal |
| `http://localhost:8000/docs` | FastAPI Swagger docs |

---

## 🔑 Test Credentials

| Role | Email | Password |
|---|---|---|
| **Manager** | `manager@gmail.com` | `manager@gmail.com` |
| **Cashier** | `store@gmail.com` | `store@gmail.com` |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login, returns JWT token |
| POST | `/auth/register` | Register new user |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products/` | List all products |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/transactions/` | Create transaction (deducts stock, updates RFM) |
| GET | `/transactions/recent?limit=10` | Last N transactions |
| GET | `/transactions/shift-stats` | Today's KPIs (count, revenue, avg ticket) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | Today's sales, monthly revenue, low-stock count |
| GET | `/dashboard/top-products` | Top 5 products by units sold |
| GET | `/dashboard/sales-trend` | 7-day sales data |
| GET | `/dashboard/low-stock` | Products below reorder level |
| GET | `/dashboard/customer-lookup?phone=` | Customer CRM profile by phone |

### ML / AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ml/recommend` | Product recommendations for given cart |
| POST | `/ml/predict-demand` | 7-day demand forecast for a product |
| GET | `/ml/customer-segments` | RFM segmentation for all customers |

---

## 🏗 Database Collections

| Collection | Purpose |
|---|---|
| `users` | Cashier / Manager accounts |
| `products` | Product catalog with stock levels |
| `transactions` | All completed sales |
| `customers` | Customer RFM data (phone-based) |

---

## 📄 License

This project was built as part of the **Road2Tech P22** college project series.




🛒 Cashier Dashboard
4 dedicated tabs in the sidebar:

Products — Search/filter products, see live stock levels, add to cart directly
Customer Lookup — Enter phone number → instantly shows customer name, segment (Loyal / At-Risk / New / Regular), total spent, visit count, last purchase date
Cart & Payment — Full cart management (add/remove/adjust qty), discount field, 9% auto-tax, Cash/Card/UPI payment selection, printable invoice on completion
Shift Summary — Live KPIs (transactions, revenue, avg ticket) + recent transactions table with auto-refresh every 30 seconds
Core engine features:

✅ Stock deduction on every completed sale
✅ AI product recommendations with confidence % (based on current cart)
✅ Customer RFM data auto-updated on each purchase
✅ Invoice generation with print button
📊 Manager Dashboard
4 sidebar tabs:

Overview — KPI cards (today's sales, monthly revenue, low-stock alerts, total customers) + live activity feed
Analytics — Sales trend (7-day), hourly distribution, top products, revenue comparison charts
AI Forecast — ML-based demand prediction per product for next 7 days
Inventory — Real-time stock table, low-stock flagging, reorder management
🔒 System-Wide
Role-based access (Cashier cannot open Manager pages)
JWT authentication
MongoDB backend with real transaction history