const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const { vulnerableAdminCheck } = require("../middleware/auth");

// ============================================================
// VULNERABLE ADMIN ROUTES — /api/admin-portal-7391/*
//
// VULNERABILITY: These routes use `vulnerableAdminCheck` which
// only verifies the JWT token exists but NEVER checks if the
// user has the admin role. Any authenticated user can call
// these endpoints and get full admin capabilities.
//
// The route path is "hidden" but discoverable via:
// - Checking the JS bundle (window.__APP_CONFIG__)
// - Reading HTML comments in index.html
// - Directory brute-forcing
// - API enumeration
// ============================================================

// GET /api/admin-portal-7391/users — List all users
router.get("/users", vulnerableAdminCheck, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json({
            message: "All users retrieved (VULNERABLE endpoint)",
            count: users.length,
            users,
            // Expose extra sensitive info to make the demo more realistic
            serverInfo: {
                nodeVersion: process.version,
                environment: process.env.NODE_ENV,
                vulnerabilityNote: "This endpoint has NO role check! Any logged-in user can access it.",
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// DELETE /api/admin-portal-7391/users/:id — Delete a user
router.delete("/users/:id", vulnerableAdminCheck, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself (minimal safety)
        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot delete your own account." });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({
            message: `User "${user.username}" deleted successfully (VULNERABLE endpoint)`,
            deletedUser: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// GET /api/admin-portal-7391/posts — List all posts (including unpublished)
router.get("/posts", vulnerableAdminCheck, async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "username email role").sort({ createdAt: -1 });
        res.json({
            message: "All posts retrieved (VULNERABLE endpoint)",
            count: posts.length,
            posts,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// PUT /api/admin-portal-7391/posts/:id — Modify a post
router.put("/posts/:id", vulnerableAdminCheck, async (req, res) => {
    try {
        const { title, content, isPublished } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { title, content, isPublished },
            { new: true, runValidators: true }
        ).populate("author", "username email");

        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        res.json({ message: "Post updated (VULNERABLE endpoint)", post });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// DELETE /api/admin-portal-7391/posts/:id — Delete a post
router.delete("/posts/:id", vulnerableAdminCheck, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }
        res.json({ message: `Post "${post.title}" deleted (VULNERABLE endpoint)`, post });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// PUT /api/admin-portal-7391/users/:id/role — Change user role
router.put("/users/:id/role", vulnerableAdminCheck, async (req, res) => {
    try {
        const { role } = req.body;
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'." });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json({ message: `Role updated to "${role}" (VULNERABLE endpoint)`, user });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

module.exports = router;