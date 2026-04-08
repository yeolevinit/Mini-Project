const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { verifyToken } = require("../middleware/auth");

// GET /api/posts — Public feed (published posts only)
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find({ isPublished: true })
            .populate("author", "username")
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/posts — Create a post (authenticated users only)
router.post("/", verifyToken, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required." });
        }

        const post = new Post({
            title,
            content,
            category: category || "General",
            author: req.user._id,
        });

        await post.save();
        await post.populate("author", "username email");

        res.status(201).json({ message: "Post created!", post });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

// DELETE /api/posts/:id — Delete own post
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found." });

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own posts." });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted." });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;