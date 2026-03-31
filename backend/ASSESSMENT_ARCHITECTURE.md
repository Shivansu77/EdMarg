# Assessment System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        EdMarg Platform                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
           ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
           │  Admin  │    │ Mentor  │    │ Student │
           └────┬────┘    └────┬────┘    └────┬────┘
                │               │               │
                └───────────────┼───────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Assessment System   │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
   ┌────▼────┐          ┌──────▼──────┐        ┌──────▼──────┐
   │Template │          │ Assignment  │        │  Response   │
   │ Manager │          │   Manager   │        │   Manager   │
   └────┬────┘          └──────┬──────┘        └──────┬──────┘
        │                      │                       │
        └──────────────────────┼───────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   MongoDB Database  │
                    └─────────────────────┘
```

## Data Flow

### 1. Template Creation Flow
```
Admin
  │
  ├─► POST /api/v1/assessments/templates
  │   {
  │     title: "Student Assessment",
  │     questions: [...]
  │   }
  │
  ▼
Controller → Service → Repository → MongoDB
  │
  ▼
AssessmentTemplate Created
  {
    _id: "template_123",
    title: "Student Assessment",
    questions: [...],
    createdBy: "admin_id"
  }
```

### 2. Assignment Creation Flow
```
Admin
  │
  ├─► POST /api/v1/assessments/assignments
  │   {
  │     templateId: "template_123",
  │     studentIds: ["student_1", "student_2"]
  │   }
  │
  ▼
Controller → Service → Repository → MongoDB
  │
  ▼
AssessmentAssignment Created
  {
    _id: "assignment_456",
    template: "template_123",
    assignedTo: ["student_1", "student_2"],
    assignedBy: "admin_id"
  }
  │
  ▼
Auto-appears in Student Dashboard
```

### 3. Student Response Flow
```
Student
  │
  ├─► GET /api/v1/assessments/assignments/my
  │   (View all assigned assessments)
  │
  ▼
[Assignment List Displayed]
  │
  ├─► POST /api/v1/assessments/responses/assignment_456
  │   {
  │     answers: { q1: "Technology", q2: "..." },
  │     submit: false  // Save draft
  │   }
  │
  ▼
[Progress Saved]
  │
  ├─► POST /api/v1/assessments/responses/assignment_456
  │   {
  │     answers: { q1: "Technology", q2: "...", q3: "..." },
  │     submit: true  // Final submission
  │   }
  │
  ▼
AssessmentResponse Created/Updated
  {
    _id: "response_789",
    assignment: "assignment_456",
    student: "student_1",
    answers: {...},
    status: "completed",
    submittedAt: "2024-01-15T10:30:00Z"
  }
```

### 4. Response Analysis Flow
```
Admin/Mentor
  │
  ├─► GET /api/v1/assessments/responses
  │   (View all responses)
  │
  ▼
[Response Analytics Dashboard]
  │
  ├─► Analyze student interests
  ├─► Identify skill levels
  ├─► Match with mentors
  └─► Create personalized learning paths
```

## Component Architecture

### Backend Structure
```
backend/
│
├── models/                          # Data Schemas
│   ├── assessmentTemplate.model.js  # Template structure
│   ├── assessmentAssignment.model.js # Assignment links
│   └── assessmentResponse.model.js   # Student answers
│
├── repositories/                    # Database Layer
│   └── assessment.repository.js     # CRUD operations
│
├── services/                        # Business Logic
│   └── assessment.service.js        # Validation & processing
│
├── controllers/                     # HTTP Handlers
│   └── assessment.controller.js     # Request/Response
│
└── routes/                          # API Endpoints
    └── assessment.route.js          # Route definitions
```

## Database Schema Relationships

```
┌─────────────────────┐
│       User          │
│  (Admin/Student)    │
└──────┬──────────────┘
       │
       │ createdBy
       │
┌──────▼──────────────┐
│ AssessmentTemplate  │
│                     │
│ - title             │
│ - description       │
│ - questions[]       │
│ - isActive          │
└──────┬──────────────┘
       │
       │ template
       │
