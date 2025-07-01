import React from 'react';
import { Link } from 'react-router-dom';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={e => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>×</button>
        <h3>Login Required</h3>
        <p>Please log in or create an account to use this feature.</p>
        <div className="login-modal-actions">
          <Link to="/login" className="login-modal-btn" onClick={onClose}>Login</Link>
          <Link to="/register" className="login-modal-btn secondary" onClick={onClose}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
