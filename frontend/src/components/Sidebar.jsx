import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, LayoutDashboard, BookmarkCheck, Users, Sparkles, LogOut, X, User } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!isOpen) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-container" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <div className="navbar-brand">
            <Film size={22} color="#e50914" />
            <span>Cine<span className="logo-highlight">Family</span></span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {user && (
          <div className="sidebar-user-card">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || 'User')}`}
              alt={user.name}
              className="sidebar-avatar"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || 'User')}`;
              }}
            />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className={`badge badge-role-${user.role}`}>{user.role}</span>
            </div>
          </div>
        )}

        <div className="sidebar-links">
          {user ? (
            <>
              <Link to="/dashboard" onClick={onClose} className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/movies" onClick={onClose} className={`sidebar-link ${isActive('/movies') ? 'active' : ''}`}>
                <Film size={20} />
                <span>Movies</span>
              </Link>
              <Link to="/watchlist" onClick={onClose} className={`sidebar-link ${isActive('/watchlist') ? 'active' : ''}`}>
                <BookmarkCheck size={20} />
                <span>Watchlist</span>
              </Link>
              <Link to="/family" onClick={onClose} className={`sidebar-link ${isActive('/family') ? 'active' : ''}`}>
                <Users size={20} />
                <span>Family Workspace</span>
              </Link>
              <Link to="/recommendations" onClick={onClose} className={`sidebar-link ${isActive('/recommendations') ? 'active' : ''}`}>
                <Sparkles size={20} />
                <span>Recommendations</span>
              </Link>
              <Link to="/profile" onClick={onClose} className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}>
                <User size={20} />
                <span>My Profile</span>
              </Link>
              <button onClick={() => { logout(); onClose(); }} className="sidebar-link logout">
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/movies" onClick={onClose} className="sidebar-link">
                <Film size={20} />
                <span>Browse Movies</span>
              </Link>
              <Link to="/login" onClick={onClose} className="sidebar-link">
                <span>Log In</span>
              </Link>
              <Link to="/register" onClick={onClose} className="sidebar-link active">
                <span>Register Account</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
