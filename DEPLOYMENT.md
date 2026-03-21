# Deployment Guide

## Production Checklist

### Backend Deployment

#### 1. Environment Variables
Set these environment variables in your production environment:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_strong_random_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=https://your-frontend-domain.com
```

#### 2. Update CORS Origins
In `backend/index.js` and `backend/socket/socket.js`, update the production origins:
```javascript
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:5173'];
```

#### 3. Database Setup
- Use MongoDB Atlas or another managed MongoDB service
- Ensure your database has proper indexes
- Set up database backups

#### 4. Deployment Platforms

##### Heroku
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
# ... set other env variables
git push heroku main
```

##### Railway
1. Connect your GitHub repository
2. Add environment variables in the dashboard
3. Deploy automatically on push

##### Render
1. Create a new Web Service
2. Connect your repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables

##### DigitalOcean/AWS/GCP
1. Set up a VM or container service
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies: `cd backend && npm install`
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start backend/index.js --name chat-backend
pm2 startup
pm2 save
```

### Frontend Deployment

#### 1. Environment Variables
Create `.env.production`:
```env
VITE_BASE_URL=https://your-backend-domain.com
```

#### 2. Build
```bash
cd frontend
npm run build
```

#### 3. Deployment Platforms

##### Vercel
```bash
# Install Vercel CLI
npm install -g vercel
cd frontend
vercel --prod
```

Or connect your GitHub repository in Vercel dashboard.

##### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

Or drag and drop the `dist` folder to Netlify dashboard.

##### GitHub Pages
Not recommended for this app due to routing requirements.

##### Cloudflare Pages
1. Connect your GitHub repository
2. Set build command: `cd frontend && npm run build`
3. Set build output directory: `frontend/dist`
4. Add environment variables

## Post-Deployment

### 1. Test All Features
- User registration and login
- Real-time messaging
- File uploads
- Online/offline status
- Logout functionality

### 2. Monitor
- Set up error logging (e.g., Sentry)
- Monitor server performance
- Check database connections
- Monitor file storage usage

### 3. Security
- Ensure HTTPS is enabled
- Verify CORS settings
- Check JWT secret strength
- Review file upload limits
- Enable rate limiting if needed

### 4. Backup
- Set up automated database backups
- Document recovery procedures
- Test restore process

## Troubleshooting

### CORS Issues
- Verify frontend URL in backend CORS configuration
- Check that credentials are set to true
- Ensure cookies are being sent with requests

### Socket.IO Connection Issues
- Verify WebSocket support on hosting platform
- Check Socket.IO CORS configuration
- Ensure frontend is connecting to correct backend URL

### File Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Ensure uploads directory exists and is writable

### Authentication Issues
- Verify JWT_SECRET is set
- Check cookie settings (secure, sameSite)
- Ensure token is being sent in requests

## Scaling Considerations

### For High Traffic
1. Use Redis for Socket.IO adapter (multiple server instances)
2. Implement database connection pooling
3. Use CDN for static assets
4. Consider load balancing
5. Implement caching strategies
6. Use database read replicas

### Cost Optimization
1. Optimize Cloudinary usage (compression, formats)
2. Implement pagination for messages
3. Clean up old uploaded files
4. Use database indexes efficiently
