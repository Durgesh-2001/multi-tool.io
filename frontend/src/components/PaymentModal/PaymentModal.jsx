import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('plans'); // 'plans' or 'payment'
  const [selectedPlan, setSelectedPlan] = useState({ name: '', amount: 0 });
  const [showUpi, setShowUpi] = useState(false);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Reset view when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setView('plans');
      setShowUpi(false);
    }
  }, [isOpen]);

  // Add Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Centralized close handler
  const handleClose = () => {
    onClose();
  };

  const handleGetStarted = () => {
    navigate('/');
    handleClose();
  };

  const handlePlanSelect = (planName, amount) => {
    setSelectedPlan({ name: planName, amount });
    setView('payment');
  };

  const handlePayWithCard = () => {
    setShowUpi(false);
    setLoading(true);
    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: selectedPlan.amount * 100,
        currency: 'INR',
        name: 'Multi-Tool.io',
        description: `Purchase - ${selectedPlan.name}`,
        handler: async function (response) {
          // After the demo payment is successful, promote the user on the backend
          const token = localStorage.getItem('token');
          try {
            const promoteResponse = await fetch('/api/payment/promote', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ plan: selectedPlan.name })
            });

            if (!promoteResponse.ok) {
              throw new Error('Promotion failed on the backend.');
            }
            
            const data = await promoteResponse.json(); // Get the new user data
            alert('Payment Successful! You are now a Pro user.');
            onPaymentSuccess(data); // Pass the data to the success handler
            handleClose();

          } catch (err) {
            alert('Payment was successful, but there was an issue upgrading your account. Please refresh.');
            setLoading(false);
          }
        },
        prefill: { name: 'User', email: 'user@gmail.com', contact: '9999999999' },
        theme: { color: '#16a34a' },
        modal: { ondismiss: () => setLoading(false) }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Could not open payment window. Is VITE_RAZORPAY_KEY_ID set?');
      setLoading(false);
    }
  };
  
  const handlePayWithUpi = () => {
      setShowUpi(true);
  }

  const qrValue = `upi://pay?pa=dj26112001@okhdfcbank&pn=Multi-Tool.io&am=${selectedPlan.amount}&cu=INR`;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay-new open" onClick={handleClose}>
      <div className={`modal-content-new ${isDarkMode ? 'dark' : 'light'}`} onClick={e => e.stopPropagation()}>
        
        {view === 'plans' && (
          <div className="plans-view">
            <div className="plan-card-new">
              <h3>Free</h3>
              <p className="price-new">₹0</p>
              <button className="plan-btn-new" onClick={handleGetStarted}>Get started</button>
              <ul className="features-new">
                <li>✓ 3 trials refresh per week</li>
              </ul>
            </div>
            <div className="plan-card-new popular">
              <h3>Pro</h3>
              <p className="price-new">
                ₹899 <span className="slashed-price-animated">₹999</span>
              </p>
              <button className="plan-btn-new" onClick={() => handlePlanSelect('Pro', 899)}>Choose Plan</button>
              <ul className="features-new">
                <li>✓ Unlimited Credits</li>
                <li>✓ Pro Access to All Tools</li>
              </ul>
            </div>
            <div className="plan-card-new">
              <h3>Pro+</h3>
              <p className="price-new">
                ₹1899 <span className="slashed-price-animated">₹1999</span>
              </p>
              <button className="plan-btn-new" onClick={() => handlePlanSelect('Pro+', 1899)}>Choose Plan</button>
              <ul className="features-new">
                <li>✓ Everything in Pro</li>
                <li>✓ Access to Beta Features</li>
              </ul>
            </div>
          </div>
        )}

        {view === 'payment' && (
          <div className="payment-view">
            <button className="back-button-new" onClick={() => setView('plans')}>← Back to Plans</button>
            <h2>Complete Payment for {selectedPlan.name}</h2>
            <p className="payment-amount">Total: ₹{selectedPlan.amount}</p>
            <div className="payment-method-selector">
              <button className="payment-btn-new" onClick={handlePayWithCard} disabled={loading}>Pay with Card</button>
              <button className="payment-btn-new secondary" onClick={handlePayWithUpi} disabled={loading}>Pay with UPI</button>
            </div>
            {showUpi && (
                <div className="qr-payment-new">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrValue)}&size=200x200`} alt="QR Code" className="qr-code-img" />
                </div>
            )}
            {!showUpi && (
                <div className="test-card-info-new">
                    <p>For card payments, use Razorpay's test card: 411111111111 | 12/28 | 123</p>
                </div>
            )}
          </div>
        )}

      </div>
      <button className="close-button-new" onClick={handleClose}>×</button>
    </div>
  );
};

export default PaymentModal;
