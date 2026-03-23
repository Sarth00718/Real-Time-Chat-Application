import express from 'express';
import dotenv from 'dotenv';
import connectDB  from './config/db.js';  
import userRoutes from './routes/userRoutes.js'; 
import messageRoutes from './routes/messageRoutes.js';
import messageReadRoutes from './routes/messageReadRoutes.js';
import messageDeleteRoutes from './routes/messageDeleteRoutes.js';
import messageReactionRoutes from './routes/messageReactionRoutes.js';
import messageEditRoutes from './routes/messageEditRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import groupMessageRoutes from './routes/groupMessageRoutes.js';
import messagePinRoutes from './routes/messagePinRoutes.js';
import messageForwardRoutes from './routes/messageForwardRoutes.js';
import voiceMessageRoutes from './routes/voiceMessageRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app , server} from './socket/socket.js';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();  

  const PORT = process.env.PORT || 3000;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);



  // middlewares

  app.use(express.urlencoded({extended:true, limit: '10mb'}));
  app.use(express.json({limit: '10mb'})); 
  app.use(cookieParser());
  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  // Security middleware
  import { 
    helmetConfig, 
    mongoSanitizeConfig, 
    hppConfig, 
    secureHeaders, 
    sanitizeInputs,
    requestSizeLimiter
  } from './middlewares/security.js';
  
  app.use(helmetConfig);
  app.use(mongoSanitizeConfig);
  app.use(hppConfig);
  app.use(secureHeaders);
  app.use(sanitizeInputs);
  app.use(requestSizeLimiter);
  
  // CORS configuration for handling cookies and credentials
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://real-time-chat-application-eosin.vercel.app/']
    : ['http://localhost:5173', 'http://localhost:5174'];

  const corsOption = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  app.use(cors(corsOption));

  // routes
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/message", messageRoutes);
  app.use("/api/v1/message", messageReadRoutes);
  app.use("/api/v1/message", messageDeleteRoutes);
  app.use("/api/v1/message", messageReactionRoutes);
  app.use("/api/v1/message", messageEditRoutes);
  app.use("/api/v1/profile", profileRoutes);
  app.use("/api/v1/ai", aiRoutes);
  app.use("/api/v1/group", groupRoutes);
  app.use("/api/v1/group/message", groupMessageRoutes);
  app.use("/api/v1/message", messagePinRoutes);
  app.use("/api/v1/message", messageForwardRoutes);
  app.use("/api/v1/message", voiceMessageRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  //localhost
  const startServer = async () => {
    try {
      await connectDB();
      server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
