import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry = null }) => {
  return (
    <div className="error-banner animate-fade-in">
      <AlertCircle size={20} className="error-icon" />
      <span className="error-text">{message || 'Something went wrong.'}</span>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm retry-btn">
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
