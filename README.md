# 🚀 Krisho: Empowering Farmers with Digital Marketplaces

Krisho is a full-stack digital marketplace designed to connect Indian farmers directly with consumers. By eliminating middlemen, the platform ensures fair prices for farmers and fresh produce for consumers.

## ✨ Key Features

- **Dual-Role Marketplace**: Specialized experiences for both Suppliers (Farmers) and Consumers.
- **Supplier Dashboard**: Real-time sales analytics, stock management, and demand tracking.
- **Consumer Marketplace**: Premium UI with advanced search, category filters, and seamless navigation.
- **Real-time Capabilities**: Instant notifications for orders and stock updates via Socket.io.
- **Modern Tech Stack**: Built with React, Node.js, Express, and MongoDB.
- **Premium Design**: Responsive glassmorphism UI with Tailwind CSS v4 and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS v4, Lucide React, Framer Motion.
- **Backend**: Node.js, Express.js, Socket.io.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT (JSON Web Tokens).
- **Styling**: Modern CSS-first approach with Tailwind.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)

### Setup

1. **Clone the repository**
2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/krisho
   JWT_SECRET=your_jwt_secret
   ```
4. **Seed the Database**:
   ```bash
   npm run data:import
   ```
5. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```
6. **Run the Application**:
   - Backend: `npm run dev` (in /backend)
   - Frontend: `npm run dev` (in /frontend)

## 📸 Screenshots

*(Add screenshots here after deployment)*

## 📄 License

This project is licensed under the MIT License.
