import React, { useState } from 'react';
import Modal from '../common/Modal';
import { formatRoleLabel } from '../../utils/formatters';
import { ShieldAlert, ArrowRight, AlertTriangle, UserCheck } from 'lucide-react';

const BulkRoleChangeModal = ({
  isOpen = true,
  onClose,
  selectedUsers = [],
  onConfirm,
}) => {
  const [targetRole, setTargetRole] = useState('store_owner');
  const [submitting, setSubmitting] = useState(false);

  const isEscalation = targetRole === 'admin';

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(targetRole, selectedUsers);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Bulk Role Modification & Privilege Governance"
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="620px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Security Warning Notice */}
        <div
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: isEscalation ? 'var(--danger-bg)' : 'var(--warning-bg)',
            border: `1px solid ${isEscalation ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle
            size={20}
            color={isEscalation ? 'var(--danger)' : 'var(--warning)'}
            style={{ flexShrink: 0, marginTop: '2px' }}
          />
          <div style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
            <strong style={{ color: isEscalation ? 'var(--danger)' : 'var(--warning)' }}>
              {isEscalation ? 'Critical Privilege Escalation Warning' : 'Role Transition Governance'}
            </strong>
            <p style={{ marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
              You are about to modify access permissions for <strong>{selectedUsers.length}</strong> user
              {selectedUsers.length === 1 ? '' : 's'}. Review the affected accounts and their role transitions below.
            </p>
          </div>
        </div>

        {/* Target Role Selector */}
        <div className="form-group" style={{ marginBottom: '0.5rem' }}>
          <label className="form-label">Select Target Role to Apply:</label>
          <select
            className="form-select"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          >
            <option value="normal_user">Normal User (Customer / Reviewer)</option>
            <option value="store_owner">Store Owner (Merchant)</option>
            <option value="admin">Administrator (Full Platform Control)</option>
          </select>
        </div>

        {/* Explicit Affected Users Matrix */}
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            AFFECTED USERS & ROLE TRANSITIONS ({selectedUsers.length}):
          </div>

          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            {selectedUsers.map((u) => (
              <div
                key={u.id}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {u.email}
                  </div>
                </div>

                {/* From Role -> To Role */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span className={`badge badge-${u.role}`} style={{ fontSize: '0.7rem' }}>
                    {formatRoleLabel(u.role)}
                  </span>
                  <ArrowRight size={13} color="var(--text-muted)" />
                  <span className={`badge badge-${targetRole}`} style={{ fontSize: '0.7rem' }}>
                    {formatRoleLabel(targetRole)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ margin: '1rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${isEscalation ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleConfirm}
            disabled={submitting}
          >
            <UserCheck size={16} />
            <span>
              {submitting ? 'Applying Changes...' : `Confirm & Apply Role to ${selectedUsers.length} Users`}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkRoleChangeModal;
