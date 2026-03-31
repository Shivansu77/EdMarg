# Assessment System Testing Guide

## Prerequisites

1. MongoDB running locally or connection string in `.env`
2. Backend server running on port 5000
3. Admin user created (run `npm run seed:admin`)

## Step-by-Step Testing

### Step 1: Seed Sample Data

```bash
cd backend
npm run seed:assessments
```

Expected output:
```
Connected to MongoDB
Cleared existing templates
✅ Assessment template created: Student Interest & Skills Assessment
Template ID: 507f1f77bcf86cd799439011
```

### Step 2: Get Admin Token

First, login as admin to get the JWT token:

```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@edmarg.com",
    "password": "admin123"
  }'
```

Save the token from the response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### Step 3: Test Template Endpoints

#### 3.1 Get All Templates
```bash
curl -X GET http://localhost:5000/api/v1/assessments/templates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected: List of templates including the seeded one

#### 3.2 Create New Template
```bash
curl -X POST http://localhost:5000/api/v1/assessments/templates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quick Skills Check",
    "description": "A brief assessment of technical skills",
    "questions": [
      {
        "id": "programming",
        "type": "checkbox",
        "question": "Which programming languages do you know?",
        "options": ["JavaScript", "Python", "Java", "C++", "Ruby"],
        "required": true
      },
      {
        "id": "level",
        "type": "multipleChoice",
        "question": "What is your skill level?",
        "options": ["Beginner", "Intermediate", "Advanced"],
        "required": true
      }
    ]
  }'
```

Expected: 201 Created with template data

#### 3.3 Update Template
```bash
curl -X PUT http://localhost:5000/api/v1/assessments/templates/TEMPLATE_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Skills Check",
    "isActive": true
  }'
```

Expected: 200 OK with updated template

### Step 4: Create Student User

```bash
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "student123",
    "role": "student"
  }'
```

Login as student:
```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "student123"
  }'
```

Save the student token.

### Step 5: Test Assignment Endpoints

#### 5.1 Create Assignment (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/assessments/assignments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "TEMPLATE_ID_FROM_STEP_3",
    "studentIds": ["STUDENT_ID_FROM_STEP_4"],
    "dueDate": "2024-12-31T23:59:59Z"
  }'
```

Expected: 201 Created with assignment data
Save the assignment ID.

#### 5.2 Get All Assignments (Admin)
```bash
curl -X GET http://localhost:5000/api/v1/assessments/assignments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected: List of all assignments

#### 5.3 Get My Assignments (Student)
```bash
curl -X GET http://localhost:5000/api/v1/assessments/assignments/my \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

Expected: List of assignments for this student

### Step 6: Test Response Endpoints

#### 6.1 Save Progress (Student)
```bash
curl -X POST http://localhost:5000/api/v1/assessments/responses/ASSIGNMENT_ID \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "programming": ["JavaScript", "Python"],
      "level": "Intermediate"
    },
    "submit": false
  }'
```

Expected: 200 OK with message "Progress saved"

#### 6.2 Submit Assessment (Student)
```bash
curl -X POST http://localhost:5000/api/v1/assessments/responses/ASSIGNMENT_ID \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "programming": ["JavaScript", "Python", "Java"],
      "level": "Intermediate"
    },
    "submit": true
  }'
```

Expected: 200 OK with message "Assessment submitted successfully"

#### 6.3 Get My Response (Student)
```bash
curl -X GET http://localhost:5000/api/v1/assessments/responses/my/ASSIGNMENT_ID \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

Expected: Response data with answers

#### 6.4 Get Assignment Responses (Admin)
```bash
curl -X GET http://localhost:5000/api/v1/assessments/responses/assignment/ASSIGNMENT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected: List of all responses for this assignment

#### 6.5 Get All Responses (Admin)
```bash
curl -X GET http://localhost:5000/api/v1/assessments/responses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected: List of all responses in the system

### Step 7: Test Authorization

#### 7.1 Student Cannot Create Template
```bash
curl -X POST http://localhost:5000/api/v1/assessments/templates \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Template",
    "questions": []
  }'
```

Expected: 403 Forbidden

#### 7.2 Student Cannot View Other's Response
Create another student and try to access first student's response.

Expected: Empty result or 404

### Step 8: Test Edge Cases

#### 8.1 Create Template Without Questions
```bash
curl -X POST http://localhost:5000/api/v1/assessments/templates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Empty Template",
    "questions": []
  }'
```

Expected: 400 Bad Request - "Title and questions are required"

#### 8.2 Create Assignment with Invalid Template
```bash
curl -X POST http://localhost:5000/api/v1/assessments/assignments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "invalid_id",
    "studentIds": ["STUDENT_ID"]
  }'
```

Expected: 404 Not Found - "Template not found"

#### 8.3 Submit Response Without Required Answers
```bash
curl -X POST http://localhost:5000/api/v1/assessments/responses/ASSIGNMENT_ID \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {},
    "submit": true
  }'
```

Expected: Should save (validation can be added in frontend)

## Automated Testing Script

Create a file `test-assessment.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api/v1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Testing Assessment System"

# 1. Login as admin
echo -e "\n${GREEN}1. Logging in as admin...${NC}"
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edmarg.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.token')

if [ "$ADMIN_TOKEN" != "null" ]; then
  echo "✅ Admin login successful"
else
  echo "❌ Admin login failed"
  exit 1
fi

