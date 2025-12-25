import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import cors from 'cors';
import validator from 'validator';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: ['.env.local', '.env'] });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Security: JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

// Security: Session secret
const SESSION_SECRET = process.env.SESSION_SECRET;

// Validate required secrets in production
if (process.env.NODE_ENV === 'production') {
	if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
		console.error('❌ JWT_SECRET must be set in production environment');
		process.exit(1);
	}
	if (!SESSION_SECRET || SESSION_SECRET === 'session-secret-change-in-production') {
		console.error('❌ SESSION_SECRET must be set in production environment');
		process.exit(1);
	}
}

// Use default secrets only in development
const jwtSecret = JWT_SECRET || 'dev-jwt-secret-change-in-production';
const sessionSecret = SESSION_SECRET || 'dev-session-secret-change-in-production';

// Middleware
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
			styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
			fontSrc: ["'self'", "https://fonts.gstatic.com"],
			imgSrc: ["'self'", "data:", "https:", "http:"],
			connectSrc: ["'self'"],
		},
	},
}));
app.use(cors({
	origin: process.env.CLIENT_URL || 'http://localhost:5173',
	credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for Passport)
// Note: Using JWT for API authentication, session is only for OAuth flow
app.use(session({
	secret: sessionSecret,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	}
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // 5 requests per window
	message: 'Too many authentication attempts, please try again later.'
});

// Rate limiting for protected API endpoints
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // 100 requests per window
	message: 'Too many requests, please try again later.'
});

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
	if (err) console.error('Database connection error:', err.message);
	else console.log('Connected to the SQLite database.');
});

// Create Users table with enhanced schema
db.run(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT UNIQUE NOT NULL,
		name TEXT,
		password TEXT,
		avatar TEXT,
		provider TEXT DEFAULT 'email',
		provider_id TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`, (err) => {
	if (err) console.error('Error creating users table:', err);
	else console.log('Users table ready.');
});

// Passport Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	passport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
	}, async (accessToken, refreshToken, profile, done) => {
		try {
			const email = profile.emails?.[0]?.value;
			const name = profile.displayName;
			const avatar = profile.photos?.[0]?.value;
			const providerId = profile.id;

			if (!email) {
				return done(new Error('No email found in Google profile'));
			}

			// Check if user exists
			db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
				if (err) return done(err);

				if (user) {
					// Update existing user
					db.run(
						'UPDATE users SET name = ?, avatar = ?, provider = ?, provider_id = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
						[name, avatar, 'google', providerId, email],
						(err) => {
							if (err) return done(err);
							return done(null, { ...user, name, avatar });
						}
					);
				} else {
					// Create new user
					db.run(
						'INSERT INTO users (email, name, avatar, provider, provider_id) VALUES (?, ?, ?, ?, ?)',
						[email, name, avatar, 'google', providerId],
						function (err) {
							if (err) return done(err);
							const newUser = { id: this.lastID, email, name, avatar, provider: 'google' };
							return done(null, newUser);
						}
					);
				}
			});
		} catch (error) {
			return done(error);
		}
	}));

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		db.get('SELECT id, email, name, avatar, provider FROM users WHERE id = ?', [id], (err, user) => {
			done(err, user);
		});
	});
}

// Helper function to generate JWT
const generateToken = (user) => {
	return jwt.sign(
		{ id: user.id, email: user.email },
		jwtSecret,
		{ expiresIn: JWT_EXPIRES_IN }
	);
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({ error: 'Access token required' });
	}

	jwt.verify(token, jwtSecret, (err, user) => {
		if (err) return res.status(403).json({ error: 'Invalid or expired token' });
		req.user = user;
		next();
	});
};

// Input validation helper
const validateEmail = (email) => {
	return validator.isEmail(email) && email.length <= 255;
};

const validatePassword = (password) => {
	return password && password.length >= 8 && password.length <= 100;
};

// ===== AUTH ENDPOINTS =====

// Sign Up with Email
app.post('/api/auth/signup', authLimiter, async (req, res) => {
	const { email, password, name } = req.body;

	try {
		// Validation
		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

		if (!validateEmail(email)) {
			return res.status(400).json({ error: 'Invalid email format' });
		}

		if (!validatePassword(password)) {
			return res.status(400).json({ error: 'Password must be at least 8 characters long' });
		}

		// Check if user exists
		db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
			if (err) {
				console.error('Database error:', err);
				return res.status(500).json({ error: 'Server error' });
			}

			if (existingUser) {
				return res.status(400).json({ error: 'Email already registered' });
			}

			// Hash password
			const hashedPassword = await bcrypt.hash(password, 12);

			// Insert user
			db.run(
				'INSERT INTO users (email, password, name, provider) VALUES (?, ?, ?, ?)',
				[email, hashedPassword, name || email.split('@')[0], 'email'],
				function (err) {
					if (err) {
						console.error('Error creating user:', err);
						return res.status(500).json({ error: 'Failed to create user' });
					}

					const userId = this.lastID;
					const user = { id: userId, email, name: name || email.split('@')[0] };
					const token = generateToken(user);

					res.status(201).json({
						message: 'User created successfully',
						token,
						user: {
							id: user.id,
							email: user.email,
							name: user.name
						}
					});
				}
			);
		});
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({ error: 'Server error' });
	}
});

// Sign In with Email
app.post('/api/auth/signin', authLimiter, async (req, res) => {
	const { email, password } = req.body;

	try {
		// Validation
		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

		if (!validateEmail(email)) {
			return res.status(400).json({ error: 'Invalid email format' });
		}

		// Find user
		db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
			if (err) {
				console.error('Database error:', err);
				return res.status(500).json({ error: 'Server error' });
			}

			if (!user || !user.password) {
				return res.status(401).json({ error: 'Invalid email or password' });
			}

			// Verify password
			const isValid = await bcrypt.compare(password, user.password);
			if (!isValid) {
				return res.status(401).json({ error: 'Invalid email or password' });
			}

			const token = generateToken(user);

			res.json({
				message: 'Login successful',
				token,
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					avatar: user.avatar
				}
			});
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Server error' });
	}
});

// Google OAuth - Initiate
app.get('/api/auth/google', 
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth - Callback
app.get('/api/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/login-failed' }),
	(req, res) => {
		// Generate JWT for the authenticated user
		const token = generateToken(req.user);
		
		// Redirect to frontend with token
		const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
		res.redirect(`${clientUrl}?token=${token}&auth=success`);
	}
);

// Get Current User (Protected Route)
app.get('/api/auth/me', apiLimiter, authenticateToken, (req, res) => {
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

// Update User Profile (Protected Route)
app.put('/api/auth/profile', apiLimiter, authenticateToken, (req, res) => {
	const { name, avatar } = req.body;

	if (!name || name.length === 0) {
		return res.status(400).json({ error: 'Name is required' });
	}

	db.run(
		'UPDATE users SET name = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
		[name, avatar || null, req.user.id],
		function (err) {
			if (err) {
				console.error('Update error:', err);
				return res.status(500).json({ error: 'Failed to update profile' });
			}

			if (this.changes === 0) {
				return res.status(404).json({ error: 'User not found' });
			}

			res.json({ message: 'Profile updated successfully' });
		}
	);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files (for production)
app.use(express.static('dist'));

// Catch-all route to serve React app
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Server error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
	console.log(`🚀 Server running at http://localhost:${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
	if (!process.env.GOOGLE_CLIENT_ID) {
		console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local');
	}
});
