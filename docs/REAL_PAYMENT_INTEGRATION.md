# 💳 Real Payment System Integration Guide

## Overview

This guide explains how to integrate real payment processors with your Young Eagles PWA. We'll cover multiple South African and international payment providers.

## 🌍 Recommended Payment Providers for South Africa

### 1. **PayFast** (Recommended for SA)
- **Best for**: South African businesses
- **Supports**: All major SA banks, cards, EFT, instant EFT
- **Fees**: 2.9% + R2.00 per transaction
- **Setup time**: 1-2 days

### 2. **Yoco** 
- **Best for**: Small to medium businesses
- **Supports**: Card payments, QR codes
- **Fees**: 2.95% per transaction
- **Setup time**: Same day

### 3. **Peach Payments**
- **Best for**: Enterprise solutions
- **Supports**: Global coverage, multiple currencies
- **Fees**: Custom pricing
- **Setup time**: 1-2 weeks

### 4. **Stripe** (International)
- **Best for**: Global businesses
- **Supports**: 135+ currencies, many payment methods
- **Fees**: 2.9% + 30¢ per transaction
- **Setup time**: Minutes to hours

## 🚀 Implementation Options

### Option 1: PayFast Integration (Recommended)

#### Step 1: Install PayFast SDK
```bash
npm install payfast-sdk
```

#### Step 2: Create PayFast Service
```javascript
// src/services/payfastService.js
import PayFast from 'payfast-sdk';

class PayFastService {
  constructor() {
    this.payfast = new PayFast({
      merchantId: process.env.REACT_APP_PAYFAST_MERCHANT_ID,
      merchantKey: process.env.REACT_APP_PAYFAST_MERCHANT_KEY,
      passphrase: process.env.REACT_APP_PAYFAST_PASSPHRASE,
      sandbox: process.env.NODE_ENV !== 'production'
    });
  }

  async createPayment(subscriptionData) {
    const paymentData = {
      merchant_id: this.payfast.merchantId,
      merchant_key: this.payfast.merchantKey,
      return_url: `${window.location.origin}/payment/success`,
      cancel_url: `${window.location.origin}/payment/cancel`,
      notify_url: `${process.env.REACT_APP_API_URL}/api/payments/payfast/webhook`,
      
      // Subscription details
      name_first: subscriptionData.user.firstName,
      name_last: subscriptionData.user.lastName,
      email_address: subscriptionData.user.email,
      
      // Plan details
      item_name: `${subscriptionData.plan.name} Plan`,
      item_description: subscriptionData.plan.description,
      amount: subscriptionData.plan.price,
      
      // Subscription specific
      subscription_type: 1, // Recurring
      billing_date: new Date().toISOString().split('T')[0],
      recurring_amount: subscriptionData.plan.price,
      frequency: 3, // Monthly
      cycles: 0, // Until cancelled
      
      // Custom fields
      custom_str1: subscriptionData.userId,
      custom_str2: subscriptionData.plan.id,
      custom_str3: JSON.stringify(subscriptionData.metadata)
    };

    const signature = this.payfast.generateSignature(paymentData);
    paymentData.signature = signature;

    return paymentData;
  }

  validatePayment(postData) {
    return this.payfast.validate(postData);
  }
}

export default new PayFastService();
```

#### Step 3: Update Checkout Component
```javascript
// src/pages/Checkout.jsx
import payfastService from '../services/payfastService';

const handlePayFastPayment = async (formData) => {
  try {
    const subscriptionData = {
      userId: user.id,
      user: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      },
      plan: selectedPlan,
      metadata: {
        source: 'web_app',
        timestamp: new Date().toISOString()
      }
    };

    const paymentData = await payfastService.createPayment(subscriptionData);
    
    // Create and submit PayFast form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = process.env.NODE_ENV === 'production' 
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    Object.keys(paymentData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error('PayFast payment error:', error);
    toast.error('Payment initialization failed');
  }
};
```

