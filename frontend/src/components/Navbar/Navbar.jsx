import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { assets } from '../../assets/assets';
import PaymentModal from '../PaymentModal/PaymentModal';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Move fetchUserStatus here so it's accessible everywhere in Navbar
  const fetchUserStatus = async (token) => {
    try {
      const response = await fetch('/api/payment/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        setIsProUser(data.isPro);
        setSubscriptionEnd(data.subscriptionEnd);
      }
    } catch (error) {
      console.error('Failed to fetch user status', error);
    }
  };

  useEffect(() => {
    const checkUserAuth = () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');
      
      if (token && userInfo) {
        setUser(JSON.parse(userInfo));
        fetchUserStatus(token);
      } else {
        setUser(null);
        setCredits(0);
        setIsProUser(false);
      }
      setLoading(false);
    };

    checkUserAuth();

    const handleAuthChange = () => checkUserAuth();
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const handleWalletClick = () => {
    if (isProUser) {
      // If user is Pro, show an alert with expiry date
      const expiryDate = new Date(subscriptionEnd).toLocaleDateString();
      alert(`Your Pro subscription is active until ${expiryDate}. Keep tooling!`);
    } else {
      // Otherwise, open the payment modal
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = (data) => {
    // Immediately update the state with data from the payment success call
    if (data) {
      setIsProUser(data.isPro);
      setCredits(data.credits);
      setSubscriptionEnd(data.subscriptionEnd);
    } else {
      // Fallback to fetching status if no data is provided
      const token = localStorage.getItem('token');
      if (token) {
        fetchUserStatus(token);
      }
    }
  };

  if (loading) {
    return (
      <nav className="navbar">
        <div className="navbar-logo" onClick={scrollToTop}>
          <img 
            src={isDarkMode ? assets.logo_dark : assets.logo} 
            alt="Logo" 
            className="navbar-logo-img"
          />
          <div className="navbar-logo-text">
            <span className="logo-text">mulitool.io</span>
          </div>
        </div>
        <ul className="navbar-links">
          <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
          <li><Link to="/tools">Tools</Link></li>
          <li><ThemeToggle /></li>
        </ul>
      </nav>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo" onClick={scrollToTop}>
          <img 
            src={isDarkMode ? assets.logo_dark : assets.logo} 
            alt="Logo" 
            className="navbar-logo-img"
          />
          <div className="navbar-logo-text">
            <span className="logo-text">mulitool.io</span>
          </div>
        </div>
        <ul className="navbar-links">
          <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
          <li><Link to="/tools">Tools</Link></li>
          <li><ThemeToggle /></li>
          {user ? (
            <>
              <li className="wallet-balance" onClick={handleWalletClick}>
                <img src={assets.wallet} alt="Wallet" className="wallet-icon" />
                {isProUser ? (
                  <div className="pro-label">
                    <span>PRO</span>
                    <span className="infinity">∞</span>
                  </div>
                ) : (
                  <span>{credits} Points</span>
                )}
              </li>
              <li className="user-greeting">
                <span>Hi, {user.name}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
            </>
          )}
        </ul>
      </nav>
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default Navbar; 