┌──────▼──────────────┐
│AssessmentAssignment │
│                     │
│ - assignedTo[]      │◄─────┐
│ - assignedBy        │      │
│ - dueDate           │      │
│ - isActive          │      │
└──────┬──────────────┘      │
       │                     │
       │ assignment          │
       │                     │
┌──────▼──────────────┐      │
│ AssessmentResponse  │      │
│                     │      │
│ - student           │──────┘
│ - answers           │
│ - status            │
│ - submittedAt       │
└─────────────────────┘
```

## API Endpoint Structure

```
/api/v1/assessments/
│
├── /templates                    # Template Management
│   ├── POST    /                 # Create template (Admin)
│   ├── GET     /                 # List templates
│   ├── GET     /:id              # Get single template
│   ├── PUT     /:id              # Update template (Admin)
│   └── DELETE  /:id              # Delete template (Admin)
│
├── /assignments                  # Assignment Management
│   ├── POST    /                 # Create assignment (Admin)
│   ├── GET     /                 # List all (Admin/Mentor)
│   ├── GET     /my               # My assignments (Student)
│   ├── PUT     /:id              # Update assignment (Admin)
│   └── DELETE  /:id              # Delete assignment (Admin)
│
└── /responses                    # Response Management
    ├── POST    /:assignmentId    # Save/Submit (Student)
    ├── GET     /my/:assignmentId # My response (Student)
    ├── GET     /assignment/:id   # Assignment responses (Admin/Mentor)
    └── GET     /                 # All responses (Admin/Mentor)
```

## Authentication & Authorization Flow

```
Request
  │
  ├─► JWT Token in Authorization Header
  │   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  │
  ▼
Middleware: authenticate()
  │
  ├─► Verify JWT signature
  ├─► Extract user info (id, role)
  │
  ▼
Middleware: authorize(['admin', 'student'])
  │
  ├─► Check if user.role matches allowed roles
  │
  ▼
Controller → Service → Repository
  │
  ▼
Response
```

## Question Type Handling

```
Question Types
│
├── text
│   └─► Free text input
│       Answer: "My learning goals are..."
│
├── multipleChoice
│   └─► Single selection
│       Answer: "Intermediate"
│
├── checkbox
│   └─► Multiple selections
│       Answer: ["Technology", "Science", "Arts"]
│
├── rating
│   └─► Numeric value
│       Answer: 4
│
└── dropdown
    └─► Single selection from dropdown
        Answer: "Junior"
```

## State Management

```
Assessment Lifecycle
│
├─► Template Created (isActive: true)
│   │
│   ├─► Assignment Created (isActive: true)
│   │   │
│   │   ├─► Response Created (status: "pending")
│   │   │   │
│   │   │   ├─► Student saves progress
│   │   │   │   (status: "pending")
│   │   │   │
│   │   │   └─► Student submits
│   │   │       (status: "completed", submittedAt: Date)
│   │   │
│   │   └─► Assignment Deactivated (isActive: false)
│   │       (Responses preserved)
│   │
│   └─► Template Updated
│       (Existing responses unchanged)
│
└─► Template Deleted
    (Assignments and responses preserved)
```

## Security Layers

```
Security Stack
│
├─► Layer 1: CORS
│   └─► Allowed origins validation
│
├─► Layer 2: Helmet
│   └─► Security headers
│
├─► Layer 3: Rate Limiting
│   └─► Prevent abuse
│
├─► Layer 4: JWT Authentication
│   └─► Verify user identity
│
├─► Layer 5: Role Authorization
│   └─► Check permissions
│
└─► Layer 6: Data Validation
    └─► Validate input data
```

## Performance Optimizations

```
Optimizations
│
├─► Database Indexes
│   ├─► AssessmentResponse: (assignment, student) - unique
│   ├─► AssessmentAssignment: assignedTo[]
│   └─► AssessmentTemplate: createdBy
│
├─► Lean Queries
│   └─► .lean() for read-only operations
│
├─► Selective Population
│   └─► Only populate needed fields
│
└─► Pagination Support
    └─► Limit response size
```
