import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, LayoutDashboard, BookmarkCheck, Users, Sparkles, LogOut, Sun, Moon, Menu, X, User } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div className="logo-icon">
            <Film size={24} color="#e50914" />
          </div>
          <span className="logo-text">Cine<span className="logo-highlight">Family</span></span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle" onClick={toggleSidebar} aria-label="Toggle Menu">
          <Menu size={24} />
        </button>

        {/* Navigation Links */}
        <div className="nav-links desktop-only">
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/movies" className={`nav-link ${isActive('/movies') ? 'active' : ''}`}>
                <Film size={18} />
                <span>Movies</span>
              </Link>
              <Link to="/watchlist" className={`nav-link ${isActive('/watchlist') ? 'active' : ''}`}>
                <BookmarkCheck size={18} />
                <span>Watchlist</span>
              </Link>
              <Link to="/family" className={`nav-link ${isActive('/family') ? 'active' : ''}`}>
                <Users size={18} />
                <span>Family</span>
              </Link>
              <Link to="/recommendations" className={`nav-link ${isActive('/recommendations') ? 'active' : ''}`}>
                <Sparkles size={18} />
                <span>For You</span>
              </Link>
            </>
          ) : (
            <Link to="/movies" className={`nav-link ${isActive('/movies') ? 'active' : ''}`}>
              <Film size={18} />
              <span>Browse Movies</span>
            </Link>
          )}
        </div>

        {/* Actions & User Profile */}
        <div className="navbar-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="user-profile-menu">
              <Link to="/profile" className="user-pill" title="View Profile">
                <img src={user.avatar} alt={user.name} className="user-avatar" />
                <div className="user-info desktop-only">
                  <span className="user-name">{user.name}</span>
                  <span className={`badge badge-role-${user.role}`}>{user.role}</span>
                </div>
              </Link>
              <button onClick={logout} className="logout-btn" title="Sign Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