#### Step 4: Backend Webhook Handler
```javascript
// Backend: /api/payments/payfast/webhook
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

router.post('/payfast/webhook', async (req, res) => {
  try {
    const postData = req.body;
    
    // Validate PayFast payment
    const isValid = validatePayFastPayment(postData);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment' });
    }

    const { custom_str1: userId, custom_str2: planId, payment_status } = postData;

    if (payment_status === 'COMPLETE') {
      // Update user subscription
      await updateUserSubscription(userId, planId, {
        status: 'active',
        paymentMethod: 'payfast',
        transactionId: postData.pf_payment_id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      // Send confirmation email
      await sendSubscriptionConfirmation(userId, planId);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('PayFast webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

function validatePayFastPayment(postData) {
  const pfParamString = Object.keys(postData)
    .filter(key => key !== 'signature')
    .sort()
    .map(key => `${key}=${encodeURIComponent(postData[key]).replace(/%20/g, '+')}`)
    .join('&');

  const pfParamStringWithPassphrase = pfParamString + '&passphrase=' + process.env.PAYFAST_PASSPHRASE;
  const signature = crypto.createHash('md5').update(pfParamStringWithPassphrase).digest('hex');
  
  return signature === postData.signature;
}
```

### Option 2: Stripe Integration

#### Step 1: Install Stripe
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### Step 2: Setup Stripe Provider
```javascript
// src/App.js
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      {/* Your app components */}
    </Elements>
  );
}
```

#### Step 3: Create Stripe Checkout
```javascript
// src/components/StripeCheckout.jsx
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const StripeCheckout = ({ selectedPlan, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      // Create subscription on backend
      const response = await fetch('/api/payments/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethodId: 'card' // Will be replaced with actual payment method
        })
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Customer Name'
          }
        }
      });

      if (error) {
        onError(error.message);
      } else {
        onSuccess(paymentIntent);
      }
    } catch (error) {
      onError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : `Pay R${selectedPlan.price}`}
      </button>
    </form>
  );
};
```

### Option 3: Yoco Integration

#### Step 1: Include Yoco Script
```html
<!-- Add to public/index.html -->
<script src="https://js.yoco.com/sdk/v1/yoco-sdk-web.js"></script>
```

#### Step 2: Create Yoco Service
```javascript
// src/services/yocoService.js
class YocoService {
  constructor() {
    this.yoco = new window.YocoSDK({
      publicKey: process.env.REACT_APP_YOCO_PUBLIC_KEY
    });
  }

  async processPayment(amount, planData) {
    try {
      const result = await this.yoco.showPopup({
        amountInCents: amount * 100, // Convert to cents
        currency: 'ZAR',
        name: 'Young Eagles Subscription',
        description: `${planData.name} Plan - Monthly Subscription`,
        callback: async (result) => {
          if (result.error) {
            throw new Error(result.error.message);
          }
          
          // Send token to backend for processing
          const response = await fetch('/api/payments/yoco/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: result.id,
              amountInCents: amount * 100,
              planId: planData.id
            })
          });

          return response.json();
        }
      });

      return result;
    } catch (error) {
      throw new Error(`Yoco payment failed: ${error.message}`);
    }
  }
}

export default new YocoService();
```

## 🔧 Environment Variables Setup

Create a `.env` file with your payment provider credentials:

```bash
# PayFast
REACT_APP_PAYFAST_MERCHANT_ID=your_merchant_id
REACT_APP_PAYFAST_MERCHANT_KEY=your_merchant_key
REACT_APP_PAYFAST_PASSPHRASE=your_passphrase

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Yoco
REACT_APP_YOCO_PUBLIC_KEY=pk_test_...

# API Base URL
REACT_APP_API_URL=http://localhost:3001
```

## 📱 Mobile Money Integration (African Markets)

### MTN Mobile Money Integration
```javascript
// src/services/mtnMoMoService.js
class MTNMoMoService {
  async createPayment(phoneNumber, amount, planId) {
    try {
      const response = await fetch('/api/payments/mtn-momo/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          amount,
          planId,
          currency: 'ZAR',
          externalId: `subscription_${Date.now()}`
        })
      });

      const result = await response.json();
      
      // Poll for payment status
      return this.pollPaymentStatus(result.referenceId);
    } catch (error) {
      throw new Error(`MTN MoMo payment failed: ${error.message}`);
    }
  }

  async pollPaymentStatus(referenceId) {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payments/mtn-momo/status/${referenceId}`);
          const status = await response.json();

          if (status.status === 'SUCCESSFUL') {
            clearInterval(pollInterval);
            resolve(status);
          } else if (status.status === 'FAILED') {
            clearInterval(pollInterval);
            reject(new Error('Payment failed'));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 3000); // Poll every 3 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Payment timeout'));
      }, 300000);
    });
  }
}
```

## 🔒 Security Best Practices

### 1. Never Store Sensitive Data
```javascript
// ❌ DON'T DO THIS
const creditCard = {
  number: '4111111111111111',
  cvv: '123',
  expiry: '12/25'
};

