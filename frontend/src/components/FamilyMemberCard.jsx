import React from 'react';
import { UserX, Shield, Smile } from 'lucide-react';
import './FamilyMemberCard.css';

const FamilyMemberCard = ({ member, currentUser, onRemove }) => {
  const isParent = currentUser?.role === 'parent';
  const isSelf = member._id === currentUser?._id;
  const canRemove = isParent && !isSelf;

  const joinDate = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
      })
    : 'Member';

  return (
    <div className="family-member-card animate-fade-in">
      <div className="member-avatar-wrap">
        <img
          src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
          alt={member.name}
          className="member-avatar"
        />
        <span className="role-icon-badge">
          {member.role === 'parent' ? <Shield size={12} /> : <Smile size={12} />}
        </span>
      </div>

      <div className="member-details">
        <h4 className="member-name">
          {member.name} {isSelf && <span className="self-tag">(You)</span>}
        </h4>
        <span className="member-email">{member.email}</span>
        <div className="member-meta">
          <span className={`badge badge-role-${member.role}`}>{member.role}</span>
          <span className="join-date">Joined {joinDate}</span>
        </div>
      </div>

      {canRemove && (
        <button
          onClick={() => onRemove(member._id)}
          className="btn btn-danger btn-sm remove-member-btn"
          title="Remove from family"
        >
          <UserX size={16} />
          <span>Remove</span>
        </button>
      )}
    </div>
  );
};

export default FamilyMemberCard;
