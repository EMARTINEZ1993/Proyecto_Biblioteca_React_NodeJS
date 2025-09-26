// src/components/Common/MessageAlert.jsx
import React from 'react';
import './MessageAlert.css';

const MessageAlert = ({ type, message, onClose }) => {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '';
    }
  };

  return (
<div className={`alert ${type}`}>
  <span>{getIcon()}</span>
  <div className="message">
    {typeof message === 'string' ? (
      message.split('\n').map((line, index) => (
        <div key={index}>{line}</div>
      ))
    ) : (
      message
    )}
  </div>
  {onClose && (
    <button 
      onClick={onClose}
      aria-label="Cerrar mensaje"
    >
      ×
    </button>
  )}
</div>
  );
};

export default MessageAlert;