// ✅ DO THIS - Use tokens
const paymentToken = 'tok_1234567890abcdef';
```

### 2. Validate on Server
```javascript
// Backend validation
const validateSubscriptionUpgrade = async (userId, planId, paymentData) => {
  // Verify user exists
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Verify plan exists
  const plan = await Plan.findById(planId);
  if (!plan) throw new Error('Plan not found');

  // Verify payment amount matches plan price
  if (paymentData.amount !== plan.price) {
    throw new Error('Payment amount mismatch');
  }

  return true;
};
```

### 3. Use HTTPS Everywhere
```javascript
// Ensure all payment endpoints use HTTPS
if (process.env.NODE_ENV === 'production' && !window.location.protocol.includes('https')) {
  window.location.replace(window.location.href.replace('http:', 'https:'));
}
```

## 🧪 Testing Payment Integration

### 1. PayFast Test Cards
```javascript
const testCards = {
  visa: '4000000000000002',
  mastercard: '5200000000000015',
  amex: '340000000000009'
};
```

### 2. Stripe Test Cards
```javascript
const stripeTestCards = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  declined: '4000000000000002'
};
```

### 3. Test Webhooks Locally
```bash
# Install ngrok for webhook testing
npm install -g ngrok

# Expose local server
ngrok http 3001

# Use the ngrok URL for webhook endpoints
# https://abc123.ngrok.io/api/payments/payfast/webhook
```

## 📊 Payment Analytics & Monitoring

### Track Payment Events
```javascript
// src/services/analyticsService.js
class AnalyticsService {
  trackPaymentStarted(planId, method) {
    // Google Analytics
    gtag('event', 'payment_started', {
      plan_id: planId,
      payment_method: method,
      value: this.getPlanPrice(planId)
    });

    // Mixpanel
    mixpanel.track('Payment Started', {
      plan_id: planId,
      payment_method: method
    });
  }

  trackPaymentCompleted(planId, method, transactionId) {
    gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: this.getPlanPrice(planId),
      currency: 'ZAR'
    });

    mixpanel.track('Payment Completed', {
      plan_id: planId,
      payment_method: method,
      transaction_id: transactionId
    });
  }

  trackPaymentFailed(planId, method, error) {
    gtag('event', 'payment_failed', {
      plan_id: planId,
      payment_method: method,
      error_message: error
    });
  }
}
```

## 🚀 Deployment Checklist

### Production Setup
- [ ] SSL certificate installed
- [ ] Payment provider accounts verified
- [ ] Webhook URLs configured
- [ ] Environment variables set
- [ ] Payment flow tested end-to-end
- [ ] Error handling implemented
- [ ] Analytics tracking enabled
- [ ] Customer support integration ready

### Compliance
- [ ] PCI DSS compliance reviewed
- [ ] POPIA compliance for South Africa
- [ ] Terms of service updated
- [ ] Privacy policy updated
- [ ] Refund policy defined

## 💡 Pro Tips

1. **Start with Sandbox**: Always test in sandbox/test mode first
2. **Handle Failures Gracefully**: Implement retry logic and clear error messages
3. **Monitor Performance**: Track payment success rates and failure reasons
4. **Support Multiple Methods**: Offer various payment options for better conversion
5. **Cache Nothing Sensitive**: Never cache payment data locally
6. **Log Everything**: Comprehensive logging helps with debugging and compliance

## 📞 Support & Documentation

### PayFast
- Docs: https://developers.payfast.co.za/
- Support: support@payfast.co.za

### Stripe
- Docs: https://stripe.com/docs
- Support: Live chat in dashboard

### Yoco
- Docs: https://developer.yoco.com/
- Support: developers@yoco.com

---

This integration guide provides everything you need to connect real payment processing to your Young Eagles PWA. Choose the provider that best fits your needs and market.
