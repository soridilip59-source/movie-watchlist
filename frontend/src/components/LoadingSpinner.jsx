import React from 'react';
import { Film } from 'lucide-react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner-reel">
        <Film size={36} color="#e50914" />
      </div>
      <span className="spinner-text">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
