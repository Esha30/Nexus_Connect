import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import postRoutes from './routes/postRoutes.js';
import User from './models/User.js';
import { checkMaintenance } from './middleware/authMiddleware.js';

const app = express();

// Apply global maintenance mode check
app.use(checkMaintenance);

// AI Rate Limiter – 20 requests per 15 minutes per IP
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait before trying again.' }
});

// CORS – explicit origin whitelist
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://accounts.google.com", "https://www.gstatic.com", "https://unpkg.com", "'unsafe-eval'"],
      "frame-src": ["'self'", "https://accounts.google.com"],
      "connect-src": ["'self'", "http://localhost:5001", "http://127.0.0.1:5001", "ws://localhost:5001", "ws://127.0.0.1:5001", "https://accounts.google.com"],
      "img-src": ["'self'", "data:", "blob:", "http://localhost:5001", "http://127.0.0.1:5001", "https://*"],
      "worker-src": ["'self'", "blob:", "https://unpkg.com"], 
    },
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Custom NoSQL Injection Protection (Express 5 Compatible)
const deepSanitize = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (key.startsWith('$')) {
        delete obj[key];
      } else {
        deepSanitize(obj[key]);
      }
    });
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) deepSanitize(req.body);
  if (req.query) deepSanitize(req.query);
  if (req.params) deepSanitize(req.params);
  next();
});

// Stripe Webhook needs raw body - MUST be before express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Logic will be in the controller, but we need the route here to capture the raw body
  next();
});

app.use(express.json());

// Connect to MongoDB
connectDB();

// Global Request Logger for Debugging
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  const method = req.method;
  const path = req.originalUrl;
  console.log(`[REQ] ${new Date().toLocaleTimeString()} | ${method} ${path} | Auth: ${authHeader ? 'FOUND' : 'MISSING'}`);
  if (authHeader && !authHeader.startsWith('Bearer ')) {
    console.warn(`[WARN] Malformed Auth Header: ${authHeader}`);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/messages', checkFeatureToggle('messaging'), messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/deals', checkFeatureToggle('deals'), dealRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', checkFeatureToggle('aiMatching'), aiRateLimiter, aiRoutes);
app.use('/api/posts', postRoutes);

// Make uploads folder accessible
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/test-ping', (req, res) => {
  res.send('PONG - Verified Server');
});

// Global 404 Handler for debugging missing routes
app.use((req, res, next) => {
  console.log(`[404] ${req.method} ${req.url} - Not Found`);
  res.status(404).json({
    message: 'Route not found',
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

// Global 500 Error Handler
app.use((err, req, res, next) => {
  console.error(`[500] Error on ${req.method} ${req.url}:`, err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  transports: ['polling', 'websocket'] // Favor polling to avoid handshake timeouts
});

// Expose io to app for use in controllers
app.set('socketio', io);

// Map socket IDs to user IDs for online tracking
const socketUserMap = {};

// Socket.io Middleware (Basic Token Check Placeholder)
io.use((socket, next) => {
  // In a real production app, we would verify the JWT token here
  // For now, we allow connection but log for debugging
  const token = socket.handshake.auth.token;
  if (!token && process.env.NODE_ENV === 'production') {
    return next(new Error('Authentication error: Token missing'));
  }
  next();
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user coming online
  socket.on('user-online', async (userId) => {
    if (userId) {
      socketUserMap[socket.id] = userId;
      try {
        await User.findByIdAndUpdate(userId, {
          'profile.isOnline': true,
          'profile.lastActive': new Date()
        });
        // Broadcast online status to all connected clients
        socket.broadcast.emit('user-status-change', { userId, isOnline: true });
      } catch (err) {
        console.error('Error updating online status:', err.message);
      }
    }
  });

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
  });

  // Group Meeting Room Setup
  socket.on('join-meeting-room', (meetingId) => {
    const userId = socketUserMap[socket.id];
    if (!userId) return;
    
    socket.join(`meeting_${meetingId}`);
    // Notify others in identifying the new participant
    socket.to(`meeting_${meetingId}`).emit('participant-joined', userId);
    console.log(`User ${userId} joined meeting room: ${meetingId}`);
  });

  socket.on('leave-meeting-room', (meetingId) => {
    const userId = socketUserMap[socket.id];
    socket.leave(`meeting_${meetingId}`);
    socket.to(`meeting_${meetingId}`).emit('participant-left', userId);
  });
  
  socket.on('make-call', (payload) => {
    // payload: { target, signal, caller, callType }
    io.to(payload.target).emit('call-made', payload);
  });

  socket.on('answer-call', (payload) => {
    // payload: { target, signal }
    io.to(payload.target).emit('call-answered', payload);
  });
  
  socket.on('end-call', (payload) => {
    if (payload.target) {
      io.to(payload.target).emit('call-ended');
    }
  });

  socket.on('ice-candidate', (incoming) => {
    // incoming: { target, candidate, senderId }
    io.to(incoming.target).emit('ice-candidate', incoming);
  });

  // Messaging Setup
  socket.on('join-chat', (id) => {
    socket.join(id); // Join personal room matching user DB id
  });

  socket.on('send-message', (payload) => {
    // payload: { receiverId, senderId, content, id, timestamp, isRead }
    // Dispatch to receiver's personal listener room
    io.to(payload.receiverId).emit('receive-message', payload);
  });

  socket.on('typing', (payload) => {
    io.to(payload.receiverId).emit('typing', payload.senderId);
  });

  socket.on('stop-typing', (payload) => {
    io.to(payload.receiverId).emit('stop-typing', payload.senderId);
  });

  socket.on('delete-message', (payload) => {
    io.to(payload.receiverId).emit('message-deleted', payload.messageId);
  });

  socket.on('edit-message', (payload) => {
    // payload should contain { receiverId, message }
    io.to(payload.receiverId).emit('message-edited', payload.message);
  });

  socket.on('read-receipt', (payload) => {
    // Notify sender that their messages were read
    io.to(payload.senderId).emit('messages-read', { readerId: payload.readerId });
  });

  // Handle disconnect - set user offline
  socket.on('disconnect', async () => {
    const userId = socketUserMap[socket.id];
    if (userId) {
      delete socketUserMap[socket.id];
      // Check if user has other active connections
      const isStillConnected = Object.values(socketUserMap).includes(userId);
      if (!isStillConnected) {
        try {
          await User.findByIdAndUpdate(userId, {
            'profile.isOnline': false,
            'profile.lastActive': new Date()
          });
          // Broadcast offline status to all connected clients
          socket.broadcast.emit('user-status-change', { userId, isOnline: false });
        } catch (err) {
          console.error('Error updating offline status:', err.message);
        }
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app, httpServer, io };
