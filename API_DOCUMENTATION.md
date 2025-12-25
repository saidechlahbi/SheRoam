# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token. Include the token in the request header:
```
Authorization: Bearer <your-jwt-token>
```

Or the token will be automatically sent via HTTP-only cookies after login.

---

## Endpoints

### 1. Health Check

Check if the server is running.

**Endpoint:** `GET /api/health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

### 2. Register User

Create a new user account with email and password.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "Jane Doe" // optional
}
```

**Validation Rules:**
- Email must be valid format
- Password must be at least 6 characters
- Email must be unique (not already registered)

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatar": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Invalid email format
- `400` - Password too short
- `400` - Email already registered
- `500` - Server error

---

### 3. Login User

Authenticate with email and password.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatar": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Missing email or password
- `400` - Account registered with Google (use Google login)
- `401` - Invalid email or password
- `500` - Server error

---

### 4. Google OAuth Login

Initiate Google OAuth authentication flow.

**Endpoint:** `GET /api/auth/google`

**Authentication:** Not required

**Flow:**
1. User clicks "Continue with Google" button
2. Redirects to Google OAuth consent screen
3. User authorizes the application
4. Google redirects back to callback URL
5. Server creates/updates user and generates JWT token
6. Redirects to frontend with token in URL query parameter

**Callback Endpoint:** `GET /api/auth/google/callback`

**Success Redirect:**
```
http://localhost:5173?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 5. Get Current User

Retrieve authenticated user's profile information.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatar": "https://example.com/avatar.jpg",
    "provider": "email"
  }
}
```

**Error Responses:**
- `401` - Authentication required (no token)
- `403` - Invalid or expired token
- `404` - User not found
- `500` - Server error

---

### 6. Logout User

Invalidate user session and clear authentication cookie.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Not strictly required (but recommended to send token)

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `500` - Logout failed

---

## Data Models

### User Object

```typescript
{
  id: number;              // Auto-generated user ID
  email: string;           // User's email address
  name: string;            // User's display name
  avatar?: string;         // Profile picture URL (optional)
  provider: string;        // "email" or "google"
  googleId?: string;       // Google OAuth ID (if provider is Google)
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created (registration successful)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Security

### JWT Tokens
- Tokens expire after 7 days
- Include user ID and email in payload
- Signed with HS256 algorithm

### Passwords
- Hashed using bcrypt with 10 salt rounds
- Never stored in plain text
- Minimum length: 6 characters

### Cookies
- HTTP-only flag enabled
- Secure flag in production
- SameSite policy enforced

### CORS
- Configured to allow requests from frontend origin
- Credentials included for cookie handling

---

## Rate Limiting

Currently not implemented but recommended for production:
- Login: 5 attempts per 15 minutes per IP
- Registration: 3 attempts per hour per IP
- API calls: 100 requests per minute per user

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Client-Side Integration

### JavaScript Example

```javascript
// Register
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include', // Include cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'Jane Doe'
  })
});

const data = await response.json();
if (response.ok) {
  // Store token in localStorage
  localStorage.setItem('token', data.token);
  // User is now logged in
  console.log('User:', data.user);
}
```

### React Hook Example

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.user;
};
```

---

## Notes

- All timestamps are in ISO 8601 format
- Email addresses are case-sensitive
- Tokens should be stored securely (localStorage for web, secure storage for mobile)
- Always use HTTPS in production
- Google OAuth requires proper domain configuration in Google Cloud Console
