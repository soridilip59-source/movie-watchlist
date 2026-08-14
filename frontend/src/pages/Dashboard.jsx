import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFamilyDashboard, createFamily } from '../services/familyService';
import DashboardStats from '../components/DashboardStats';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { LayoutDashboard, Users, Plus, Sparkles } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, activeFamilyId, family, setFamily } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [creating, setCreating] = useState(false);

  const loadDashboard = async () => {
    if (!activeFamilyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetchFamilyDashboard(activeFamilyId);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load family dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [activeFamilyId]);

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    try {
      setCreating(true);
      const res = await createFamily({ name: newFamilyName });
      if (res.success) {
        setFamily(res.family);
      }
    } catch (err) {
      alert(err.message || 'Failed to create family');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading family dashboard statistics..." />;
  }

  // Prompt to create family if user has none
  if (!activeFamilyId) {
    return (
      <div className="no-family-container animate-fade-in">
        <div className="no-family-card">
          <Users size={48} className="no-family-icon" />
          <h2>Welcome to CineFamily, {user?.name}!</h2>
          <p>You haven't joined or created a family workspace yet. Create one now to share watchlists with your family members.</p>

          <form onSubmit={handleCreateFamily} className="create-family-form">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. The Miller Family"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={creating}>
              <Plus size={18} />
              <span>{creating ? 'Creating...' : 'Create Family Workspace'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <div className="dash-badge">
            <Sparkles size={14} />
            <span>Family Workspace</span>
          </div>
          <h1 className="dashboard-title">{family?.name || 'My Family'} Dashboard</h1>
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={loadDashboard} />
      ) : (
        <DashboardStats stats={stats} />
      )}
    </div>
  );
};

export default Dashboard;
