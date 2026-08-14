import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFamilyById, addFamilyMember, removeFamilyMember } from '../services/familyService';
import FamilyMemberCard from '../components/FamilyMemberCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { Users, UserPlus, Shield, Smile, Info } from 'lucide-react';
import './FamilyPage.css';

const FamilyPage = () => {
  const { user, activeFamilyId } = useAuth();
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberPassword, setMemberPassword] = useState('password123');
  const [memberRole, setMemberRole] = useState('child');
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState('');

  const loadFamily = async () => {
    if (!activeFamilyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetchFamilyById(activeFamilyId);
      if (res.success) {
        setFamilyData(res.family);
      }
    } catch (err) {
      setError(err.message || 'Failed to load family data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamily();
  }, [activeFamilyId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!memberEmail.trim()) {
      return setFormError('Please enter an email address.');
    }

    try {
      setAdding(true);
      const res = await addFamilyMember(activeFamilyId, {
        email: memberEmail,
        name: memberName,
        password: memberPassword,
        role: memberRole,
      });

      if (res.success) {
        setFamilyData(res.family);
        setIsAddModalOpen(false);
        setMemberEmail('');
        setMemberName('');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to add family member.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (!window.confirm('Are you sure you want to remove this member from your family workspace?')) return;

    try {
      const res = await removeFamilyMember(activeFamilyId, targetUserId);
      if (res.success) {
        setFamilyData(res.family);
      }
    } catch (err) {
      alert(err.message || 'Failed to remove family member');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading family members..." />;
  }

  if (error || !familyData) {
    return <ErrorMessage message={error || 'No family workspace found.'} />;
  }

  const isParent = user?.role === 'parent';
  const parents = familyData.members.filter((m) => m.role === 'parent');
  const children = familyData.members.filter((m) => m.role === 'child');

  return (
    <div className="family-page animate-fade-in">
      <div className="family-header">
        <div>
          <h1 className="family-title">{familyData.name} Workspace</h1>
          <p className="family-subtitle">
            {familyData.members.length} Family Members ({parents.length} Parents, {children.length} Children)
          </p>
        </div>

        {isParent && (
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus size={18} />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Role notice for Children */}
      {!isParent && (
        <div className="child-role-info">
          <Info size={18} color="#60a5fa" />
          <span>
            You are currently logged in as a <strong>Child</strong> member. Parents have management controls to add or remove members.
          </span>
        </div>
      )}

      {/* Members Directory */}
      <div className="members-section">
        <h2 className="members-group-title">
          <Shield size={20} color="#a5b4fc" />
          <span>Parents ({parents.length})</span>
        </h2>
        <div className="members-grid">
          {parents.map((member) => (
            <FamilyMemberCard
              key={member._id}
              member={member}
              currentUser={user}
              onRemove={handleRemoveMember}
            />
          ))}
        </div>

        <h2 className="members-group-title mt-4">
          <Smile size={20} color="#f472b6" />
          <span>Children ({children.length})</span>
        </h2>
        <div className="members-grid">
          {children.length === 0 ? (
            <p className="no-members-text">No child accounts added yet.</p>
          ) : (
            children.map((member) => (
              <FamilyMemberCard
                key={member._id}
                member={member}
                currentUser={user}
                onRemove={handleRemoveMember}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Member to Family"
        >
          <form onSubmit={handleAddMember}>
            {formError && <ErrorMessage message={formError} />}

            <div className="form-group">
              <label className="form-label">Member Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="family.member@example.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Member Name (If creating new account)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Timmy"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="password123"
                value={memberPassword}
                onChange={(e) => setMemberPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Member Role</label>
              <select
                className="form-select"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
              >
                <option value="child">Child Member</option>
                <option value="parent">Parent Member</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={adding}>
                {adding ? 'Adding...' : 'Add Family Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FamilyPage;
