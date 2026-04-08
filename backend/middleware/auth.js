const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
// MIDDLEWARE 1: Verify JWT Token (used by BOTH versions)
// ============================================================
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided. Please log in." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// ============================================================
// MIDDLEWARE 2 (VULNERABLE): No role check at all!
// 
// VULNERABILITY: This middleware only checks if the user is
// logged in (has a valid JWT), but does NOT verify whether
// the user has the "admin" role. Any authenticated user can
// pass through this middleware — even a regular "user".
//
// HOW TO EXPLOIT:
// 1. Register as a normal user
// 2. Get your JWT token from login
// 3. Make GET requests to /api/admin-portal-7391/*
//    with your token in the Authorization header
// 4. You get full admin access!
// ============================================================
const vulnerableAdminCheck = async (req, res, next) => {
    // BUG: Only checks authentication, not authorization!
    // We verify the token but NEVER check req.user.role === "admin"
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found." });
        }

        req.user = user;
        // ⚠️  VULNERABILITY: Missing role check here!
        // Should be: if (user.role !== "admin") return res.status(403).json(...)
        next(); // Let ANY logged-in user through!
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// ============================================================
// MIDDLEWARE 3 (SECURE): Proper Role-Based Access Control
//
// FIX: After verifying the JWT, we explicitly check if the
// user's role is "admin". If not, we return 403 Forbidden.
// This stops privilege escalation attacks cold.
// ============================================================
const secureAdminCheck = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found." });
        }

        req.user = user;

        // ✅ SECURE: Explicitly check the role stored in the database
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin privileges required.",
                yourRole: req.user.role,
                requiredRole: "admin",
            });
        }

        next(); // Only admins get here
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = { verifyToken, vulnerableAdminCheck, secureAdminCheck };