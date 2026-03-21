# Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js, Express, MongoDB, and Socket.IO.

## Features

- Real-time messaging with Socket.IO
- User authentication with JWT
- File sharing (images, documents, videos)
- Online/offline user status
- Profile avatars
- Secure cookie-based authentication

## Tech Stack

### Frontend
- React 18
- Redux Toolkit for state management
- Socket.IO Client
- Axios for API calls
- TailwindCSS + DaisyUI for styling
- Vite for build tooling

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- Cloudinary for file storage
- Multer for file uploads

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory (use `.env.example` as template):
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your_strong_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_BASE_URL=http://localhost:3000
```

## Running the Application

### Development Mode

1. Start MongoDB (if running locally)
```bash
mongod
```

2. Start the backend server
```bash
cd backend
npm run dev
```

3. Start the frontend development server
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in your environment
2. Update CORS origins in the code to match your production frontend URL
3. Use a production MongoDB instance (MongoDB Atlas recommended)
4. Set strong JWT_SECRET
5. Run: `npm start`

### Frontend
1. Update `VITE_BASE_URL` to your production backend URL
2. Build: `npm run build`
3. Deploy the `dist` folder to your hosting service

## API Endpoints

### Authentication
- `POST /api/v1/user/register` - Register new user
- `POST /api/v1/user/login` - Login user
- `GET /api/v1/user/logout` - Logout user
- `GET /api/v1/user/` - Get other users (authenticated)

### Messages
- `POST /api/v1/message/send/:id` - Send message to user
- `GET /api/v1/message/:id` - Get messages with user

### Health Check
- `GET /health` - Server health status

## Security Features

- HTTP-only cookies for JWT tokens
- Password hashing with bcrypt
- CORS configuration
- File type validation
- File size limits (10MB per file, max 5 files)
- Environment-based security settings

## Project Structure

```
├── backend/
│   ├── config/          # Database and Cloudinary config
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Auth and file upload middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── socket/          # Socket.IO configuration
│   └── index.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hook/        # Custom hooks
│   │   ├── redux/       # Redux store and slices
│   │   └── main.jsx     # Entry point
│   └── public/          # Static assets
└── README.md
```

## License

ISC
