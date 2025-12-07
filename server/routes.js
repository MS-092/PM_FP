const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./database');
const router = express.Router();

// Register
router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const hash = bcrypt.hashSync(password, 8);

    const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    stmt.run(username, email, hash, function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Username or Email already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, username, email });
    });
    stmt.finalize();
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid password' });

        // In a real app, generate JWT here. For simplicity, return user info.
        res.json({ id: user.id, username: user.username, email: user.email });
    });
});

// Save Score
router.post('/score', (req, res) => {
    const { userId, category, score } = req.body;

    const stmt = db.prepare('INSERT INTO scores (user_id, category, score) VALUES (?, ?, ?)');
    stmt.run(userId, category, score, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
    stmt.finalize();
});

// Get Scores (Leaderboard or History)
router.get('/scores/:userId', (req, res) => {
    const { userId } = req.params;
    db.all('SELECT * FROM scores WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
