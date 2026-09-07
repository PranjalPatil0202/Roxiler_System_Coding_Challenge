import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatRoleLabel } from '../../utils/formatters';
import { LogOut } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = () => {
    logout();
    onClose();
    showSuccess('You have been safely signed out.');
    navigate('/login');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Out"
      maxWidth="380px"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0.5rem 0.25rem 0.25rem',
        }}
      >
        {/* Soft Red Icon Badge */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'var(--danger-bg)',
            border: '1.5px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: 'var(--danger)',
          }}
        >
          <LogOut size={24} strokeWidth={2.2} />
        </div>

        {/* Heading */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.35rem',
            lineHeight: 1.3,
          }}
        >
          Are you sure you want to log out?
        </h3>

        {/* Short Subtitle */}
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            lineHeight: 1.45,
            marginBottom: '1.25rem',
          }}
        >
          You will need to sign in again to access your account.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ flex: 1, padding: '0.625rem 1rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '0.625rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LogoutConfirmModal;
