const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Route to render registration page
router.get('/register', (req, res) => res.render('register'));

// Route to render login page
router.get('/login', (req, res) => res.render('login'));

// Route to render user profile
router.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    res.render('profile', { user: req.session.user });
});

// Register new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already exists');
            return res.redirect('/auth/register');
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });

        await user.save();
        req.flash('success', 'Registration successful');
        res.redirect('/auth/login');
    } catch (error) {
        if (error.code === 11000) {
            req.flash('error', 'Email already exists');
            return res.redirect('/auth/register');
        }
        console.error(error);
        req.flash('error', 'An error occurred, please try again.');
        res.redirect('/auth/register');
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        res.redirect('/auth/profile');
    } else {
        req.flash('error', 'Invalid credentials');
        res.redirect('/auth/login');
    }
});

// Logout user
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return console.error(err);
        res.redirect('/');
    });
});

module.exports = router;
