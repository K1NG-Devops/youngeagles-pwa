import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Native Dialog Component
 * Uses the HTML5 <dialog> element for device-native styling
 */
const NativeDialog = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions = [], 
  showCloseButton = true,
  modal = true,
  size = 'medium'
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (modal) {
        dialog.showModal();
      } else {
        dialog.show();
      }
    } else {
      dialog.close();
    }

    // Handle escape key and backdrop click
    const handleClose = (e) => {
      if (e.type === 'close' || (e.type === 'click' && e.target === dialog)) {
        onClose();
      }
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleClose);

    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleClose);
    };
  }, [isOpen, modal, onClose]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: '300px', height: 'auto' };
      case 'large':
        return { width: '80vw', height: '80vh', maxWidth: '1200px' };
      case 'full':
        return { width: '100vw', height: '100vh' };
      default: // medium
        return { width: '500px', height: 'auto', maxWidth: '90vw' };
    }
  };

  return (
    <dialog 
      ref={dialogRef}
      style={{
        ...getSizeStyles(),
        padding: '0',
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      {(title || showCloseButton) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          {title && (
            <h2 style={{
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827'
            }}>
              {title}
            </h2>
          )}
          {showCloseButton && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0.25rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close dialog"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{
        padding: '1.5rem',
        overflow: 'auto',
        maxHeight: size === 'full' ? 'calc(100vh - 120px)' : '70vh'
      }}>
        {children}
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'flex-end',
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: action.variant === 'primary' ? 'none' : '1px solid #d1d5db',
                backgroundColor: action.variant === 'primary' ? '#3b82f6' : '#ffffff',
                color: action.variant === 'primary' ? '#ffffff' : '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
                ...action.style
              }}
              onMouseOver={(e) => {
                if (action.variant === 'primary') {
                  e.target.style.backgroundColor = '#2563eb';
                } else {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseOut={(e) => {
                if (action.variant === 'primary') {
                  e.target.style.backgroundColor = '#3b82f6';
                } else {
                  e.target.style.backgroundColor = '#ffffff';
                }
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </dialog>
  );
};

NativeDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary']),
    style: PropTypes.object
  })),
  showCloseButton: PropTypes.bool,
  modal: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'full'])
};

export default NativeDialog; 