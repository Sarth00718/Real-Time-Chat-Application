  import express from 'express';
  import dotenv from 'dotenv';
  import connectDB  from './config/db.js';  
  import userRoutes from './routes/userRoutes.js'; 
  import messageRoutes from './routes/messageRoutes.js';
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

  app.use(express.urlencoded({extended:true}));
  app.use(express.json()); 
  app.use(cookieParser());
  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  const corsOption={
      origin:'https://real-time-chat-application-two-smoky.vercel.app',
    //origin: 'http://localhost:5173',
      credentials:true
  };
  app.use(cors(corsOption)); 

  // routes
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/message", messageRoutes);

  //localhost
  server.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
  });
