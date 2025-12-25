<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SheRoam - Women's Travel Companion App

A full-stack web application designed exclusively for women travelers, featuring AI-powered safety insights, verified places, and a global community.

## Features

- 🔐 **Complete Authentication System**
  - Email/password signup and signin with secure password hashing
  - Google OAuth integration
  - JWT-based session management
  - Protected routes and user profiles

- 🛡️ **AI Safety Analysis** - Real-time safety scores for destinations
- 🌍 **Verified Places** - Curated recommendations for accommodations, cafes, and activities
- 👥 **Community Feed** - Connect with women travelers worldwide
- 🤝 **Travel Buddy Finder** - Find companions for your journey
- 📝 **Travel Blog** - Read and share travel experiences

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons

**Backend:**
- Node.js with Express
- SQLite database
- Passport.js for OAuth
- JWT for authentication
- Bcrypt for password hashing

**AI Integration:**
- Google Gemini AI for safety analysis and recommendations

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:

```env
# Required: Gemini API Key for AI features
GEMINI_API_KEY=your-gemini-api-key
API_KEY=your-gemini-api-key

# Required: JWT and Session Secrets (use strong random strings)
JWT_SECRET=your-secret-key-change-in-production
SESSION_SECRET=session-secret-change-in-production

# Optional: Google OAuth (for Sign in with Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Run the application

**Development mode (run both frontend and backend):**

Terminal 1 - Backend:
```bash
npm start
```

Terminal 2 - Frontend:
```bash
npm run dev
```

- Frontend will be available at: http://localhost:5173
- Backend API at: http://localhost:3000

**Production mode:**
```bash
# Build the frontend
npm run dev -- build

# Start the backend (serves built frontend)
npm start
```

## Getting API Keys

### Gemini API Key (Required)
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy it to your `.env.local` file

### Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
7. Copy Client ID and Secret to `.env.local`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account with email/password
- `POST /api/auth/signin` - Sign in with email/password
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user (requires JWT token)
- `PUT /api/auth/profile` - Update user profile (requires JWT token)

### Health Check
- `GET /api/health` - Server health status

## Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT token-based authentication
- ✅ Rate limiting on auth endpoints
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ SQL injection prevention with parameterized queries
- ✅ Secure session cookies (httpOnly, secure in production)

## Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT,
    avatar TEXT,
    provider TEXT DEFAULT 'email',
    provider_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on GitHub.
