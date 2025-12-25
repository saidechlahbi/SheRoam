import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import validator from 'validator';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// JWT and Session secrets
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-jwt-key-change-in-production';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-session-key-change-in-production';

// Middleware
app.use(cors({
	origin: process.env.FRONTEND_URL || 'http://localhost:5173',
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	}
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve front-end files
app.use(express.static('dist'));

// Database setup
const db = new sqlite3.Database(process.env.DATABASE_PATH || './database.sqlite', (err) => {
	if (err) console.error('Database connection error:', err.message);
	console.log('Connected to the SQLite database.');
});

// Create Users table with enhanced schema
db.run(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT UNIQUE NOT NULL,
		name TEXT,
		password TEXT,
		avatar TEXT,
		googleId TEXT UNIQUE,
		provider TEXT DEFAULT 'email',
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`, (err) => {
	if (err) console.error('Table creation error:', err.message);
});

// Passport serialization
passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	db.get('SELECT id, email, name, avatar, provider FROM users WHERE id = ?', [id], (err, user) => {
		done(err, user);
	});
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	passport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
	}, async (accessToken, refreshToken, profile, done) => {
		try {
			// Check if user exists
			db.get('SELECT * FROM users WHERE googleId = ?', [profile.id], async (err, user) => {
				if (err) return done(err);
				
				if (user) {
					// Update existing user
					db.run(
						'UPDATE users SET name = ?, avatar = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
						[profile.displayName, profile.photos?.[0]?.value, user.id],
						(updateErr) => {
							if (updateErr) return done(updateErr);
							return done(null, user);
						}
					);
				} else {
					// Create new user
					const email = profile.emails?.[0]?.value;
					const name = profile.displayName;
					const avatar = profile.photos?.[0]?.value;
					
					db.run(
						`INSERT INTO users (email, name, avatar, googleId, provider) VALUES (?, ?, ?, ?, 'google')`,
						[email, name, avatar, profile.id],
						function (insertErr) {
							if (insertErr) return done(insertErr);
							return done(null, { id: this.lastID, email, name, avatar, provider: 'google' });
						}
					);
				}
			});
		} catch (error) {
			return done(error);
		}
	}));
}

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
	const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
	
	if (!token) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	
	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ error: 'Invalid or expired token' });
		}
		req.user = user;
		next();
	});
};

// Generate JWT token
const generateToken = (user) => {
	return jwt.sign(
		{ id: user.id, email: user.email },
		JWT_SECRET,
		{ expiresIn: '7d' }
	);
};

// ============================================
// AUTH ROUTES
// ============================================

// Register with Email/Password
app.post('/api/auth/register', async (req, res) => {
	const { email, password, name } = req.body;
	
	// Validation
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}
	
	if (!validator.isEmail(email)) {
		return res.status(400).json({ error: 'Invalid email address' });
	}
	
	if (password.length < 6) {
		return res.status(400).json({ error: 'Password must be at least 6 characters' });
	}
	
	try {
		// Check if user already exists
		db.get('SELECT * FROM users WHERE email = ?', [email], async (err, existingUser) => {
			if (err) {
				return res.status(500).json({ error: 'Database error' });
			}
			
			if (existingUser) {
				return res.status(400).json({ error: 'Email already registered' });
			}
			
			// Hash password
			const hashedPassword = await bcrypt.hash(password, 10);
			
			// Insert user
			db.run(
				`INSERT INTO users (email, password, name, provider) VALUES (?, ?, ?, 'email')`,
				[email, hashedPassword, name || email.split('@')[0]],
				function (insertErr) {
					if (insertErr) {
						return res.status(500).json({ error: 'Failed to create user' });
					}
					
					const user = {
						id: this.lastID,
						email,
						name: name || email.split('@')[0],
						provider: 'email'
					};
					
					// Generate token
					const token = generateToken(user);
					
					// Set cookie
					res.cookie('token', token, {
						httpOnly: true,
						secure: process.env.NODE_ENV === 'production',
						maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
					});
					
					res.status(201).json({
						message: 'User registered successfully',
						user: {
							id: user.id,
							email: user.email,
							name: user.name,
							avatar: user.avatar
						},
						token
					});
				}
			);
		});
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({ error: 'Server error' });
	}
});

// Login with Email/Password
app.post('/api/auth/login', async (req, res) => {
	const { email, password } = req.body;
	
	// Validation
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}
	
	try {
		db.get(
			'SELECT * FROM users WHERE email = ?',
			[email],
			async (err, user) => {
				if (err) {
					return res.status(500).json({ error: 'Database error' });
				}
				
				if (!user) {
					return res.status(401).json({ error: 'Invalid email or password' });
				}
				
				// Check if user registered with Google
				if (user.provider === 'google' || !user.password) {
					return res.status(400).json({ error: 'Please sign in with Google' });
				}
				
				// Verify password
				const match = await bcrypt.compare(password, user.password);
				
				if (!match) {
					return res.status(401).json({ error: 'Invalid email or password' });
				}
				
				// Generate token
				const token = generateToken(user);
				
				// Set cookie
				res.cookie('token', token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					maxAge: 7 * 24 * 60 * 60 * 1000
				});
				
				res.json({
					message: 'Login successful',
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
						avatar: user.avatar
					},
					token
				});
			}
		);
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Server error' });
	}
});

// Google OAuth Routes
app.get('/api/auth/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
	passport.authenticate('google', { 
		failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173',
		session: false 
	}),
	(req, res) => {
		// Generate JWT token
		const token = generateToken(req.user);
		
		// Set cookie
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 7 * 24 * 60 * 60 * 1000
		});
		
		// Redirect to frontend with token
		res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`);
	}
);

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
	db.get(
		'SELECT id, email, name, avatar, provider FROM users WHERE id = ?',
		[req.user.id],
		(err, user) => {
			if (err || !user) {
				return res.status(404).json({ error: 'User not found' });
			}
			res.json({ user });
		}
	);
});

// Logout
app.post('/api/auth/logout', (req, res) => {
	res.clearCookie('token');
	req.logout((err) => {
		if (err) {
			return res.status(500).json({ error: 'Logout failed' });
		}
		res.json({ message: 'Logged out successfully' });
	});
});

// Health check
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', message: 'Server is running' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
