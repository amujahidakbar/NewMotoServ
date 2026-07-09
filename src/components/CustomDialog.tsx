'use client';

import React from 'react';

interface CustomDialogProps {
  isOpen: boolean;
  type: 'alert' | 'confirm';
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function CustomDialog({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  isDanger = false
}: CustomDialogProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop open" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(7, 10, 19, 0.85)', 
        zIndex: 2000,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className="modal-dialog" 
        style={{ 
          maxWidth: '420px', 
          width: '90%', 
          margin: '0 auto', 
          background: 'var(--bg-surface-solid)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
      >
        <div 
          className="modal-header" 
          style={{ 
            padding: '1.25rem 1.5rem', 
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h3>
          <button 
            type="button"
            className="btn-close-modal"
            onClick={onCancel}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0
            }}
          >
            &times;
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem', fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {message}
        </div>
        
        <div 
          className="modal-footer" 
          style={{ 
            padding: '1rem 1.5rem', 
            borderTop: '1px solid var(--border-color)', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.01)'
          }}
        >
          {type === 'confirm' && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={onCancel}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {cancelText}
            </button>
          )}
          <button 
            type="button" 
            className={`btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`} 
            onClick={onConfirm}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', fontWeight: 600 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
