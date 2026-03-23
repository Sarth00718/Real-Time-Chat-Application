# 🚀 Deployment Guide

This guide will help you deploy the Real-Time Chat Application to production.

## 📋 Prerequisites

- GitHub account
- Vercel account (for frontend)
- Render/Railway account (for backend)
- MongoDB Atlas account (for database)
- Cloudinary account (for image uploads)
- Groq API key (optional, for AI features)

---

## 🗄️ Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Choose password authentication
   - Save username and password
4. Whitelist IP addresses:
   - Go to Network Access
   - Add IP Address
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
5. Get connection string:
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

---

## ☁️ Step 2: Setup Cloudinary

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to Dashboard
4. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

---

## 🤖 Step 3: Setup Groq API (Optional)

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up for an account
3. Go to API Keys
4. Create a new API key
5. Copy the API key

---

## 🔧 Step 4: Deploy Backend (Render)

### Option A: Using Render Dashboard

1. Go to [Render](https://render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `chat-app-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GROQ_API_KEY=your_groq_api_key (optional)
   GROQ_MODEL=mixtral-8x7b-32768
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

6. Click "Create Web Service"
7. Wait for deployment to complete
8. Copy your backend URL (e.g., `https://your-app.onrender.com`)

### Option B: Using Railway

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add the same environment variables as above
5. Set root directory to `backend`
6. Deploy

---

## 🎨 Step 5: Deploy Frontend (Vercel)

### Option A: Using Vercel Dashboard

1. Go to [Vercel](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_BASE_URL=https://your-backend-url.onrender.com
   ```

6. Click "Deploy"
7. Wait for deployment to complete
8. Copy your frontend URL

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variable
vercel env add VITE_BASE_URL
# Enter: https://your-backend-url.onrender.com
```

---

## 🔄 Step 6: Update CORS Settings

After deploying both frontend and backend:

1. Update backend CORS settings in `backend/index.js`:
   ```javascript
   const allowedOrigins = process.env.NODE_ENV === 'production' 
     ? ['https://your-actual-frontend-url.vercel.app']
     : ['http://localhost:5173', 'http://localhost:5174'];
   ```

2. Update Socket.IO CORS in `backend/socket/socket.js`:
   ```javascript
   const allowedOrigins = process.env.NODE_ENV === 'production'
     ? ['https://your-actual-frontend-url.vercel.app']
     : ['http://localhost:5173', 'http://localhost:5174'];
   ```

3. Commit and push changes:
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push origin main
   ```

4. Redeploy backend on Render (it will auto-deploy on push)

---

## ✅ Step 7: Verify Deployment

### Test Backend

1. Visit `https://your-backend-url.onrender.com/health`
2. You should see: `{"status":"OK","timestamp":"..."}`

### Test Frontend

1. Visit your frontend URL
2. Try to register a new account
3. Login with the account
4. Send a message to test real-time functionality
5. Open in another browser/incognito to test with multiple users

---

## 🐛 Common Deployment Issues

### Issue 1: CORS Errors

**Symptom**: "Access to fetch blocked by CORS policy"

**Solution**:
- Ensure frontend URL in backend CORS matches exactly (no trailing slash)
- Check environment variables are set correctly
- Redeploy backend after changes

### Issue 2: Socket.IO Connection Failed

**Symptom**: "WebSocket connection failed"

**Solution**:
- Verify backend URL in frontend .env
- Check Socket.IO CORS settings match frontend URL
- Ensure backend is running and accessible

### Issue 3: MongoDB Connection Error

**Symptom**: "MongoServerError: Authentication failed"

**Solution**:
- Verify MongoDB connection string is correct
- Check database user credentials
- Ensure IP whitelist includes 0.0.0.0/0
- Check if special characters in password are URL-encoded

### Issue 4: JWT Authentication Errors

**Symptom**: "Invalid token" or "Token expired"

**Solution**:
- Ensure JWT_SECRET is at least 32 characters
- Same JWT_SECRET must be used across all backend instances
- Clear browser cookies and localStorage

### Issue 5: Cloudinary Upload Fails

**Symptom**: "Upload failed" or "Invalid credentials"

**Solution**:
- Verify Cloudinary credentials are correct
- Check API key has upload permissions
- Ensure file size is within limits

### Issue 6: AI Features Not Working

**Symptom**: "AI service not configured"

**Solution**:
- Add GROQ_API_KEY to backend environment variables
- Verify API key is valid
- Check Groq API quota/limits

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change JWT_SECRET to a strong random string (min 32 chars)
- [ ] Use strong MongoDB password
- [ ] Enable MongoDB IP whitelist (or use 0.0.0.0/0 for cloud deployments)
- [ ] Keep API keys secure (never commit to git)
- [ ] Enable HTTPS (Vercel and Render provide this by default)
- [ ] Set NODE_ENV=production
- [ ] Review CORS settings
- [ ] Test authentication flow
- [ ] Test file upload limits
- [ ] Monitor error logs

---

## 📊 Monitoring

### Backend Logs (Render)

1. Go to your Render dashboard
2. Click on your web service
3. Go to "Logs" tab
4. Monitor for errors

### Frontend Logs (Vercel)

1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on latest deployment
5. Check "Functions" and "Runtime Logs"

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

1. Push changes to GitHub
2. Vercel and Render will automatically detect changes
3. They will rebuild and redeploy
4. Monitor deployment status in respective dashboards

---

## 📝 Environment Variables Summary

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapplication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=mixtral-8x7b-32768
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env)
```env
VITE_BASE_URL=https://your-backend.onrender.com
```

---

## 🎉 Success!

Your chat application should now be live and accessible to users worldwide!

**Frontend**: https://your-app.vercel.app  
**Backend**: https://your-api.onrender.com

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review deployment logs
3. Open an issue on GitHub
4. Contact: sarthnarola007@gmail.com

---

**Made with ❤️ by Sarth Narola**
