const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
require("dotenv").config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await User.deleteMany({});
        await Post.deleteMany({});
        console.log("Cleared existing data.");

        // Create admin user
        const admin = new User({
            username: "admin",
            email: "admin@seclab.dev",
            password: "Admin@1234",
            role: "admin",
        });
        await admin.save();

        // Create regular users
        const alice = new User({
            username: "alice",
            email: "alice@example.com",
            password: "Alice@1234",
            role: "user",
        });
        await alice.save();

        const bob = new User({
            username: "bob",
            email: "bob@example.com",
            password: "Bob@1234",
            role: "user",
        });
        await bob.save();

        const charlie = new User({
            username: "charlie",
            email: "charlie@example.com",
            password: "Charlie@1234",
            role: "user",
        });
        await charlie.save();

        // Create sample posts
        const posts = [
            {
                title: "Welcome to SecLab",
                content: "This platform demonstrates common web security vulnerabilities in a safe, educational environment.",
                author: admin._id,
                category: "Announcement",
            },
            {
                title: "Understanding Broken Access Control",
                content: "Broken Access Control (BAC) is the #1 vulnerability in the OWASP Top 10 2021. It occurs when users can act outside their intended permissions.",
                author: admin._id,
                category: "Security",
            },
            {
                title: "My first security research",
                content: "I've been learning about web application security and it's fascinating how many apps have subtle bugs.",
                author: alice._id,
                category: "Research",
            },
            {
                title: "JWT tokens and their pitfalls",
                content: "JSON Web Tokens are widely used for authentication, but improper implementation can lead to serious vulnerabilities.",
                author: bob._id,
                category: "Security",
            },
            {
                title: "Hidden routes and security through obscurity",
                content: "Security through obscurity is not a real security measure. Hidden routes can be discovered through various means.",
                author: charlie._id,
                category: "Security",
            },
        ];

        for (const postData of posts) {
            const post = new Post(postData);
            await post.save();
        }

        console.log("\n✅ Seed completed successfully!");
        console.log("\n📋 Test Accounts:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("👑 Admin:   admin@seclab.dev    / Admin@1234");
        console.log("👤 User 1:  alice@example.com   / Alice@1234");
        console.log("👤 User 2:  bob@example.com     / Bob@1234");
        console.log("👤 User 3:  charlie@example.com / Charlie@1234");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n🔓 Vulnerable admin panel: /admin-portal-7391");
        console.log("🔒 Secure admin panel:     /secure-admin");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
};

seed();