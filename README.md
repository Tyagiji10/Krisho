# Krisho: Bharat's Direct Farm-to-Table Marketplace 🌱

**Krisho** is a revolutionary agricultural platform designed to empower Indian farmers by eliminating predatory middlemen and creating a direct bridge to consumers. By combining cutting-edge AI, real-time communication, and multilingual accessibility, Krisho ensures that every farmer—regardless of their technical expertise—can bring their produce to a nationwide market.

---

## 🛑 The Problems We Solve
*   **Middlemen Exploitation:** Eliminates the chain of intermediaries that drain farmer profits and inflate consumer prices.
*   **Fair Price Discovery:** Farmers set their own prices based on market trends and produce quality.
*   **Rural Accessibility Gap:** Modern e-commerce is often difficult for rural users. Krisho bridges this with **Voice-Guided Navigation** and **Multilingual Support**.
*   **Produce Wastage:** Direct farm-to-consumer connections ensure faster sales and fresher produce, drastically reducing spoilage.

---

## ✨ Key Features

### 🚜 Dual-Role Ecosystem
*   **Supplier (Farmer) Portal:** A comprehensive "Command Center" for farmers to manage their Digital Mandi, track earnings with visual analytics, and process incoming orders in real-time.
*   **Consumer Marketplace:** A streamlined shopping experience for buyers to browse fresh produce, filter by proximity, and support local agriculture.

### 💬 Real-Time Negotiation & Chat
*   **Instant Messaging:** Direct communication channel between buyers and farmers using **Socket.io**.
*   **Smart History:** Optimized Firestore message persistence allowing users to pick up conversations right where they left off.

### ⭐ Supplier Trust & Reviews
*   **Verified Feedback:** Customers can leave ratings and detailed reviews for products in their order history.
*   **Reputation Management:** Farmers can view and respond to customer feedback directly from their dashboard to build trust in the community.

### 🎙️ Multilingual Voice Instructor
Designed for maximum accessibility, Krisho includes a built-in **Voice Guide** that explains every section of the app.
*   **Automatic Localization:** Switches between **English** and **Hindi** based on user preference.
*   **Context-Aware:** Provides helpful instructions for the specific page the user is on.

### 🤖 AI Agricultural Assistant (Gemini Powered)
*   **Language-Aware AI:** Automatically detects and responds in the user's preferred language (Hindi/English).
*   **Smart Categorization:** AI helps farmers automatically categorize their products (Grains, Fruits, Vegetables) based on product names.

### 💳 Secure Transaction Engine
*   **Razorpay Integration:** Secure, encrypted payments with automated order reconciliation.
*   **JWT Security:** Industry-standard **JSON Web Tokens** ensure that user sessions and sensitive data (earnings, profile) are fully protected.

---

## 🛠️ Technology Stack

### **Frontend**
*   **React 19 & Vite:** The core UI framework for high performance.
*   **Tailwind CSS (v4):** Modern, premium styling with a "Glassmorphic" aesthetic.
*   **Redux Toolkit:** Global state management for authentication, cart, and marketplace data.
*   **Framer Motion:** Fluid animations and micro-interactions.

### **Backend**
*   **Node.js & Express:** Robust server-side logic and RESTful API.
*   **Firebase Admin & Firestore:** Scalable NoSQL cloud database with optimized in-memory sorting for real-time performance.
*   **Cloudinary:** High-speed Content Delivery Network (CDN) for optimized product and profile image management.
*   **Performance Caching:** Custom Express middleware to reduce server load and improve page speeds for product listings and reviews.

---

## 🚀 Getting Started

1.  **Clone the Repository**
2.  **Install Dependencies:**
    ```bash
    npm install          # Root and Backend dependencies
    cd frontend && npm install
    ```
3.  **Environment Setup:**
    Create a `.env` file in the `/backend` directory with:
    *   `JWT_SECRET`: Your private encryption key.
    *   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
    *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
    *   `RAZORPAY_KEY_ID`, `GEMINI_API_KEY`
4.  **Run Locally:**
    ```bash
    npm run dev
    ```

---

**Developed with ❤️ for Bharat's Farmers.**
