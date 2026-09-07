import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ title, isOpen = true, onClose, children, maxWidth = '560px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        className="modal-content"
        style={{ maxWidth, margin: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm modal-close-btn"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
