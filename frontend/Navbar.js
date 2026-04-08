import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="nav-inner">
                <Link to="/" className="nav-brand">
                    <span className="brand-icon">⬡</span>
                    <span className="brand-text">Sec<span className="accent">Lab</span></span>
                    <span className="brand-badge">DEMO</span>
                </Link>

                <div className={`nav-links ${menuOpen ? "open" : ""}`}>
                    <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Feed</Link>
                    <Link to="/exploit-guide" className="nav-link" onClick={() => setMenuOpen(false)}>Exploit Guide</Link>
                    {user && (
                        <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                    )}
                    {/* Note: Admin panel is NOT linked here — hidden on purpose */}
                </div>

                <div className="nav-actions">
                    {user ? (
                        <>
                            <div className="nav-user">
                                <span className={`role-dot ${user.role}`}></span>
                                <span className="nav-username">{user.username}</span>
                                <span className={`badge badge-${user.role}`}>{user.role}</span>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </>
                    )}
                </div>

                <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                    <span /><span /><span />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;