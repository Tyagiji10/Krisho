# Krisho: Bharat's Direct Farm-to-Table Marketplace 🌱

**Krisho** is a revolutionary agricultural platform designed to empower Indian farmers by eliminating predatory middlemen and creating a direct bridge to consumers. By combining cutting-edge AI, real-time communication, and multilingual accessibility, Krisho ensures that every farmer—regardless of their technical expertise—can bring their produce to a nationwide market.

---

## 🛑 The Problems We Solve
*   **Middlemen Exploitation:** Eliminates the chain of intermediaries that drain farmer profits and inflate consumer prices.
*   **Fair Price Discovery:** Farmers set their own prices based on market trends and produce quality.
*   **Rural Accessibility Gap:** Modern e-commerce is often difficult for rural users. Krisho bridges this with **Voice-Guided Navigation** and **Multilingual Support**.
*   **Produce Wastage:** Direct connections ensure faster sales and fresher produce, reducing the time from farm to table.

---

## ✨ Key Features

### 🚜 Dual-Role Ecosystem
*   **Supplier (Farmer) Portal:** A comprehensive "Command Center" for farmers to manage their Digital Mandi, track earnings with visual analytics, and process incoming orders in real-time.
*   **Consumer Marketplace:** A streamlined shopping experience for buyers to browse fresh produce, filter by proximity, and support local agriculture.

### 🎙️ Multilingual Voice Instructor
Designed for maximum accessibility, Krisho includes a built-in **Voice Guide** that explains every section of the app.
*   **Automatic Localization:** Switches between **English** and **Hindi** (and more) based on user preference.
*   **Context-Aware:** Provides helpful instructions for the specific page the user is on (e.g., explaining how to add a product or how to checkout).

### 🤖 AI Agricultural Assistant (Gemini Powered)
An intelligent AI helper that assists farmers and consumers alike.
*   **Auto-Voice Integration:** Automatically sends your voice query to the AI as soon as you stop speaking.
*   **Language-Aware AI:** Automatically detects and responds in the user's preferred language (Hindi/English).
*   **Expert Advice:** Provides crop advice, pricing strategies, and market insights.

### 📍 Digital Mandi & Smart Search
*   **Location-Aware Discovery:** Automatically refreshes products based on the user's city and state.
*   **Smart Suggestions:** Predictive search for grains, vegetables, and fruits with high-performance filtering.

### 💳 Secure Transaction Engine
*   **Multi-Step Checkout:** A premium, state-aware checkout flow with dynamic delivery thresholds.
*   **Razorpay Integration:** Secure, encrypted payments with automated order reconciliation.
*   **Real-time Notifications:** Uses **Socket.io** to push live order alerts to suppliers instantly.

### ❤️ Personalized Wishlist
*   **Instant Feedback:** Optimistic UI updates provide immediate visual confirmation when saving favorite products.
*   **Cloud Persistence:** Wishlist data is securely synced with the Firestore backend, ensuring lists are preserved across all devices.
*   **Seamless Integration:** Quick-access "My Wishlist" portals embedded directly into the main navigation and profile dashboards.

---

## 🛠️ Technology Stack

### **Frontend**
*   **React 19 & Vite:** The core UI framework for high performance.
*   **Tailwind CSS (v4):** Modern, premium styling with a "Glassmorphic" aesthetic.
*   **Redux Toolkit:** State management for auth, cart, and marketplace data.
*   **Framer Motion:** Fluid animations and page transitions.
*   **i18next:** Comprehensive localization system.

### **Backend**
*   **Node.js & Express:** Robust server-side logic and RESTful API.
*   **Firebase Admin & Firestore:** Scalable NoSQL cloud database used to store users, products, and orders.
*   **Firebase Authentication:** Handles secure user sign-ups, logins, and Google Pop-up authentication.
*   **Socket.io:** Real-time bi-directional messaging for live notifications.
*   **Google Gemini AI:** Powering the agricultural intelligence engine.
*   **Razorpay SDK:** Seamless payment gateway integration.
*   **Cloudinary:** Optimized CDN for product image management.

---

## 📂 Project Structure
*   `/backend` - Express server, Firestore controllers, AI logic, and socket notification system.
*   `/frontend` - React source code, Redux store, and i18n translation resources.
*   `/artifacts` - Design assets and implementation documentation.

---

## 🚀 Getting Started

1.  **Clone the Repository**
2.  **Install Dependencies:**
    ```bash
    npm install          # Root dependencies
    cd frontend && npm install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the `/backend` directory with:
    *   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `RAZORPAY_KEY_ID`, `GEMINI_API_KEY`, etc.
4.  **Run Locally:**
    ```bash
    npm run dev
    ```

---

## 🗺️ Future Roadmap
*   **Regional Language Expansion:** Adding Marathi, Telugu, and Punjabi voice support.
*   **Logistics Integration:** Partnering with rural transport services for automated delivery tracking.
*   **Community Forums:** A space for farmers to share knowledge and crop-rotation tips.

---

**Developed with ❤️ for Bharat's Farmers.**
