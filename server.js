import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('dist')); // Serve front-end files

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
	if (err) console.error(err.message);
	console.log('Connected to the SQLite database.');
});

// Create Users table
db.run(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE,
		password TEXT
	)
`);

// Register Endpoint
app.post('/api/register', async (req, res) => {
	const { username, password } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		db.run(
			`INSERT INTO users (username, password) VALUES (?, ?)`,
			[username, hashedPassword],
			function (err) {
				if (err) return res.status(400).json({ error: 'Username already exists' });
				res.status(201).json({ message: 'User created', id: this.lastID });
			}
		);
	} catch (error) {
		res.status(500).json({ error: 'Server error' });
	}
});

// Login Endpoint
app.post('/api/login', (req, res) => {
	const { username, password } = req.body;
	db.get(
		`SELECT * FROM users WHERE username = ?`,
		[username],
		async (err, user) => {
			if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });

			const match = await bcrypt.compare(password, user.password);
			if (match) {
				res.json({ message: 'Login successful', userId: user.id });
			} else {
				res.status(401).json({ error: 'Invalid credentials' });
			}
		}
	);
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
