<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SheRoam - Travel Safe, Travel Far

A full-stack web application designed exclusively for women travelers, providing AI-powered safety insights, verified places, and a global community.

## 🚀 Features

### Authentication System
- ✅ **Email/Password Registration & Login** - Secure account creation with bcrypt password hashing
- ✅ **Google OAuth Integration** - Quick sign-in with Google accounts
- ✅ **JWT-based Authentication** - Secure token-based session management
- ✅ **Protected Routes** - API endpoints secured with authentication middleware

### Core Features
- 🛡️ **AI Safety Guard** - Real-time safety analysis for destinations
- 🌍 **Verified Places** - Curated recommendations for female travelers
- 👥 **Community** - Connect with women travelers worldwide
- 🎒 **Travel Buddy Finder** - Find compatible travel companions
- 📝 **Blog & Resources** - Travel tips and guides

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **SQLite** (included with dependencies)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/saidechlahbi/SheRoam.git
cd SheRoam
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory (you can copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./database.sqlite

# JWT & Session Secrets (Generate secure random strings for production!)
JWT_SECRET=your-secure-jwt-secret-key-here
SESSION_SECRET=your-secure-session-secret-key-here

# Google OAuth (Optional - Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Gemini API Key (for AI features)
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Google OAuth Setup (Optional)

To enable Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

## 🚀 Running the Application

### Development Mode

**Option 1: Run Frontend and Backend Separately**

Terminal 1 - Backend Server:
```bash
npm run dev:server
```

Terminal 2 - Frontend Dev Server:
```bash
npm run dev
```

Then visit:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

**Option 2: Run Production Build**

```bash
# Build frontend
npm run build

# Start server (serves both API and frontend)
npm start
```

Then visit: http://localhost:3000

## 📚 API Documentation

### Authentication Endpoints

#### Register with Email/Password
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "Jane Doe" // optional
}

Response:
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe"
  },
  "token": "eyJhbGc..."
}
```

#### Login with Email/Password
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatar": null
  },
  "token": "eyJhbGc..."
}
```

#### Login with Google OAuth
```http
GET /api/auth/google
```
Redirects to Google OAuth consent screen. After authorization, redirects back with token.

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatar": "https://...",
    "provider": "email"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "message": "Logged out successfully"
}
```

#### Health Check
```http
GET /api/health

Response:
{
  "status": "ok",
  "message": "Server is running"
}
```

## 🗄️ Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  avatar TEXT,
  googleId TEXT UNIQUE,
  provider TEXT DEFAULT 'email',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Features

- ✅ **Password Hashing** - Bcrypt with salt rounds
- ✅ **JWT Tokens** - Secure token-based authentication
- ✅ **HTTP-Only Cookies** - Protection against XSS attacks
- ✅ **CORS Configuration** - Controlled cross-origin requests
- ✅ **Input Validation** - Email and password validation
- ✅ **SQL Injection Protection** - Parameterized queries
- ✅ **Session Management** - Secure session handling

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite** - Database
- **Passport.js** - Authentication
- **JWT** - Token management
- **Bcrypt** - Password hashing

### AI & Services
- **Google Gemini AI** - Safety analysis and recommendations

## 📁 Project Structure

```
SheRoam/
├── components/          # React components
│   ├── AuthModal.tsx   # Authentication modal
│   ├── Navbar.tsx      # Navigation bar
│   └── ...
├── services/           # Service layer
│   ├── authService.ts  # Authentication API calls
│   └── geminiService.ts # AI service
├── public/             # Static assets
├── dist/               # Production build
├── server.js           # Express backend server
├── App.tsx             # Main React component
├── types.ts            # TypeScript definitions
├── vite.config.ts      # Vite configuration
├── package.json        # Dependencies
├── .env                # Environment variables (not in git)
├── .env.example        # Environment template
└── README.md           # This file
```

## 🧪 Testing the Application

### Manual Testing

1. **Test Registration:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

2. **Test Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

3. **Test Protected Route:**
```bash
TOKEN="your-jwt-token-here"
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🚀 Deployment

### Production Checklist

- [ ] Update JWT_SECRET and SESSION_SECRET with strong random strings
- [ ] Set NODE_ENV=production
- [ ] Configure Google OAuth with production URLs
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Configure production database (consider PostgreSQL/MySQL for production)
- [ ] **Add rate limiting** (e.g., express-rate-limit) to prevent brute force attacks
- [ ] Implement persistent session store (Redis, MongoDB)
- [ ] Set up monitoring and logging
- [ ] Configure database backups

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<strong-random-secret>
SESSION_SECRET=<strong-random-secret>
GOOGLE_CLIENT_ID=<your-production-client-id>
GOOGLE_CLIENT_SECRET=<your-production-client-secret>
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- [AI Studio App](https://ai.studio/apps/drive/1aoOAvK8VCmz0rllNiK1P7n4TSZCp5YY3)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Gemini API](https://ai.google.dev/)

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for women travelers worldwide
