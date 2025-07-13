# 💬 MERN Chat Application

A real-time chat application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and **Socket.IO** for seamless instant messaging and a responsive UI.

---

## 🔧 Key Features

- ✅ Real-time messaging with WebSocket communication via Socket.IO  
- ✅ Secure user authentication using JWT (JSON Web Tokens)  
- ✅ Typing indicators, timestamps, and read receipts  
- ✅ Clean, responsive UI built with Tailwind CSS  
- ✅ Global state management using Redux Toolkit  

---

## 🧠 Tech Stack

### 🔹 Frontend
- React.js  
- Redux Toolkit  
- Tailwind CSS  
- Socket.IO Client  

### 🔹 Backend
- Node.js  
- Express.js  
- Socket.IO Server  
- MongoDB (via Mongoose)  

### 🔹 Authentication
- JSON Web Tokens (JWT)  

### 🔹 Database
- MongoDB Atlas  

---

## 📦 How It Works

1. **Backend handles:**
   - User authentication and session management  
   - Real-time WebSocket connections  
   - Message storage and retrieval  

2. **Frontend connects via:**
   - REST APIs for login, registration, and fetching messages  
   - Socket.IO client for real-time data exchange  

3. **MongoDB** stores all user and message data and syncs it on login or refresh.  

---

## 🚀 Getting Started

## ⚙️ Installation

1. 📁 Clone the Repository
   ```bash
   git clone https://github.com/Sarth00718/CHAT-APP-MERN.git
   cd CHAT-APP-MERN

2. 🧱 Install Dependencies
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   
3. 🛠️ Configure Environment Variables
   Create a .env file inside the backend/ directory and add:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret

4. ▶️ Run the Application
   In two separate terminals:
  # Terminal 1 - Start Backend
    cd backend
    npm run dev
   # Terminal 2 - Start Frontend
     cd frontend
     npm run dev
---

## 📌 Notes

- Make sure **MongoDB Atlas** is set up and your connection string is correct.
- Ensure ports `5173` (frontend) and `3000` (backend) are free and not blocked by firewalls.
- For localhost set below part in main.jsx -> backend url and index.js -> frontend url
- **Frontend** runs on: [`http://localhost:5173`](http://localhost:5173)  
- **Backend** runs on: [`http://localhost:3000`](http://localhost:3000)

---

## 🔒 Authentication

JWT tokens are used to secure endpoints.

**Auth flow:**

1. User signs up or logs in.  
2. Server returns a signed JWT.  
3. JWT is stored in `localStorage` and sent with future requests.

---

## 📦 Sample `.env` File
    #Set these
    PORT=3000
    MONGO_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/chatapp
    JWT_SECRET=supersecretkey123
    
## 🛠️ Troubleshooting

If you encounter any issues:

1. **MongoDB Connection Errors**:
   - Ensure your MongoDB Atlas cluster is running and accessible
   - Verify your connection string in the .env file uses MONGO_URI (not MONGODB_URI)
   - Check network connectivity to MongoDB Atlas

2. **JWT Authentication Issues**:
   - Ensure your JWT_SECRET in the .env file matches the one used in the code
   - Clear your browser cookies and localStorage if you experience login issues

3. **Socket.IO Connection Problems**:
   - Verify that frontend URL in socket.js matches your actual frontend URL
   - Check that ports 3000 (backend) and 5173 (frontend) are available and not blocked

4. **CORS Errors**:
   - The application has CORS configured in socket.js, ensure the origin URLs match your setup

5. **Package Version Conflicts**:
   - If you encounter dependency issues, try running `npm install` again in both folders

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 💡 Author

Made with 💙 by **Sarth**  
📧 [sarthnarola@chatapp.com](mailto:sarthnarola@chatapp.com)  
🌐 Surat, Gujarat, India