# 2. Create template
echo -e "\n${GREEN}2. Creating assessment template...${NC}"
TEMPLATE_RESPONSE=$(curl -s -X POST $BASE_URL/assessments/templates \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Assessment",
    "questions": [
      {
        "id": "q1",
        "type": "text",
        "question": "What are your goals?",
        "required": true
      }
    ]
  }')

TEMPLATE_ID=$(echo $TEMPLATE_RESPONSE | jq -r '.data._id')

if [ "$TEMPLATE_ID" != "null" ]; then
  echo "✅ Template created: $TEMPLATE_ID"
else
  echo "❌ Template creation failed"
  exit 1
fi

# 3. Register student
echo -e "\n${GREEN}3. Registering student...${NC}"
STUDENT_RESPONSE=$(curl -s -X POST $BASE_URL/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "teststudent@test.com",
    "password": "test123",
    "role": "student"
  }')

# Login student
STUDENT_LOGIN=$(curl -s -X POST $BASE_URL/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teststudent@test.com","password":"test123"}')

STUDENT_TOKEN=$(echo $STUDENT_LOGIN | jq -r '.data.token')
STUDENT_ID=$(echo $STUDENT_LOGIN | jq -r '.data.user._id')

if [ "$STUDENT_TOKEN" != "null" ]; then
  echo "✅ Student registered and logged in"
else
  echo "❌ Student registration failed"
  exit 1
fi

# 4. Create assignment
echo -e "\n${GREEN}4. Creating assignment...${NC}"
ASSIGNMENT_RESPONSE=$(curl -s -X POST $BASE_URL/assessments/assignments \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"templateId\": \"$TEMPLATE_ID\",
    \"studentIds\": [\"$STUDENT_ID\"]
  }")

ASSIGNMENT_ID=$(echo $ASSIGNMENT_RESPONSE | jq -r '.data._id')

if [ "$ASSIGNMENT_ID" != "null" ]; then
  echo "✅ Assignment created: $ASSIGNMENT_ID"
else
  echo "❌ Assignment creation failed"
  exit 1
fi

# 5. Student views assignments
echo -e "\n${GREEN}5. Student viewing assignments...${NC}"
MY_ASSIGNMENTS=$(curl -s -X GET $BASE_URL/assessments/assignments/my \
  -H "Authorization: Bearer $STUDENT_TOKEN")

COUNT=$(echo $MY_ASSIGNMENTS | jq '.data | length')

if [ "$COUNT" -gt 0 ]; then
  echo "✅ Student can view assignments (count: $COUNT)"
else
  echo "❌ Student cannot view assignments"
  exit 1
fi

# 6. Student submits response
echo -e "\n${GREEN}6. Student submitting response...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/assessments/responses/$ASSIGNMENT_ID \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {"q1": "My learning goals are..."},
    "submit": true
  }')

RESPONSE_ID=$(echo $RESPONSE | jq -r '.data._id')

if [ "$RESPONSE_ID" != "null" ]; then
  echo "✅ Response submitted: $RESPONSE_ID"
else
  echo "❌ Response submission failed"
  exit 1
fi

# 7. Admin views responses
echo -e "\n${GREEN}7. Admin viewing responses...${NC}"
ALL_RESPONSES=$(curl -s -X GET $BASE_URL/assessments/responses \
  -H "Authorization: Bearer $ADMIN_TOKEN")

RESPONSE_COUNT=$(echo $ALL_RESPONSES | jq '.data | length')

if [ "$RESPONSE_COUNT" -gt 0 ]; then
  echo "✅ Admin can view responses (count: $RESPONSE_COUNT)"
else
  echo "❌ Admin cannot view responses"
  exit 1
fi

echo -e "\n${GREEN}✅ All tests passed!${NC}"
```

Make it executable and run:
```bash
chmod +x test-assessment.sh
./test-assessment.sh
```

## Postman Testing

1. Import `backend/EdMarg_Assessment_API.postman_collection.json`
2. Set environment variables:
   - `baseUrl`: http://localhost:5000/api/v1/assessments
   - `adminToken`: Your admin JWT token
   - `studentToken`: Your student JWT token
3. Run the collection

## Expected Results Summary

| Test | Expected Result |
|------|----------------|
| Seed assessments | ✅ Template created |
| Admin login | ✅ Token received |
| Create template | ✅ 201 Created |
| Get templates | ✅ List returned |
| Update template | ✅ 200 OK |
| Create assignment | ✅ 201 Created |
| Student view assignments | ✅ List with 1+ items |
| Save progress | ✅ "Progress saved" |
| Submit assessment | ✅ "Assessment submitted" |
| Admin view responses | ✅ List with responses |
| Student create template | ❌ 403 Forbidden |
| Invalid template ID | ❌ 404 Not Found |

## Troubleshooting

### Issue: "JWT_SECRET is not defined"
**Solution**: Check `.env` file has `JWT_SECRET=your_secret_key`

### Issue: "MONGODB_URI is not defined"
**Solution**: Add `MONGODB_URI=mongodb://localhost:27017/edmarg` to `.env`

### Issue: "Template not found"
**Solution**: Run `npm run seed:assessments` first

### Issue: "Unauthorized"
**Solution**: Check token is valid and not expired

### Issue: "Cannot POST /api/v1/assessments/templates"
**Solution**: Ensure server is running and routes are registered

## Next Steps

After successful testing:
1. Build frontend components for assessment UI
2. Add email notifications
3. Implement analytics dashboard
4. Add export functionality
5. Create mobile-responsive design
