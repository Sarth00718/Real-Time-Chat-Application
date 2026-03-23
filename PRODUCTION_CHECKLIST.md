# ✅ Production Deployment Checklist

Use this checklist before deploying to production.

## 🔧 Backend Configuration

- [ ] **Environment Variables Set**
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI` (MongoDB Atlas connection string)
  - [ ] `JWT_SECRET` (minimum 32 characters, random string)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `GROQ_API_KEY` (optional, for AI features)
  - [ ] `FRONTEND_URL` (your Vercel frontend URL)

- [ ] **CORS Configuration**
  - [ ] Updated `allowedOrigins` in `backend/index.js` with production frontend URL
  - [ ] Updated `allowedOrigins` in `backend/socket/socket.js` with production frontend URL
  - [ ] No trailing slashes in URLs

- [ ] **Database**
  - [ ] MongoDB Atlas cluster is running
  - [ ] Database user created with read/write permissions
  - [ ] IP whitelist configured (0.0.0.0/0 for cloud deployments)
  - [ ] Connection string tested

- [ ] **File Uploads**
  - [ ] Cloudinary account active
  - [ ] API credentials verified
  - [ ] Upload folder permissions set (if using local storage)

- [ ] **Security**
  - [ ] JWT_SECRET is strong and unique
  - [ ] No sensitive data in git repository
  - [ ] `.env` files are in `.gitignore`
  - [ ] Security middleware enabled (helmet, mongoSanitize, hpp)

## 🎨 Frontend Configuration

- [ ] **Environment Variables Set**
  - [ ] `VITE_BASE_URL` (your backend URL from Render/Railway)

- [ ] **Build Configuration**
  - [ ] `vite.config.js` properly configured
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`

- [ ] **API Integration**
  - [ ] `BASE_URL` in `constants.js` uses environment variable
  - [ ] All API endpoints point to production backend

## 🚀 Deployment Steps

- [ ] **Backend Deployed**
  - [ ] Deployed to Render/Railway
  - [ ] Health check endpoint working (`/health`)
  - [ ] Logs show no errors
  - [ ] Backend URL copied

- [ ] **Frontend Deployed**
  - [ ] Deployed to Vercel
  - [ ] Environment variables set
  - [ ] Build successful
  - [ ] Frontend URL copied

- [ ] **CORS Updated**
  - [ ] Backend CORS updated with actual frontend URL
  - [ ] Socket.IO CORS updated with actual frontend URL
  - [ ] Changes committed and pushed
  - [ ] Backend redeployed

## 🧪 Testing

- [ ] **Authentication**
  - [ ] User registration works
  - [ ] User login works
  - [ ] JWT token is stored
  - [ ] Protected routes require authentication
  - [ ] Logout works

- [ ] **Real-Time Features**
  - [ ] Socket.IO connection established
  - [ ] Messages send in real-time
  - [ ] Online/offline status updates
  - [ ] Typing indicators work
  - [ ] Message read receipts work

- [ ] **File Uploads**
  - [ ] Profile photo upload works
  - [ ] Message file attachments work
  - [ ] Files are stored in Cloudinary
  - [ ] File size limits enforced

- [ ] **Group Chat**
  - [ ] Create group works
  - [ ] Add members works
  - [ ] Send group messages works
  - [ ] Leave group works

- [ ] **AI Features** (if enabled)
  - [ ] AI chat responds
  - [ ] Streaming works (if implemented)
  - [ ] Error handling for rate limits

- [ ] **Cross-Browser Testing**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

- [ ] **Mobile Testing**
  - [ ] Responsive design works
  - [ ] Touch interactions work
  - [ ] Mobile keyboard doesn't break layout

## 📊 Monitoring

- [ ] **Backend Monitoring**
  - [ ] Render/Railway logs accessible
  - [ ] Error tracking set up
  - [ ] Health check endpoint monitored

- [ ] **Frontend Monitoring**
  - [ ] Vercel deployment logs accessible
  - [ ] Console errors checked
  - [ ] Network requests monitored

## 🔒 Security Review

- [ ] **Sensitive Data**
  - [ ] No API keys in frontend code
  - [ ] No passwords in git history
  - [ ] `.env` files not committed

- [ ] **API Security**
  - [ ] Rate limiting enabled
  - [ ] Input validation on all endpoints
  - [ ] SQL/NoSQL injection protection
  - [ ] XSS protection enabled

- [ ] **Authentication**
  - [ ] Passwords hashed with bcrypt
  - [ ] JWT tokens expire appropriately
  - [ ] Secure cookie settings

## 📝 Documentation

- [ ] **README Updated**
  - [ ] Live demo links updated
  - [ ] Installation instructions accurate
  - [ ] Environment variables documented

- [ ] **Deployment Guide**
  - [ ] Step-by-step instructions provided
  - [ ] Troubleshooting section complete
  - [ ] Contact information updated

## 🎉 Go Live

- [ ] All checklist items completed
- [ ] Final testing done
- [ ] Team notified
- [ ] Users can access the application

---

## 🐛 Post-Deployment

After deployment, monitor for:

- [ ] Error rates in logs
- [ ] Response times
- [ ] User feedback
- [ ] Database performance
- [ ] API rate limits

---

## 📞 Emergency Contacts

- **Developer**: Sarth Narola (sarthnarola007@gmail.com)
- **MongoDB Support**: https://support.mongodb.com/
- **Vercel Support**: https://vercel.com/support
- **Render Support**: https://render.com/docs/support

---

**Last Updated**: March 2026
