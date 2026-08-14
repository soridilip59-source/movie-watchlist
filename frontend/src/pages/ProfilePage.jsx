import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Smile, Mail, Calendar, Users, LogOut } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, family, logout } = useAuth();

  if (!user) return null;

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Member';

  return (
    <div className="profile-page animate-fade-in">
      <div className="profile-card">
        <div className="profile-avatar-box">
          <img src={user.avatar} alt={user.name} className="profile-avatar-lg" />
          <span className={`badge badge-role-${user.role} role-pill-lg`}>
            {user.role === 'parent' ? <Shield size={14} /> : <Smile size={14} />}
            <span>{user.role}</span>
          </span>
        </div>

        <div className="profile-header-info">
          <h1 className="profile-user-name">{user.name}</h1>
          <p className="profile-user-email">
            <Mail size={16} />
            <span>{user.email}</span>
          </p>
        </div>

        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <div className="detail-icon">
              <Users size={20} color="#e50914" />
            </div>
            <div className="detail-text">
              <span className="detail-label">Family Workspace</span>
              <span className="detail-value">{family?.name || user.familyName || 'No Family Linked'}</span>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="detail-icon">
              <Calendar size={20} color="#60a5fa" />
            </div>
            <div className="detail-text">
              <span className="detail-label">Account Joined</span>
              <span className="detail-value">{joinDate}</span>
            </div>
          </div>
        </div>

        <button onClick={logout} className="btn btn-danger btn-block logout-profile-btn">
          <LogOut size={18} />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
