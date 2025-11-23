const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const authController = require('../controllers/authController');

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    [
        body('name', 'Name is required').not().isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    ],
    authController.register
);

// @route   POST /auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists(),
    ],
    authController.login
);

// @route   POST /auth/refresh
// @desc    Get new access token from refresh token
// @access  Public
router.post('/refresh', authController.refresh);

// @route   POST /auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Public
router.post('/logout', authController.logout);

module.exports = router;
