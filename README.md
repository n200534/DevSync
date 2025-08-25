# 🚀 DevSync

**DevSync** is a platform where developers can build and showcase their professional portfolios, discover or create side projects, collaborate with other developers, and endorse each other's skills.

## ✨ Features

- **Portfolio Building**: Create stunning developer portfolios with GitHub integration
- **Project Collaboration**: Find teammates for open source projects
- **Peer Endorsements**: Get validated by other developers for your skills
- **Real-time Communication**: Team chat and notifications
- **Professional Networking**: Connect with developers and recruiters

## 🏗️ Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Mongoose ODM
- **Database**: MongoDB
- **Authentication**: GitHub OAuth + JWT
- **Real-time**: Socket.io for chat

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB database (local or cloud)
- GitHub OAuth app

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Environment Variables
Create `.env` files in both frontend and backend directories with:
- MongoDB connection string
- GitHub OAuth credentials
- JWT secret
- API endpoints

## 📁 Project Structure

```
DevSync/
├── frontend/          # Next.js 14 + TypeScript frontend
├── backend/           # Node.js + Express + Mongoose backend
├── docs/             # Complete documentation
│   ├── PRD.md        # Product Requirements Document
│   ├── ARCHITECTURE.md # System Architecture
│   ├── SETUP.md      # Development Setup Guide
│   └── DEVELOPMENT_STATUS.md # Current Progress
└── README.md         # This file
```

## 🛠️ Development

- **Phase 1**: MVP with auth, profiles, projects, endorsements
- **Phase 2**: Real-time chat and GitHub sync
- **Phase 3**: Analytics dashboard and polish

## 📄 License

MIT License - see LICENSE file for details
