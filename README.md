# Krisho: Empowering Indian Farmers 🌱

**Krisho** is a comprehensive, full-stack agricultural marketplace designed to eliminate middlemen by directly connecting farmers (Suppliers) with buyers (Consumers). This ensures better profit margins for farmers and fresher produce for consumers.

---

## 🛠️ Technology Stack

This project uses a modern JavaScript ecosystem, split into a highly responsive frontend and a robust real-time backend.

### **Frontend (User Interface)**
- **React 19 & Vite**: Blazing fast rendering and development environment.
- **Tailwind CSS (v4)**: Utility-first CSS framework for a premium, responsive, and modern UI design.
- **Redux Toolkit**: Centralized state management for user authentication, cart logic, and product data.
- **Framer Motion**: Smooth micro-animations and page transitions to provide a dynamic user experience.
- **React Router (v7)**: Client-side routing for seamless navigation.
- **i18next**: Multi-language support to ensure the app is accessible to diverse users across India.
- **Axios**: HTTP client for communicating with the backend API.

### **Backend (Server & API)**
- **Node.js & Express v5**: Core server environment with the latest Express version for robust API routing.
- **Socket.io**: WebSockets for **real-time bi-directional communication**.
- **Razorpay**: Integrated payment gateway for secure checkout and transactions.
- **Google Generative AI (Gemini)**: AI integration to provide intelligent assistance and insights.
- **Cloudinary**: Cloud-based image management for fast and optimized product image uploads.
- **JSON Web Tokens (JWT)**: Secure, stateless session management.

### **Database & Authentication**
- **Firebase Firestore**: Scalable NoSQL cloud database used to store users, products, and orders.
- **Firebase Authentication**: Handles secure user sign-ups, logins, and Google Pop-up authentication.

---

## ✨ Core Features & In-Depth Explanation

### 1. Dual-Role System (Suppliers & Consumers)
The platform dynamically adjusts based on the user's role:
- **Suppliers (Farmers)**: Get access to a dedicated dashboard where they can add new products, manage inventory, view earnings, and process incoming orders.
- **Consumers (Buyers)**: Get a marketplace view to browse produce, add items to the cart, and proceed to a secure multi-step checkout.

### 2. Real-Time Order Notifications (Socket.io)
When a consumer places an order, the system doesn't just save it to the database. It uses `Socket.io` to instantly "push" a live notification to the specific Supplier's dashboard. This allows farmers to see new orders immediately without needing to refresh the page.

### 3. Integrated Payment Processing
The checkout process utilizes **Razorpay**. It supports a two-step payment process, calculating totals, taxes, and dynamic delivery thresholds (e.g., free delivery over a certain amount) before securely processing the transaction.

### 4. AI-Powered Assistance
Integrated with the **Google Gemini API**, the platform includes AI features (`/api/ai` routes) to assist users—potentially offering crop advice, market trends, or automated support directly within the app.

### 5. Seamless Media Uploads
When a supplier adds a picture of their crop, the image is securely uploaded to **Cloudinary** via `multer` middleware. Cloudinary optimizes the image and returns a fast CDN link, which is then saved to the Firestore database.

---

## 🚀 Deployment Architecture (Render)

The project is currently deployed as a **Unified Full-Stack Application on Render.com**.

### **How it Works in Production:**
1. **The Build Step (`npm run build`)**: When code is pushed to GitHub, Render automatically triggers a build script. This script installs the frontend dependencies and uses Vite to compile the React code into highly optimized, static HTML/CSS/JS files inside the `frontend/dist` folder.
2. **The Server (`node backend/server.js`)**: Render boots up the Node.js Express server.
3. **API Routing**: Any request to `https://krisho.onrender.com/api/...` is intercepted by the Express router and handled by the backend logic (fetching database info, processing payments, etc).
4. **Static Serving**: Any other request (like visiting the homepage or a product page) is caught by a special Express 5 route (`app.get('/*splat')`), which serves the compiled React frontend files.
5. **No Sleep Mode**: Because it is hosted as a persistent Web Service on Render, the server stays alive, ensuring that the WebSockets (`Socket.io`) remain connected for real-time features.

---

## 📂 Project Structure Overview

* `/backend`
  * `/controllers` - Contains the business logic (Products, Users, Orders).
  * `/routes` - Maps API URLs to their respective controllers.
  * `/middleware` - Security layers (JWT verification, Role checking).
  * `/config` - Firebase Admin SDK initialization.
  * `server.js` - The main entry point for the entire application.
* `/frontend`
  * `/src/pages` - All React screens (Home, Login, Dashboard, Marketplace).
  * `/src/components` - Reusable UI elements (Navbars, Buttons, Product Cards).
  * `/src/store` - Redux Toolkit configuration and slices.
  * `package.json` - Frontend dependencies and Vite scripts.
* `package.json` (Root) - Contains the master deployment scripts for Render.
