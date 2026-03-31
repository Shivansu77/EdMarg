# EdMarg

## Educational Mentoring & Assessment Platform

EdMarg is a comprehensive platform connecting students with mentors and providing assessment tools to understand student needs, interests, and learning goals.

## Features

### 🎓 Student-Mentor Matching
- Browse and connect with qualified mentors
- Book mentoring sessions
- Track learning progress

### 📋 Assessment System (NEW)
- **Reusable Assessment Templates** - Admins create forms with customizable questions
- **Smart Assignment** - Automatically assign assessments to students
- **Student Dashboard Integration** - Assessments appear automatically for students
- **Response Analysis** - Mentors and admins can analyze student interests, skills, and goals
- **Draft Mode** - Students can save progress before final submission

### 👥 User Roles
- **Students** - Complete assessments, book sessions, track progress
- **Mentors** - View student assessments, manage availability, conduct sessions
- **Admins** - Create assessments, manage users, oversee platform

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run seed:admin        # Create admin user
npm run seed:assessments  # Create sample assessment
npm run dev              # Start development server
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Assessment System

The assessment system allows admins to create reusable templates with questions about:
- Student interests and passions
- Skill levels and experience
- Learning goals and objectives
- Preferred learning styles
- Availability and preferences

### Documentation
- **[Assessment System Overview](./ASSESSMENT_SYSTEM.md)** - Quick start guide
- **[API Documentation](./backend/ASSESSMENT_API.md)** - Complete API reference
- **[Implementation Guide](./backend/ASSESSMENT_IMPLEMENTATION.md)** - Detailed implementation
- **[Architecture Diagram](./backend/ASSESSMENT_ARCHITECTURE.md)** - Visual system design

### API Endpoints
```
Base URL: http://localhost:5000/api/v1/assessments

Templates:  POST/GET/PUT/DELETE /templates
Assignments: POST/GET/PUT/DELETE /assignments
Responses:   POST/GET /responses
```

### Postman Collection
Import `backend/EdMarg_Assessment_API.postman_collection.json` for easy API testing.

## Project Structure

```
EdMarg/
├── backend/
│   ├── models/              # Database schemas
│   ├── repositories/        # Data access layer
│   ├── services/            # Business logic
│   ├── controllers/         # Request handlers
│   ├── routes/              # API endpoints
│   └── scripts/             # Utility scripts
├── frontend/
│   └── src/
│       ├── app/             # Next.js pages
│       ├── components/      # React components
│       └── utils/           # Helper functions
└── docs/                    # Documentation
```

## Technologies

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- RESTful API

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS

## Environment Variables

See `.env.example` files in backend and frontend directories.

## Contributing

Contributions are welcome! Please read the documentation before submitting PRs.

## License

MIT License
