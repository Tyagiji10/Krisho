import './config/env.js';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './config/firebaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(compression()); // Compress all responses
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Caching Middleware for API
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    // Cache for 1 minute for public API reads
    res.set('Cache-Control', 'public, max-age=60');
  } else {
    // No cache for POST, PUT, DELETE
    res.set('Cache-Control', 'no-store');
  }
  next();
});

// Routes
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Database Connection
const PORT = process.env.PORT || 5000;

if (!db) {
  console.log('⚠️  WARNING: Firestore DB not initialized. Check your Firebase credentials in .env');
} else {
  console.log('✅ Firestore Database Ready');
}

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
if (!process.env.VERCEL) {

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'frontend/dist')));

    app.get('/*splat', (req, res) =>
      res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'))
    );
  } else {
    app.get('/', (req, res) => {
      res.send('API is running....');
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
