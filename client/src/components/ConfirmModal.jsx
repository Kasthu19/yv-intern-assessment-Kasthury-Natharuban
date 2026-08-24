import React from 'react';

const ConfirmModal = ({ isOpen, title, children, onConfirm, onCancel, confirmText = 'Confirm', confirmVariant = 'primary', loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{title}</h3>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            &times;
          </button>
        </div>

        <div className="modal-body">{children}</div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className={`btn btn-${confirmVariant} btn-sm`} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
