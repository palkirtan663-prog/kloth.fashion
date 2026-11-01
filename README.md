# Kloth.fashion — Contemporary Streetwear & Bespoke Atelier (UrbanThread AI)

An enterprise-grade, full-stack Gen-Z streetwear e-commerce platform and bespoke tailoring atelier built with **React 19**, **Express 5**, **MongoDB**, and **JWT Authentication**.

---

## ⚡ Deployment Options (Deploy Today)

### Option 1: Full-Stack Deployment on Render (Recommended — Free & Easiest)
Render can run both the Express backend and serve the production React frontend from a single web service.

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete production ready kloth.fashion store"
   git branch -M main
   git remote add origin https://github.com/<your-username>/kloth-fashion.git
   git push -u origin main
   ```
2. **Create a Web Service on [Render](https://render.com)**:
   - Click **New +** → **Web Service** → Select your GitHub repository.
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm --prefix urbanthread-ai install && npm --prefix urbanthread-ai/server install && npm --prefix urbanthread-ai/client install && npm --prefix urbanthread-ai run build
     ```
   - **Start Command**:
     ```bash
     npm --prefix urbanthread-ai/server start
     ```
3. **Set Environment Variables on Render**:
   | Variable | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode |
   | `PORT` | `10000` | Port provided by Render |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI (or leave blank to use the built-in resilient localStore) |
   | `JWT_SECRET` | `0ca4125f6cfdedcca6b76b7f84bf308e372db93ec80354b1f1887b75940c7712273ccf55fe41f59fe2f188cb169679dd` | 32+ character random secret |
   | `ADMIN_EMAIL` | `palkirtan663@gmail.com` | Store Owner Admin email |
   | `ADMIN_PASSWORD` | `UrbanThread@2026!` | Admin password |
   | `AUTO_SEED_PRODUCTS` | `true` | Seeds the 50+ piece catalogue on first boot |

4. Click **Deploy Web Service**. Render builds the React app, starts Express, and your website is live!

---

### Option 2: Frontend on Vercel + Backend on Render/Railway
If you prefer hosting the client on [Vercel](https://vercel.com):

1. **Import your GitHub repository to Vercel**.
2. **Root Directory**: Select `urbanthread-ai/client` (or leave default root with the pre-configured `vercel.json`).
3. **Framework Preset**: `Vite`
4. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://<your-backend-service>.onrender.com/api`
5. Click **Deploy**.

---

## 💻 Local Quick Start (Windows / Mac / Linux)

### 1. Requirements
- **Node.js 20.19+** or **Node.js 22+**
- MongoDB (Optional — if no MongoDB is connected, the resilient built-in `localStore` database activates automatically)

### 2. Setup & Installation
Open PowerShell or Terminal in the project root:

```powershell
# 1. Install all dependencies (root, server & client)
npm run setup

# 2. Build the production React frontend bundle
npm run build

# 3. Start local development (API on 5000 + Website on 5173)
npm run dev
```

Open your browser at: <http://localhost:5173>

---

## 🔑 Default Credentials & Quick Login

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Store Owner / Admin** | `palkirtan663@gmail.com` | `UrbanThread@2026!` | Full Executive Admin Dashboard (Orders, Products, Banners, Support, Users, Bespoke Quotes) |
| **System Admin** | `admin@urbanthread.com` | `UrbanThread@2026!` | Full Admin Panel & Catalogue Editor |
| **Verified Customer** | `customer@kloth.fashion` | `Customer@123` | Cart, Checkout, Wishlist, Order Tracking, Bespoke Requests |
| **Guest Explorer** | *(No credentials needed)* | *(Click "Explore as Guest")* | Instant browsing of all 50+ pieces, categories, filters & style assistant |

---

## 🌟 Key Features

- **Full-Stack Architecture**: React 19 (Vite, Lucide icons, responsive CSS), Express 5 API with CORS, rate-limiting, and error handling.
- **Database & Offline Resilience**: Dual-mode engine supporting MongoDB Atlas cloud clusters with seamless automatic fallback to `localStore` so your site never goes down.
- **50+ Curated Gen-Z Streetwear Pieces**: High-resolution imagery, waffle-knit boxy tees, double-brushed grunge flannels, curved architectural barrel jeans, parachute balloon pants, and bespoke accessories.
- **Bespoke Atelier Custom Clothing**: Customers can submit custom garment descriptions, select fabrics, and upload reference design photos for tailor-made quotes.
- **Live Order Tracking & Returns**: Doorstep tracking with tracking numbers (e.g. `KLOTH-XXXXXX`), downloadable tax invoices, and doorstep return/exchange workflow.
- **AI Stylist Assistant**: Intelligent fashion assistant recommending fits, silhouettes, and budgets with 1-click add-to-bag recommendations.
- **Executive Admin Dashboard**: Real-time sales stats, order status management, inventory restocking, banner updates, customer support ticketing, and user role management.
