# Assessment System API Documentation

## Overview
The assessment system allows admins to create reusable assessment templates, assign them to students, and collect responses. The system consists of three main components:

1. **Assessment Templates** - Reusable forms with questions
2. **Assessment Assignments** - Links templates to specific students
3. **Assessment Responses** - Student answers to assigned assessments

## Data Models

### Assessment Template
```json
{
  "_id": "ObjectId",
  "title": "Student Interest Assessment",
  "description": "Understand student interests and goals",
  "questions": [
    {
      "id": "q1",
      "type": "multipleChoice",
      "question": "What is your primary area of interest?",
      "options": ["Science", "Arts", "Technology", "Business"],
      "required": true
    }
  ],
  "createdBy": "ObjectId (User)",
  "isActive": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Assessment Assignment
```json
{
  "_id": "ObjectId",
  "template": "ObjectId (AssessmentTemplate)",
  "assignedTo": ["ObjectId (User)"],
  "assignedBy": "ObjectId (User)",
  "dueDate": "Date",
  "isActive": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Assessment Response
```json
{
  "_id": "ObjectId",
  "assignment": "ObjectId (AssessmentAssignment)",
  "student": "ObjectId (User)",
  "answers": {
    "q1": "Technology",
    "q2": ["Programming", "Design"]
  },
  "status": "completed",
  "submittedAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## API Endpoints

### Template Management (Admin Only)

#### Create Template
```
POST /api/v1/assessments/templates
Authorization: Bearer <admin_token>

Request Body:
{
  "title": "Student Interest Assessment",
  "description": "Understand student interests",
  "questions": [
    {
      "id": "q1",
      "type": "multipleChoice",
      "question": "What is your primary interest?",
      "options": ["Science", "Arts", "Technology"],
      "required": true
    }
  ]
}

Response: 201 Created
{
  "success": true,
  "message": "Template created successfully",
  "data": { ... }
}
```

#### Get All Templates
```
GET /api/v1/assessments/templates
Authorization: Bearer <token>

Query Parameters:
- isActive: true/false (optional)

Response: 200 OK
{
  "success": true,
  "data": [ ... ]
}
```

#### Get Single Template
```
GET /api/v1/assessments/templates/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Update Template
```
PUT /api/v1/assessments/templates/:id
Authorization: Bearer <admin_token>

Request Body:
{
  "title": "Updated Title",
  "questions": [ ... ]
}

Response: 200 OK
{
  "success": true,
  "message": "Template updated successfully",
  "data": { ... }
}
```

#### Delete Template
```
DELETE /api/v1/assessments/templates/:id
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### Assignment Management

#### Create Assignment (Admin Only)
```
POST /api/v1/assessments/assignments
Authorization: Bearer <admin_token>

Request Body:
{
  "templateId": "template_id",
  "studentIds": ["student_id_1", "student_id_2"],
  "dueDate": "2024-12-31T23:59:59Z"
}

Response: 201 Created
{
  "success": true,
  "message": "Assignment created successfully",
  "data": { ... }
}
```

#### Get My Assignments (Student)
```
GET /api/v1/assessments/assignments/my
Authorization: Bearer <student_token>

Response: 200 OK
{
  "success": true,
  "data": [ ... ]
}
```

#### Get All Assignments (Admin/Mentor)
```
GET /api/v1/assessments/assignments
Authorization: Bearer <admin_or_mentor_token>

Response: 200 OK
{
  "success": true,
  "data": [ ... ]
}
```

#### Update Assignment (Admin Only)
```
PUT /api/v1/assessments/assignments/:id
Authorization: Bearer <admin_token>

Request Body:
{
  "dueDate": "2024-12-31T23:59:59Z",
  "isActive": false
}

Response: 200 OK
{
  "success": true,
  "message": "Assignment updated successfully",
  "data": { ... }
}
```

#### Delete Assignment (Admin Only)
```
DELETE /api/v1/assessments/assignments/:id
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "message": "Assignment deleted successfully"
}
```

### Response Management

#### Save/Submit Response (Student)
```
POST /api/v1/assessments/responses/:assignmentId
Authorization: Bearer <student_token>

Request Body:
{
  "answers": {
    "q1": "Technology",
    "q2": ["Programming", "Design"]
  },
  "submit": true
}

Response: 200 OK
{
  "success": true,
  "message": "Assessment submitted successfully",
  "data": { ... }
}
```

#### Get My Response (Student)
```
GET /api/v1/assessments/responses/my/:assignmentId
Authorization: Bearer <student_token>

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Get Assignment Responses (Admin/Mentor)
```
GET /api/v1/assessments/responses/assignment/:assignmentId
Authorization: Bearer <admin_or_mentor_token>

Response: 200 OK
{
  "success": true,
  "data": [ ... ]
}
```

#### Get All Responses (Admin/Mentor)
```
GET /api/v1/assessments/responses
Authorization: Bearer <admin_or_mentor_token>

Response: 200 OK
{
  "success": true,
  "data": [ ... ]
}
```

## Question Types

The system supports the following question types:

1. **text** - Free text input
2. **multipleChoice** - Single selection from options
3. **checkbox** - Multiple selections from options
4. **rating** - Numeric rating (e.g., 1-5)
5. **dropdown** - Dropdown selection from options

## Workflow

1. **Admin creates template** → POST /api/v1/assessments/templates
2. **Admin creates assignment** → POST /api/v1/assessments/assignments
3. **Student views assignments** → GET /api/v1/assessments/assignments/my
4. **Student saves progress** → POST /api/v1/assessments/responses/:assignmentId (submit: false)
5. **Student submits** → POST /api/v1/assessments/responses/:assignmentId (submit: true)
6. **Admin/Mentor views responses** → GET /api/v1/assessments/responses

## Features

- ✅ Reusable assessment templates
- ✅ Flexible question types
- ✅ Bulk student assignment
- ✅ Auto-population in student dashboard
- ✅ Progress saving (draft mode)
- ✅ Response analysis for mentors/admins
- ✅ Template updates don't affect past responses
- ✅ Soft delete for assignments (isActive flag)
