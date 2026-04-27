import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/krisho';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('🔗 User connected:', socket.id);

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    console.log(`👤 User ${userData.name} joined personal room`);
    socket.emit('connected');
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`📦 Joined order room: ${roomId}`);
  });

  socket.on('new_order', (order) => {
    // Notify the supplier
    if (order.supplier) {
      socket.in(order.supplier).emit('order_received', order);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Check DB connection status after a delay
  setTimeout(() => {
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  WARNING: MongoDB not connected. System will use Mock Data for testing.');
    }
  }, 5000);
});
