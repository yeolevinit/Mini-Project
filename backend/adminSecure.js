const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const { secureAdminCheck } = require("../middleware/auth");

// ============================================================
// SECURE ADMIN ROUTES — /api/secure-admin/*
//
// FIX: These routes use `secureAdminCheck` which:
// 1. Verifies the JWT token
// 2. Loads the user from the database
// 3. Checks req.user.role === "admin"
// 4. Returns 403 Forbidden if the role doesn't match
//
// A regular user hitting these endpoints gets:
// { "message": "Access denied. Admin privileges required." }
// with HTTP 403 — no data leakage.
// ============================================================

// GET /api/secure-admin/users
router.get("/users", secureAdminCheck, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json({
            message: "All users retrieved (SECURE endpoint)",
            count: users.length,
            users,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// DELETE /api/secure-admin/users/:id
router.delete("/users/:id", secureAdminCheck, async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot delete your own account." });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({
            message: `User "${user.username}" deleted (SECURE endpoint)`,
            deletedUser: { id: user._id, username: user.username },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// GET /api/secure-admin/posts
router.get("/posts", secureAdminCheck, async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "username email role").sort({ createdAt: -1 });
        res.json({
            message: "All posts retrieved (SECURE endpoint)",
            count: posts.length,
            posts,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// PUT /api/secure-admin/posts/:id
router.put("/posts/:id", secureAdminCheck, async (req, res) => {
    try {
        const { title, content, isPublished } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { title, content, isPublished },
            { new: true, runValidators: true }
        ).populate("author", "username email");

        if (!post) return res.status(404).json({ message: "Post not found." });
        res.json({ message: "Post updated (SECURE endpoint)", post });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// DELETE /api/secure-admin/posts/:id
router.delete("/posts/:id", secureAdminCheck, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found." });
        res.json({ message: `Post "${post.title}" deleted (SECURE endpoint)`, post });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// PUT /api/secure-admin/users/:id/role
router.put("/users/:id/role", secureAdminCheck, async (req, res) => {
    try {
        const { role } = req.body;
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role." });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json({ message: `Role updated to "${role}" (SECURE endpoint)`, user });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

module.exports = router;