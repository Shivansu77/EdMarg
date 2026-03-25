# Error Handling, Logging & State Management Implementation

## 1. Error Handling Standardization

### Backend Error Classes (`backend/utils/errors.js`)

Custom error classes for consistent error handling across the application:

```javascript
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, 400);
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}
```

### Usage in Controllers

```javascript
// Example: Throwing validation error
if (!email) {
  throw new ValidationError('Email is required');
}

// Example: Throwing not found error
if (!user) {
  throw new NotFoundError('User not found');
}

// Example: Throwing authorization error
if (user.role !== 'admin') {
  throw new ForbiddenError('Only admins can access this resource');
}
```

### Error Middleware (`backend/middlewares/error.middleware.js`)

Centralized error handling that catches all errors and returns consistent responses:

```javascript
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }
  // Handle other error types...
};
```

---

## 2. Request Logging

### Logger Middleware (`backend/middlewares/logger.middleware.js`)

Tracks all HTTP requests with method, path, status code, and duration:

```javascript
const logger = (req, res, next) => {
  const start = Date.now();
  const { method, path, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(
      `[${new Date().toISOString()}] ${method} ${path} - ${statusCode} - ${duration}ms`
    );
  });

  next();
};
```

### Output Example

```
[2024-03-25T10:30:45.123Z] POST /api/users/login - 200 - 145ms
[2024-03-25T10:30:46.456Z] GET /api/admin/stats - 200 - 89ms
[2024-03-25T10:30:47.789Z] PUT /api/admin/mentors/123/approve - 200 - 234ms
```

### Integration in Server

```javascript
app.use(logger);
```

---

## 3. Frontend State Management

### Auth Context (`frontend/src/context/AuthContext.tsx`)

Global authentication state management:

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuth = (): AuthContextType => {
  // Hook to access auth context
};
```

### Usage in Components

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Theme Context (`frontend/src/context/ThemeContext.tsx`)

Global UI state management:

```typescript
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useTheme = (): ThemeContextType => {
  // Hook to access theme context
};
```

### Combined Providers (`frontend/src/context/Providers.tsx`)

Wraps all context providers:

```typescript
export const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
};
```

### Root Layout Integration

```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 4. API Client Utility

### API Client (`frontend/src/utils/api-client.ts`)

Centralized HTTP client with consistent error handling:

```typescript
class ApiClient {
  async request<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>
  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>
  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>>
  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>>
  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>>
  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>
}

export const apiClient = new ApiClient();
```

### Usage

```typescript
// GET request
const response = await apiClient.get('/api/users');

// POST request
const response = await apiClient.post('/api/users/login', { email, password });

// PUT request
const response = await apiClient.put('/api/admin/mentors/123/approve');

// With query parameters
const response = await apiClient.get('/api/users', {
  params: { page: 1, limit: 20 }
});
```

---

## 5. Custom Hooks

### useApi Hook (`frontend/src/hooks/useApi.ts`)

Handles API requests with loading and error states:

```typescript
interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (endpoint: string, options?: any) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T = any>(): UseApiReturn<T> => {
  // Hook implementation
};
```

### Usage

```typescript
function MyComponent() {
  const { data, loading, error, execute } = useApi();

  const fetchData = async () => {
    await execute('/api/users', { method: 'GET' });
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <p>Data: {JSON.stringify(data)}</p>}
      <button onClick={fetchData}>Fetch</button>
    </div>
  );
}
```

---

## 6. Validation Utilities

### Validators (`frontend/src/utils/validators.ts`)

Common validation functions:

```typescript
validators.email(email)           // Validate email format
validators.password(password)     // Validate password strength
validators.phone(phone)           // Validate phone number
validators.name(name)             // Validate name
validators.url(url)               // Validate URL
validators.required(value)        // Check if required
validators.minLength(value, min)  // Check minimum length
validators.maxLength(value, max)  // Check maximum length
validators.match(value1, value2)  // Check if values match
```

### Form Validation

```typescript
const { valid, errors } = validateForm(
  { email: 'test@example.com', password: 'Pass123' },
  {
    email: validators.email,
    password: (pwd) => validators.password(pwd),
  }
);
```

---

## File Structure

```
backend/
├── middlewares/
│   ├── logger.middleware.js
│   └── error.middleware.js
└── utils/
    └── errors.js

frontend/src/
├── context/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── Providers.tsx
├── hooks/
│   └── useApi.ts
└── utils/
    ├── api-client.ts
    └── validators.ts
```

---

## Benefits

✅ **Consistent Error Handling** - All errors follow the same format
✅ **Request Logging** - Track all API requests for debugging
✅ **Global State Management** - Centralized auth and theme state
✅ **Reusable API Client** - Consistent HTTP requests across the app
✅ **Type Safety** - Full TypeScript support
✅ **Error Recovery** - Proper error handling and user feedback
✅ **Validation** - Common validation utilities for forms

---

## Next Steps

1. Add request/response interceptors
2. Implement retry logic for failed requests
3. Add request caching
4. Create error boundary component
5. Add analytics logging
6. Implement rate limiting on frontend
7. Add offline support
