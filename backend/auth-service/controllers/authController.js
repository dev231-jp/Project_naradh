const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// @desc    Register a new user
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        // Check if user exists
        let user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Save user
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, role',
            [name, email, password_hash]
        );

        const userId = newUser.rows[0].id;
        const userRole = newUser.rows[0].role;

        // Generate tokens
        const accessToken = jwt.sign({ id: userId, role: userRole }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ accessToken });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Authenticate user & get token
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check for user
        let user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const userId = user.rows[0].id;
        const userRole = user.rows[0].role;

        // Generate tokens
        const accessToken = jwt.sign({ id: userId, role: userRole }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ accessToken });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get new access token from refresh token
exports.refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await db.query('SELECT role FROM users WHERE id = $1', [decoded.id]);

        if (user.rows.length === 0) {
            return res.sendStatus(403);
        }

        const accessToken = jwt.sign({ id: decoded.id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });

    } catch (err) {
        return res.sendStatus(403);
    }
};

// @desc    Logout user (invalidate refresh token)
exports.logout = (req, res) => {
    res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
    res.json({ msg: 'Logged out successfully' });
};
