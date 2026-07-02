# EdMarg — Educational Mentoring & Assessment Platform

> A full-stack platform connecting students with qualified mentors, providing assessment tools to understand student needs, interests, and career goals.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [AI Tools Used](#ai-tools-used)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Docker Setup (Alternative)](#4-docker-setup-alternative)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Assessment System](#assessment-system)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**EdMarg** is a comprehensive educational platform that:

- Connects students with expert mentors for 1-on-1 sessions
- Provides career assessments to help students discover their strengths and ideal career paths
- Offers reusable assessment templates for admins to measure student interests, skills, and goals
- Supports real-time messaging, Zoom-integrated video sessions, and session recordings
- Includes a full admin dashboard for user management and platform oversight

---

## Features

### 🎓 Student-Mentor Matching
- Browse and filter qualified mentors by expertise, rating, and price
- Book mentoring sessions with integrated Zoom video calling
- Track learning progress with goals and milestones
- Wishlist favorite mentors for quick access

### 📋 Assessment System
- **Reusable Assessment Templates** — Admins create forms with customizable question types (text, multiple choice, checkbox, rating, dropdown)
- **Smart Assignment** — Automatically assign assessments to students
- **Student Dashboard Integration** — Assessments appear automatically for students
- **Career Assessment Engine** — Tag-based scoring system evaluates student interests and skills across 8 dimensions (logic, tech, social, business, creative, practical, research, outdoor) and recommends top 3 career paths with detailed roadmaps
- **Response Analysis** — Mentors and admins can analyze student interests, skills, and goals
- **Draft Mode** — Students can save progress before final submission

### 💬 Real-Time Communication
- Socket.io powered real-time messaging
- File sharing support (images, PDFs)
- Read receipts and unread message tracking

### 🎥 Session Recordings
- Zoom webhook integration for automatic recording capture
- Cloudinary-based video storage with signed URL access
- Processing pipeline (pending → downloading → uploading → completed)

### 📝 Blogging Platform
- Admin-managed blog posts with slug-based URLs
- Rich content support with images

### 👥 User Roles
| Role | Capabilities |
|------|-------------|
| **Student** | Complete assessments, book sessions, set goals, track progress, message mentors |
| **Mentor** | View student assessments, manage availability, conduct sessions, add session notes |
| **Admin** | Create assessments, manage users, approve mentors, oversee platform, write blog posts |

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** (≥18.x) | Server runtime |
| **TypeScript** | Type-safe application source |
| **Express.js** v5 | REST API framework |
| **MongoDB** + **Mongoose** v9 | Database + ODM |
| **JWT** (jsonwebtoken) | Authentication & authorization |
| **Socket.io** | Real-time WebSocket communication |
| **Nodemailer** | Email notifications (SMTP) |
| **Cloudinary** | Image/video storage (profiles, recordings) |
| **Multer** | File upload handling |
| **Sharp** | Image processing and optimization |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting / brute-force protection |
| **bcryptjs** | Password hashing |
| **Axios** | HTTP client (Zoom API integration) |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js** 16 | React framework (App Router, SSR) |
| **React** 19 | UI library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** v4 | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |
| **Socket.io Client** | Real-time frontend communication |
| **React Easy Crop** | Profile image cropping |

### DevOps & Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Docker** + **Docker Compose** | Containerized development/deployment |
| **Render** | Production hosting (backend + frontend) |
| **Vercel** | Alternative frontend deployment |
| **MongoDB Atlas** | Cloud database (production) |
| **Zoom API** | Video session integration |

---

## AI Tools Used

The following AI tools were used during the development of EdMarg:

| AI Tool | Usage |
|---------|-------|
| **GitHub Copilot** | Code completion, boilerplate generation for Express routes, Mongoose models, and React components |
| **ChatGPT (GPT-4)** | Architecture planning, debugging complex issues, generating assessment scoring algorithms, writing documentation |
| **Google Gemini** | Code review, refactoring suggestions, generating seed data scripts |
| **Claude (Anthropic)** | Documentation writing, decision analysis, API design review |

> For detailed AI usage information including key prompts, errors caught, and corrections made, see [AI_USAGE.md](./AI_USAGE.md).

---

## Architecture

```
┌────────────────────┐     ┌────────────────────┐     ┌──────────────┐
│   Next.js 16       │────▶│   Express.js v5    │────▶│  MongoDB     │
│   (Frontend)       │     │   (Backend API)    │     │  (Database)  │
│   Port: 3000       │     │   Port: 5000       │     │  Port: 27017 │
└────────────────────┘     └────────────────────┘     └──────────────┘
         │                          │
         │ WebSocket                │ Webhooks / API
         ▼                          ▼
┌────────────────────┐     ┌──────────────────────────┐
│   Socket.io        │     │  External Services       │
│   (Real-time       │     │  • Zoom API (video)      │
│    messaging)      │     │  • Cloudinary (storage)  │
│                    │     │  • SMTP (email)           │
└────────────────────┘     │  • Google OAuth          │
                           └──────────────────────────┘
```

---

## Project Structure

```
EdMarg/
├── backend/
│   ├── controllers/         # Request handlers (14 controllers)
│   │   ├── user.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── assessment.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── mentor.controller.ts
│   │   ├── recording.controller.ts
│   │   └── ...
│   ├── models/              # Mongoose schemas (12 models)
│   │   ├── user.model.ts
│   │   ├── assessmentTemplate.model.ts
│   │   ├── assessmentAssignment.model.ts
│   │   ├── assessmentResponse.model.ts
│   │   ├── studentAssessment.model.ts
│   │   ├── booking.model.ts
│   │   ├── availability.model.ts
│   │   ├── goal.model.ts
│   │   ├── message.model.ts
│   │   ├── review.model.ts
│   │   ├── blog.model.ts
│   │   └── Recording.ts
│   ├── services/            # Business logic (15 services)
│   │   ├── assessment.service.ts
│   │   ├── careerAssessment.service.ts
│   │   ├── booking.service.ts
│   │   ├── user.service.ts
│   │   ├── email.service.ts
│   │   ├── cloudinary.service.ts
│   │   ├── zoom.service.ts
│   │   └── ...
│   ├── repositories/        # Data access layer (DAL)
│   ├── routes/              # API endpoint definitions
│   │   ├── v1/              # API version 1
│   │   ├── v2/              # API version 2
│   │   ├── assessment.route.ts
│   │   └── blog.route.ts
│   ├── middlewares/          # Auth, error handling, caching
│   ├── lib/                  # Database connection, CORS, Socket.io
│   ├── scripts/              # Seed & utility scripts
│   │   ├── seedAdmin.ts
│   │   ├── seedAssessments.ts
│   │   └── seedAvailability.ts
│   ├── utils/                # Error classes, helpers
│   ├── uploads/              # Local file uploads
│   ├── server.ts             # Application entry point
│   ├── .env.example          # Environment template
│   └── EdMarg_Assessment_API.postman_collection.json
├── frontend/
│   └── src/
│       ├── app/              # Next.js App Router pages
│       ├── components/       # Reusable React components
│       ├── context/          # React context providers
│       ├── hooks/            # Custom React hooks
│       ├── modules/          # Feature modules
│       ├── services/         # API client services
│       └── utils/            # Helper functions
├── deployment/               # Deployment configurations
├── docker-compose.yml        # Docker multi-service setup
├── render.yaml               # Render deployment blueprint
├── vercel.json               # Vercel frontend config
├── SCOPE.md                  # Data anomaly log & DB schema
├── DECISIONS.md              # Decision log
├── AI_USAGE.md               # AI tools usage documentation
└── README.md                 # This file
```

---

## Prerequisites

- **Node.js** ≥ 18.x (backend) / 24.x (frontend)
- **MongoDB** 7.x (local) or MongoDB Atlas (cloud)
- **npm** ≥ 9.x
- **Git**

Optional:
- **Docker** & **Docker Compose** (for containerized setup)
- **Zoom Account** (for video session integration)
- **Cloudinary Account** (for image/video uploads)
- **Gmail App Password** (for email notifications)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/EdMarg.git
cd EdMarg
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template and configure
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and other credentials

# Seed the database with initial data
npm run seed:admin          # Creates admin user (admin@edmarg.com / Admin@123)
npm run seed:assessments    # Creates sample assessment templates

# Start the development server
npm run dev                 # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Copy environment template and configure
cp .env.example .env.local
# Edit .env.local with your API URLs

# Start the development server
npm run dev                 # Starts on http://localhost:3000
```

### 4. Docker Setup (Alternative)

```bash
# From project root — starts MongoDB, backend, and frontend
docker-compose up --build

# Services will be available at:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:5000
# MongoDB:   localhost:27017
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/edmarg_db` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | — |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `ZOOM_ACCOUNT_ID` | Zoom Server-to-Server app | — |
| `ZOOM_CLIENT_ID` | Zoom OAuth client ID | — |
| `ZOOM_CLIENT_SECRET` | Zoom OAuth client secret | — |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | — |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | SMTP username/email | — |
| `SMTP_PASS` | SMTP password/app password | — |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (v1) | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL | `http://localhost:5000` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL | `http://localhost:5000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `EdMarg` |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment flag | `development` |

---

## Database Schema

EdMarg uses **MongoDB** with **Mongoose** ODM. The database consists of 12 collections:

| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `users` | All user accounts (students, mentors, admins) | name, email, role, mentorProfile, studentProfile |
| `tokenblacklists` | Revoked JWT tokens (auto-expiring TTL index) | token, expiresAt |
| `assessmenttemplates` | Reusable assessment forms | title, questions[], createdBy, isActive |
| `assessmentassignments` | Template-to-student mappings | template, assignedTo[], dueDate |
| `assessmentresponses` | Student answers to assignments | assignment, student, answers (Map), status |
| `studentassessments` | Career assessment submissions | student, answers (Mixed), result |
| `bookings` | Mentoring session bookings | student, mentor, date, status, zoomMeetingId |
| `availabilities` | Mentor weekly time slots | mentor, dayOfWeek, slots[] |
| `goals` | Student learning goals with milestones | student, title, category, milestones[] |
| `messages` | Chat messages between users | sender, receiver, content, fileUrl, read |
| `reviews` | Post-session reviews | mentor, student, booking, rating, comment |
| `blogs` | Platform blog posts | title, slug, content, image, author |
| `recordings` | Zoom session recordings | sessionId, meetingId, videoUrl, processingStatus |

> For the complete schema definitions with field types and indexes, see [SCOPE.md](./SCOPE.md).

---

## API Endpoints

Base URL: `http://localhost:5000`

### Authentication & Users (`/api/v1/users`)
- `POST /register` — Register a new user
- `POST /login` — Login with email/password
- `POST /auth/google` — Google OAuth login
- `GET /me` — Get current user profile
- `PUT /me` — Update profile

### Admin (`/api/v1/admin`)
- `GET /users` — List all users
- `PUT /users/:id/role` — Change user role
- `PUT /mentors/:id/approve` — Approve mentor applications

### Assessments (`/api/v1/assessments`)
- `POST /templates` — Create assessment template
- `GET /templates` — List all templates
- `PUT /templates/:id` — Update template
- `DELETE /templates/:id` — Delete template
- `POST /assignments` — Assign assessment to students
- `GET /assignments` — List assignments
- `POST /responses` — Submit assessment response
- `GET /responses` — Get responses

### Bookings (`/api/v1/bookings`)
- `POST /` — Create a booking
- `GET /` — List user bookings
- `PUT /:id/status` — Update booking status

### Mentors (`/api/v1/mentor`)
- `GET /` — List approved mentors
- `GET /:id` — Get mentor details

### Availability (`/api/v1/availability`)
- `GET /:mentorId` — Get mentor availability
- `PUT /` — Update mentor availability

### Goals (`/api/v1/goals`)
- `POST /` — Create a goal
- `GET /` — List student goals
- `PUT /:id` — Update goal progress

### Messages (`/api/v1/messages`)
- `GET /:userId` — Get conversation with user
- `POST /` — Send a message

### Reviews (`/api/v1/reviews`)
- `POST /` — Create a review
- `GET /mentor/:mentorId` — Get mentor reviews

### Recordings (`/api/v1/recordings`)
- `GET /` — List user recordings
- `GET /:id/signed-url` — Get signed video URL

### Blogs (`/api/blogs`)
- `GET /` — List all blog posts
- `GET /:slug` — Get blog by slug

### Postman Collection
Import `backend/EdMarg_Assessment_API.postman_collection.json` for easy API testing with pre-configured requests.

---

## Assessment System

The assessment system has two components:

### 1. Template-Based Assessments
Admins create reusable templates with customizable questions. Supported question types:
- **Text** — Free-text answers
- **Multiple Choice** — Single-select from options
- **Checkbox** — Multi-select from options
- **Rating** — 1–5 scale
- **Dropdown** — Select from a dropdown list

### 2. Career Assessment Engine
A tag-based scoring system that evaluates students across 8 dimensions:

| Tag | Measures |
|-----|---------|
| `logic` | Analytical thinking |
| `tech` | Technology orientation |
| `social` | People-facing strengths |
| `business` | Business and finance mindset |
| `creative` | Creative expression |
| `practical` | Hands-on execution |
| `research` | Deep learning and research interest |
| `outdoor` | Field adaptability |

The engine scores students against 10 career profiles (Software Engineering, Product Management, UI/UX Design, Finance, Data Science, Digital Marketing, Architecture, Psychology, Environmental Science, Entrepreneurship) and returns top 3 recommendations with detailed roadmaps, salary ranges, and college suggestions.

---

## Deployment

### Production (Render)
The project includes a `render.yaml` blueprint for one-click deployment on Render:
- **Backend**: Node.js web service
- **Frontend**: Node.js web service with Next.js

### Alternative (Vercel + Render)
- **Frontend**: Deploy to Vercel using `vercel.json`
- **Backend**: Deploy to Render separately

### Production URLs
- **Frontend**: `https://www.edmarg.com`
- **Backend**: `https://edmarg.onrender.com`

---

## Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | This file — setup, architecture, and overview |
| [SCOPE.md](./SCOPE.md) | Data anomaly log, CSV import handling, and complete database schema |
| [DECISIONS.md](./DECISIONS.md) | Decision log with rationale for every significant choice |
| [AI_USAGE.md](./AI_USAGE.md) | AI tools used, key prompts, and error correction cases |
| [IMPORT_REPORT.md](./IMPORT_REPORT.md) | CSV import report — anomalies detected and actions taken |

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Read the documentation before submitting PRs
4. Follow the existing code style and patterns
5. Submit a Pull Request

---

## License

MIT License

---

*Built with ❤️ for educational mentoring*
