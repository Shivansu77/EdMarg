# Assessment System Implementation Guide

## Overview
The assessment system has been successfully implemented with three core components:
- **Assessment Templates** (reusable forms)
- **Assessment Assignments** (linking templates to students)
- **Assessment Responses** (student submissions)

## Architecture

### Backend Structure
```
backend/
├── models/
│   ├── assessmentTemplate.model.js    # Template schema
│   ├── assessmentAssignment.model.js  # Assignment schema
│   └── assessmentResponse.model.js    # Response schema
├── repositories/
│   └── assessment.repository.js       # Database operations
├── services/
│   └── assessment.service.js          # Business logic
├── controllers/
│   └── assessment.controller.js       # HTTP handlers
├── routes/
│   └── assessment.route.js            # API endpoints
└── scripts/
    └── seedAssessments.js             # Sample data seeder
```

## Setup Instructions

### 1. Install Dependencies
All required dependencies are already in package.json:
```bash
cd backend
npm install
```

### 2. Seed Sample Data
```bash
npm run seed:assessments
```

### 3. Start the Server
```bash
npm run dev
```

## API Endpoints

### Base URL
```
http://localhost:5000/api/v1/assessments
```

### Template Endpoints (Admin)
- `POST /templates` - Create template
- `GET /templates` - List all templates
- `GET /templates/:id` - Get single template
- `PUT /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

### Assignment Endpoints
- `POST /assignments` - Create assignment (Admin)
- `GET /assignments` - List all assignments (Admin/Mentor)
- `GET /assignments/my` - Get my assignments (Student)
- `PUT /assignments/:id` - Update assignment (Admin)
- `DELETE /assignments/:id` - Delete assignment (Admin)

### Response Endpoints
- `POST /responses/:assignmentId` - Save/submit response (Student)
- `GET /responses/my/:assignmentId` - Get my response (Student)
- `GET /responses/assignment/:assignmentId` - Get assignment responses (Admin/Mentor)
- `GET /responses` - Get all responses (Admin/Mentor)

## Usage Flow

### Admin Workflow

#### 1. Create Assessment Template
```bash
curl -X POST http://localhost:5000/api/v1/assessments/templates \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Student Interest Assessment",
    "description": "Understand student interests and goals",
    "questions": [
      {
        "id": "q1",
        "type": "multipleChoice",
        "question": "What is your primary interest?",
        "options": ["Science", "Arts", "Technology", "Business"],
        "required": true
      },
      {
        "id": "q2",
        "type": "text",
        "question": "What are your learning goals?",
        "required": true
      }
    ]
  }'
```

#### 2. Create Assignment
```bash
curl -X POST http://localhost:5000/api/v1/assessments/assignments \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "<template_id>",
    "studentIds": ["<student_id_1>", "<student_id_2>"],
    "dueDate": "2024-12-31T23:59:59Z"
  }'
```

#### 3. View All Responses
```bash
curl -X GET http://localhost:5000/api/v1/assessments/responses \
  -H "Authorization: Bearer <admin_token>"
```

### Student Workflow

#### 1. View My Assignments
```bash
curl -X GET http://localhost:5000/api/v1/assessments/assignments/my \
  -H "Authorization: Bearer <student_token>"
```

#### 2. Save Progress (Draft)
```bash
curl -X POST http://localhost:5000/api/v1/assessments/responses/<assignment_id> \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "q1": "Technology"
    },
    "submit": false
  }'
```

#### 3. Submit Assessment
```bash
curl -X POST http://localhost:5000/api/v1/assessments/responses/<assignment_id> \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "q1": "Technology",
      "q2": "Learn programming and build projects"
    },
    "submit": true
  }'
```

## Question Types

### 1. Text
```json
{
  "id": "goals",
  "type": "text",
  "question": "What are your learning goals?",
  "required": true
}
```

### 2. Multiple Choice
```json
{
  "id": "experience",
  "type": "multipleChoice",
  "question": "What is your experience level?",
  "options": ["Beginner", "Intermediate", "Advanced"],
  "required": true
}
```

### 3. Checkbox
```json
{
  "id": "interests",
  "type": "checkbox",
  "question": "Select your interests",
  "options": ["Science", "Arts", "Technology"],
  "required": false
}
```

### 4. Rating
```json
{
  "id": "confidence",
  "type": "rating",
  "question": "Rate your confidence (1-5)",
  "required": false
}
```

### 5. Dropdown
```json
{
  "id": "level",
  "type": "dropdown",
  "question": "Select your class level",
  "options": ["Freshman", "Sophomore", "Junior", "Senior"],
  "required": true
}
```

## Key Features

### ✅ Implemented Features
1. **Reusable Templates** - Create once, use multiple times
2. **Flexible Questions** - 5 question types supported
3. **Bulk Assignment** - Assign to multiple students at once
4. **Auto-Population** - Assignments appear automatically in student dashboard
5. **Draft Mode** - Students can save progress before submitting
6. **Response Isolation** - Each student's response is separate
7. **Template Independence** - Updating templates doesn't affect past responses
8. **Soft Delete** - Assignments can be deactivated without data loss
9. **Role-Based Access** - Admin, Mentor, and Student permissions
10. **Response Analysis** - Mentors and admins can view all responses

### 🔒 Security Features
- JWT authentication required for all endpoints
- Role-based authorization (Admin, Mentor, Student)
- Students can only view/submit their own responses
- Admins can manage templates and assignments
- Mentors can view responses but not modify templates

### 📊 Data Relationships
```
User (Admin) → creates → AssessmentTemplate
AssessmentTemplate → used in → AssessmentAssignment
AssessmentAssignment → assigned to → User (Student)
User (Student) → submits → AssessmentResponse
AssessmentResponse → references → AssessmentAssignment
```

## Testing

### 1. Create Admin User
```bash
npm run seed:admin
```

### 2. Create Sample Template
```bash
npm run seed:assessments
```

### 3. Test Endpoints
Use the provided curl commands or import into Postman/Insomnia.

## Frontend Integration

### Student Dashboard
```javascript
// Fetch student's assignments
const response = await fetch('/api/v1/assessments/assignments/my', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const assignments = await response.json();
```

### Assessment Form
```javascript
// Save progress
await fetch(`/api/v1/assessments/responses/${assignmentId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    answers: { q1: 'Technology', q2: 'Learn coding' },
    submit: false
  })
});

// Submit assessment
await fetch(`/api/v1/assessments/responses/${assignmentId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    answers: { q1: 'Technology', q2: 'Learn coding' },
    submit: true
  })
});
```

### Admin Panel
```javascript
// Create template
await fetch('/api/v1/assessments/templates', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Assessment',
    questions: [...]
  })
});

// Create assignment
await fetch('/api/v1/assessments/assignments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    templateId: 'template_id',
    studentIds: ['student1', 'student2'],
    dueDate: '2024-12-31'
  })
});
```

## Database Indexes
The system includes optimized indexes for performance:
- `AssessmentResponse`: Compound index on (assignment, student) - ensures unique responses
- `AssessmentTemplate`: Index on createdBy
- `AssessmentAssignment`: Index on assignedTo for fast student queries

## Error Handling
All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Next Steps

### Recommended Enhancements
1. Add email notifications when assignments are created
2. Implement due date reminders
3. Add analytics dashboard for response insights
4. Support file uploads in questions
5. Add conditional logic (show question based on previous answer)
6. Export responses to CSV/Excel
7. Add assessment templates library/marketplace

## Support
For issues or questions, refer to:
- API Documentation: `ASSESSMENT_API.md`
- Architecture: `ARCHITECTURE.md`
- Main README: `README.md`
