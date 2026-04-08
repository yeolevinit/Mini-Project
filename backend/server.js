require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
if (process.env.NODE_ENV === "development") {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
}

// ============================================================
// DATABASE CONNECTION
// ============================================================
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    });

// ============================================================
// ROUTES
// ============================================================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));

// VULNERABLE admin route — hidden but discoverable
// The route name "admin-portal-7391" is obscure but NOT secure.
// Hint left in frontend source code for attackers to find.
app.use("/api/admin-portal-7391", require("./routes/adminVulnerable"));

// SECURE admin route — proper RBAC enforced
app.use("/api/secure-admin", require("./routes/adminSecure"));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error.", error: err.message });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 SecLab Backend running on http://localhost:${PORT}`);
    console.log(`📖 Environment: ${process.env.NODE_ENV}`);
    console.log(`\n⚠️  Vulnerable route: /api/admin-portal-7391`);
    console.log(`✅  Secure route:     /api/secure-admin\n`);
});