// ============================================================
// APP CONFIGURATION
//
// VULNERABILITY: The hidden admin route is exposed here in the
// JavaScript bundle. Any user can open DevTools → Sources and
// search for "admin" to find it. This is a common mistake:
// developers think hiding a route in JS is "security".
//
// window.__APP_CONFIG__ is also set globally so it appears
// in the browser console when you type: window.__APP_CONFIG__
// ============================================================

const config = {
    API_BASE: process.env.REACT_APP_API_BASE || "http://localhost:5000/api",

    // ⚠️  VULNERABILITY: Admin route exposed in frontend bundle!
    // Attackers can find this by:
    // 1. Viewing page source
    // 2. DevTools → Sources → Search "admin"
    // 3. Checking window.__APP_CONFIG__ in console
    VULNERABLE_ADMIN_PATH: "/admin-portal-7391",
    SECURE_ADMIN_PATH: "/secure-admin",

    APP_NAME: "SecLab",
    VERSION: "1.0.0-demo",
};

// Expose config globally (another common mistake)
window.__APP_CONFIG__ = config;

export default config;