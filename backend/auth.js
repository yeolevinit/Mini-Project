const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: "Username or email already exists." });
        }

        // New users always get role "user" — never trust client-sent roles!
        const user = new User({ username, email, password, role: "user" });
        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            message: "Account created successfully!",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration.", error: error.message });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login.", error: error.message });
    }
});

// GET /api/auth/me
router.get("/me", verifyToken, async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
            createdAt: req.user.createdAt,
        },
    });
});

module.exports = router;