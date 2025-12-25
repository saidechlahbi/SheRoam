# Setup Guide - Quick Start

This guide will help you get SheRoam running quickly on your local machine.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
git clone https://github.com/saidechlahbi/SheRoam.git
cd SheRoam
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Generate secure secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Update the .env file with the generated secrets
```

Your `.env` file should look like:
```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database.sqlite

# Use the generated secrets from above
JWT_SECRET=<your-generated-jwt-secret>
SESSION_SECRET=<your-generated-session-secret>

# Leave Google OAuth empty for now (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

FRONTEND_URL=http://localhost:5173
```

### 3. Run the Application

**Option A: Development Mode (Recommended)**

Terminal 1 - Start Backend:
```bash
npm run dev:server
```

Terminal 2 - Start Frontend:
```bash
npm run dev
```

Then open: http://localhost:5173

**Option B: Production Mode**

```bash
npm run build
npm start
```

Then open: http://localhost:3000

## Test the Authentication

### 1. Sign Up

1. Click "Join Now" or "Log in" in the navigation
2. Click "Continue with Email"
3. Fill in your details:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
4. Click "Sign Up"

### 2. Verify Login

After signing up, you should:
- See your name in the top navigation
- Have a "Sign out" button
- Be able to refresh the page and stay logged in

### 3. Test Logout

1. Click "Sign out"
2. You should see "Log in" and "Join Now" buttons again

### 4. Test Login

1. Click "Log in"
2. Click "Sign In" (at the bottom)
3. Enter your email and password
4. Click "Sign In"
5. You should be logged in again

## Optional: Enable Google OAuth

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
7. Copy the Client ID and Client Secret

### 2. Update .env

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 3. Restart Backend

Stop the backend server (Ctrl+C) and restart it:
```bash
npm run dev:server
```

### 4. Test Google Login

1. Click "Log in"
2. Click "Continue with Google"
3. Select your Google account
4. You should be logged in!

## Troubleshooting

### Port Already in Use

If you see "Port 3000 is already in use":

**On macOS/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

**On Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Locked

If you see "database is locked":
```bash
rm database.sqlite
# The database will be recreated on next server start
```

### Build Errors

If the build fails:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Cannot Connect to Backend

Make sure:
1. Backend is running on port 3000
2. Frontend is configured to use `http://localhost:3000` as API URL
3. CORS is enabled in backend (it is by default)

## Verify Installation

### Check Backend

```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok","message":"Server is running"}
```

### Check Database

```bash
sqlite3 database.sqlite "SELECT * FROM users;"
# Should show your registered users
```

### Check API Endpoints

```bash
# Test registration (should fail - email already exists)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Next Steps

### 1. Explore the App
- Try the Safety Analysis feature
- Browse Places
- Check out the Community Feed

### 2. Read the Documentation
- `README.md` - Full documentation
- `API_DOCUMENTATION.md` - API reference
- `SECURITY.md` - Security best practices

### 3. For Production Deployment
- Review `SECURITY.md` production checklist
- Set up HTTPS
- Implement rate limiting
- Use production database (PostgreSQL/MySQL)
- Set up monitoring

## Common Commands

```bash
# Development
npm run dev              # Start frontend dev server
npm run dev:server       # Start backend server

# Production
npm run build            # Build frontend
npm start                # Start production server

# Database
sqlite3 database.sqlite  # Open database CLI
.tables                  # List tables
.schema users           # Show users table schema
SELECT * FROM users;    # View all users

# Testing
curl http://localhost:3000/api/health  # Health check
```

## Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Check [SECURITY.md](SECURITY.md) for security best practices
- Open an issue on GitHub for bugs or questions

## Success!

If you've made it here, you have:
- ✅ Backend server running
- ✅ Frontend application running
- ✅ Database created and working
- ✅ User authentication working
- ✅ Email/password signup and login working
- ✅ Session persistence working

You're ready to start developing! 🚀
