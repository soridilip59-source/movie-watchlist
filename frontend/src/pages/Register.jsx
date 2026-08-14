import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, UserPlus, Key, Mail, User, Shield, Smile } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import './AuthPages.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) return setError('Please fill in all required fields.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    try {
      setLoading(true);
      const res = await register({ name, email, password, role });
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container animate-fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <Film size={28} color="#e50914" />
            <span>Cine<span className="logo-highlight">Family</span></span>
          </div>
          <h2>Create Account</h2>
          <p>Join CineFamily to start your family movie watchlist</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="e.g. John Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Key size={18} className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role Picker */}
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div className="role-selector-grid">
              <button
                type="button"
                className={`role-option ${role === 'parent' ? 'selected' : ''}`}
                onClick={() => setRole('parent')}
              >
                <Shield size={20} className="role-icon" />
                <div className="role-text">
                  <span className="role-title">Parent</span>
                  <span className="role-desc">Full access & family controls</span>
                </div>
              </button>

              <button
                type="button"
                className={`role-option ${role === 'child' ? 'selected' : ''}`}
                onClick={() => setRole('child')}
              >
                <Smile size={20} className="role-icon" />
                <div className="role-text">
                  <span className="role-title">Child</span>
                  <span className="role-desc">Watchlist, ratings & reviews</span>
                </div>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
