import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// WARNING: RAZORPAY_KEY_SECRET is required by the Razorpay SDK to create orders.
// The 'createRazorpayOrder' function will fail without it.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const getUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      credits: user.credits,
      isPro: user.isProUser,
      plan: user.subscriptionPlan,
      subscriptionEnd: user.subscriptionEndDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const handleSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set subscription end date
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + (plan === 'yearly' ? 12 : 1));

    // Update user subscription
    user.isProUser = true;
    user.subscriptionPlan = plan;
    user.subscriptionStartDate = now;
    user.subscriptionEndDate = endDate;
    user.credits = 999999; // Unlimited credits for pro users
    await user.save();

    res.json({
      message: 'Subscription activated successfully',
      plan: user.subscriptionPlan,
      subscriptionEnd: user.subscriptionEndDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mock payment for testing
export const handleMockPayment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.credits += 100;
    await user.save();

    res.json({
      message: 'Payment successful',
      credits: user.credits
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', plan } = req.body;
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt: `receipt_order_${new Date().getTime()}`,
      notes: {
        plan,
        userId: req.user.id
      }
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ message: 'Error creating Razorpay order' });
    
    res.json(order);
  } catch (error) {
    // Log the detailed error on the backend
    console.error('RAZORPAY ORDER CREATION ERROR:', error); 
    // Send a JSON response to the frontend
    res.status(500).json({ message: 'Failed to create Razorpay order.', error: error.message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
  const userId = req.user.id;
  
  // Restore secure signature verification
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');

  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: 'Transaction not legit!' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + (plan === 'yearly' ? 12 : 1));

    user.isProUser = true;
    user.subscriptionPlan = plan;
    user.subscriptionStartDate = now;
    user.subscriptionEndDate = endDate;
    user.credits = 999999;
    await user.save();

    res.json({
      message: 'Payment successful, subscription activated',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

// Promote user to Pro for demo purposes
export const promoteUserToPro = async (req, res) => {
  const { plan } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate a one-year subscription end date for the demo
    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);

    user.isProUser = true;
    user.credits = 999999; // Give unlimited credits
    user.subscriptionPlan = plan || 'Pro';
    user.subscriptionStartDate = now;
    user.subscriptionEndDate = endDate;
    await user.save();

    res.json({
      message: 'User promoted to Pro successfully',
      isPro: user.isProUser,
      credits: user.credits,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionEnd: user.subscriptionEndDate
    });
  } catch (error) {
    console.error('PROMOTE USER TO PRO ERROR:', error); // Log the error and stack trace
    res.status(500).json({ message: 'Server error during promotion', error: error.message, stack: error.stack });
  }
}; 