# 🚀 **DevSync Setup Guide**

This guide will help you set up DevSync locally for development.

---

## 📋 **Prerequisites**

- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **MongoDB** database (local or cloud)
- **Git** for version control
- **GitHub account** for OAuth setup

---

## 🏗️ **Project Structure**

```
DevSync/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js Express backend
├── docs/             # Documentation
└── README.md         # Project overview
```

---

## ⚙️ **Backend Setup**

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure it:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/devsync"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_CALLBACK_URL="http://localhost:3001/api/auth/github/callback"

# Server
PORT=3001
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
# MongoDB will be automatically connected when you start the server
# Make sure MongoDB is running locally or update MONGODB_URI in .env
```

### 5. Start Backend Server
```bash
npm run dev
```

The backend will be running on `http://localhost:3001`

---

## 🖥️ **Frontend Setup**

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure it:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id

# App Configuration
NEXT_PUBLIC_APP_NAME=DevSync
NEXT_PUBLIC_APP_DESCRIPTION=Developer portfolio and collaboration platform
```

### 4. Start Frontend Development Server
```bash
npm run dev
```

The frontend will be running on `http://localhost:3000`

---

## 🔐 **GitHub OAuth Setup**

### 1. Create GitHub OAuth App
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: DevSync (Dev)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`

### 2. Get OAuth Credentials
- Copy the **Client ID** and **Client Secret**
- Update your backend `.env` file with these values

---

## 🗄️ **Database Setup Options**

### Option 1: Local MongoDB
```bash
# Install MongoDB (macOS)
brew install mongodb-community
brew services start mongodb-community

# MongoDB will create the database automatically when you first use it
```

### Option 2: Cloud Database (Recommended)
- **MongoDB Atlas**: [mongodb.com/atlas](https://mongodb.com/atlas) (Free tier available)
- **Railway**: [railway.app](https://railway.app) (MongoDB support)
- **DigitalOcean**: [digitalocean.com](https://digitalocean.com) (Managed MongoDB)

---

## 🧪 **Testing the Setup**

### 1. Backend Health Check
```bash
curl http://localhost:3001/api/health
```
Expected response: `{"status":"OK","message":"DevSync API is running"}`

### 2. Frontend Access
- Open `http://localhost:3000` in your browser
- You should see the DevSync landing page

### 3. Authentication Flow
- Click "Get Started" on the landing page
- You'll be redirected to GitHub OAuth
- After authorization, you'll be redirected back to the dashboard

---

## 🐛 **Troubleshooting**

### Common Issues

#### Backend Won't Start
```bash
# Check if port 3001 is available
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/devsync"

# Check MongoDB status
brew services list | grep mongodb
```

#### Frontend Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

#### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that the frontend is running on the correct port

---

## 🚀 **Production Deployment**

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy

### Database
- Use the same cloud database service
- Ensure proper connection strings
- Set up automated backups

---

## 📚 **Next Steps**

1. **Explore the Codebase**
   - Check out the API routes in `backend/src/routes/`
   - Review the frontend components in `frontend/src/app/`
   - Understand the database schema in `backend/prisma/schema.prisma`

2. **Add Features**
   - Implement real-time chat with Socket.io
   - Add GitHub repository sync
   - Create user profile pages

3. **Testing**
   - Add unit tests with Jest
   - Add integration tests
   - Set up CI/CD pipeline

---

## 🤝 **Getting Help**

- Check the [PRD](./PRD.md) for feature requirements
- Review the [Architecture](./ARCHITECTURE.md) for technical details
- Open an issue on GitHub for bugs
- Create a discussion for feature requests

---

✅ **You're all set!** DevSync should now be running locally with both frontend and backend working together.
