# 🏗️ **DevSync – System Architecture**

---

## 1. **High-Level Flow**

```
[ User (Browser) ]
        |
        v
[ Next.js Frontend (Vercel) ]
        |
   (API Calls via Axios/Fetch)
        |
        v
[ Node.js Backend (Express - Hosted on Render/Railway) ]
        |
   (ORM Queries via Prisma)
        |
        v
[ PostgreSQL Database (Cloud DB e.g., Supabase/Neon) ]
```

---

## 2. **Architecture Components**

### 🖥️ **Frontend (Next.js)**

* **UI/UX**: Built with Next.js + Tailwind CSS.
* **Features**:

  * SSR for public profiles (`/profile/[username]`) → SEO optimized.
  * Client-side rendering for dashboards and settings.
  * Calls backend APIs using Axios/Fetch.
  * State: React Context (or Redux if app grows).

---

### ⚙️ **Backend (Node.js + Express)**

* **API Endpoints** (REST, JSON):

  * Auth (`/api/auth/github`)
  * Users (`/api/users/...`)
  * Projects (`/api/projects/...`)
  * Endorsements (`/api/endorsements/...`)
* **Business Logic**:

  * Validations (e.g., project cannot be created without title/stack).
  * Role handling (project owner vs collaborator).
* **Real-time Chat**: Socket.io channel for project rooms.
* **Security**: JWT tokens for API access after OAuth login.

---

### 🗄️ **Database (MongoDB)**

* Hosted on **MongoDB Atlas / Railway / DigitalOcean**.
* **Collections**:

  * `User` → profile info, skills, GitHub link
  * `Project` → owned by user, has collaborators
  * `Collaboration` → links users to projects
  * `Application` → for project joining requests
  * `Endorsement` → skill reviews between users

---

### 🔌 **Integrations**

* **GitHub API**:

  * Sync repos (stars, forks, commits).
  * Allow auto-import into portfolio.

* **WebSockets (Socket.io)**:

  * Enable team chat for collaborators.
  * Live notifications for endorsements/project applications.

---

## 3. **System Diagram**

```
 ┌─────────────────────────┐
 │      User Browser       │
 │  (React/Next.js UI)     │
 └───────────┬────────────┘
             │ HTTPS (REST, WebSockets)
             ▼
 ┌─────────────────────────┐
 │   Node.js Backend API   │
 │ (Express + Mongoose ODM) │
 └───────┬─────────┬──────┘
         │         │
   REST APIs   WebSockets
         │         │
         ▼         ▼
 ┌─────────────────────────┐
 │   MongoDB Database      │
 │ (Users, Projects, etc.) │
 └─────────────────────────┘

   ▲
   │ GitHub API Integration
   │ (Fetch repos, stats)
   ▼
 ┌─────────────────────────┐
 │      GitHub API         │
 └─────────────────────────┘
```

---

## 4. **Deployment Setup**

* **Frontend** → Vercel (Next.js SSR friendly).
* **Backend** → Render/Railway/DigitalOcean.
* **Database** → MongoDB Atlas/Railway/DigitalOcean MongoDB.
* **CD/CI** → GitHub Actions (lint, tests, deploy).

---

## 5. **API Endpoints Structure**

### Authentication
```
POST /api/auth/github          # GitHub OAuth login
GET  /api/auth/github/callback # OAuth callback
GET  /api/auth/verify          # Verify JWT token
POST /api/auth/logout          # Logout (client-side)
```

### Users
```
GET  /api/users/profile/:username # Public profile
PUT  /api/users/profile           # Update profile
GET  /api/users/search            # Search by skills
GET  /api/users/me                # Current user
```

### Projects
```
GET    /api/projects              # List all projects
POST   /api/projects              # Create project
GET    /api/projects/:id          # Get project details
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
POST   /api/projects/:id/apply    # Apply to join
PUT    /api/projects/:id/applications/:appId # Accept/reject application
```

### Endorsements
```
POST   /api/endorsements          # Give endorsement
GET    /api/endorsements/user/:userId # User endorsements
GET    /api/endorsements/skill/:skill # Skill endorsements
DELETE /api/endorsements/:id      # Remove endorsement
GET    /api/endorsements/stats/:userId # Endorsement statistics
```

---

## 6. **Database Schema Relationships**

```
User (1) ←→ (Many) Project (Owner)
User (Many) ←→ (Many) Project (Collaborations)
User (Many) ←→ (Many) User (Endorsements)
Project (1) ←→ (Many) Application
```

---

## 7. **Security Considerations**

* **OAuth 2.0** with GitHub for authentication
* **JWT tokens** for API authorization
* **CORS** configuration for frontend-backend communication
* **Input validation** on all API endpoints
* **Rate limiting** to prevent abuse
* **HTTPS only** in production

---

## 8. **Performance Optimizations**

* **Database indexing** on frequently queried fields
* **API response caching** for public profiles
* **Image optimization** for avatars and screenshots
* **Lazy loading** for project lists
* **Pagination** for large datasets

---

## 9. **Monitoring & Logging**

* **Request logging** with Morgan
* **Error tracking** with proper error handling
* **Performance monitoring** for API response times
* **Database query monitoring** with Prisma
* **Uptime monitoring** for production deployment

---

## 10. **Future Enhancements**

* **Redis caching** for frequently accessed data
* **CDN** for static assets and images
* **Microservices architecture** as the app scales
* **GraphQL API** for more flexible data fetching
* **Real-time notifications** with push notifications
