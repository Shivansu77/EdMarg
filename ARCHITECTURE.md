# Architecture Improvements - Service Layer Implementation

## Overview
Implemented a clean architecture with separation of concerns using Service and Repository layers.

## Architecture Layers

### 1. Controllers (`backend/controllers/`)
- **Responsibility**: Handle HTTP requests/responses
- **Scope**: Request validation, response formatting
- **Files**:
  - `user.controller.js` - User endpoints
  - `admin.controller.js` - Admin endpoints

### 2. Services (`backend/services/`)
- **Responsibility**: Business logic and orchestration
- **Scope**: Data validation, business rules, service coordination
- **Files**:
  - `user.service.js` - User operations (login, signup, mentor retrieval)
  - `admin.service.js` - Admin operations (user management, mentor approvals)

### 3. Repositories (`backend/repositories/`)
- **Responsibility**: Data access abstraction
- **Scope**: Database queries, data persistence
- **Files**:
  - `user.repository.js` - User data operations

### 4. Models (`backend/models/`)
- **Responsibility**: Data schema definition
- **Scope**: MongoDB schema and validation
- **Files**:
  - `user.model.js` - User and TokenBlacklist schemas

### 5. Utilities (`backend/utils/`)
- **Responsibility**: Shared utilities and helpers
- **Files**:
  - `constants.js` - Application constants
  - `errors.js` - Custom error classes
  - `api.response.js` - Response formatting
  - `validators.js` - Input validation

## Data Flow

```
Request
  ↓
Middleware (Auth, Validation)
  ↓
Controller (Parse request)
  ↓
Service (Business logic)
  ↓
Repository (Data access)
  ↓
Database
  ↓
Response
```

## Benefits

✅ **Separation of Concerns**: Each layer has a single responsibility
✅ **Testability**: Easy to unit test services and repositories
✅ **Reusability**: Services can be used by multiple controllers
✅ **Maintainability**: Clear structure makes code easier to maintain
✅ **Scalability**: Easy to add new features without affecting existing code
✅ **Error Handling**: Centralized error handling with custom error classes

## Usage Examples

### Creating a User
```javascript
// Controller
const user = await userService.createUser(userData);

// Service
async createUser(userData) {
  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) throw new ValidationError('User already exists');
  return userRepository.create(userData);
}

// Repository
async create(userData) {
  return User.create(userData);
}
```

### Approving a Mentor
```javascript
// Controller
const mentor = await adminService.approveMentor(mentorId, adminId);

// Service
async approveMentor(mentorId, adminId) {
  const mentor = await userRepository.updateMentorStatus(mentorId, 'approved', {
    approvedAt: new Date(),
    approvedBy: adminId,
  });
  if (!mentor) throw new NotFoundError('Mentor not found');
  return mentor;
}

// Repository
async updateMentorStatus(id, status, metadata = {}) {
  return User.findByIdAndUpdate(id, {...}, { new: true });
}
```

## Error Handling

Custom error classes for consistent error handling:
- `AppError` - Base error class
- `ValidationError` - 400 Bad Request
- `NotFoundError` - 404 Not Found
- `UnauthorizedError` - 401 Unauthorized
- `ForbiddenError` - 403 Forbidden

## Constants

Centralized constants in `utils/constants.js`:
- `ROLES` - User roles
- `APPROVAL_STATUS` - Mentor approval statuses
- `PAGINATION` - Pagination defaults
- `JWT_CONFIG` - JWT configuration
- `COOKIE_OPTIONS` - Cookie settings

## File Structure

```
backend/
├── controllers/
│   ├── user.controller.js
│   └── admin.controller.js
├── services/
│   ├── user.service.js
│   └── admin.service.js
├── repositories/
│   └── user.repository.js
├── models/
│   └── user.model.js
├── middlewares/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── routes/
│   ├── user.route.js
│   └── admin.route.js
├── utils/
│   ├── constants.js
│   ├── errors.js
│   ├── api.response.js
│   └── validators.js
└── server.js
```

## Next Steps

1. Implement input validation middleware
2. Add logging service
3. Create database transaction support
4. Add caching layer
5. Implement rate limiting
