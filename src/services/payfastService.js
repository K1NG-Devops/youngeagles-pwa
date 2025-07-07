import CryptoJS from 'crypto-js';

// Helper function to safely get environment variables
const getEnvVar = (key, defaultValue = '') => {
  try {
    // Try Vite's import.meta.env first
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    // Fallback for other bundlers or Node.js
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    // Final fallback
    return defaultValue;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
};

class PayFastService {
  constructor() {
    // PayFast Sandbox credentials (these are public test credentials)
    this.config = {
      merchantId: getEnvVar('REACT_APP_PAYFAST_MERCHANT_ID', '10000100'),
      merchantKey: getEnvVar('REACT_APP_PAYFAST_MERCHANT_KEY', '46f0cd694581a'),
      passphrase: getEnvVar('REACT_APP_PAYFAST_PASSPHRASE', 'jt7NOE43FZPn'),
      sandbox: getEnvVar('NODE_ENV') !== 'production',
      apiUrl: getEnvVar('NODE_ENV') === 'production' 
        ? 'https://www.payfast.co.za/eng/process'
        : 'https://sandbox.payfast.co.za/eng/process'
    };
  }

  generateSignature(data, passphrase = '') {
    // Create parameter string
    let pfOutput = '';
    
    // Sort the data by key
    const sortedData = Object.keys(data)
      .filter(key => key !== 'signature' && data[key] !== '' && data[key] !== null && data[key] !== undefined)
      .sort()
      .reduce((result, key) => {
        result[key] = data[key];
        return result;
      }, {});

    // Create the parameter string
    for (const key in sortedData) {
      if (sortedData.hasOwnProperty(key)) {
        pfOutput += `${key}=${encodeURIComponent(sortedData[key]).replace(/%20/g, '+')}&`;
      }
    }

    // Remove the last '&'
    pfOutput = pfOutput.slice(0, -1);

    // Add passphrase if provided
    if (passphrase) {
      pfOutput += `&passphrase=${encodeURIComponent(passphrase)}`;
    }

    // Generate MD5 hash
    return CryptoJS.MD5(pfOutput).toString();
  }

  createPaymentData(subscriptionData) {
    const {
      userId,
      user,
      plan,
      metadata = {}
    } = subscriptionData;

    const paymentData = {
      // Merchant details
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      
      // URLs
      return_url: `${window.location.origin}/payment/success`,
      cancel_url: `${window.location.origin}/payment/cancel`,
      notify_url: `${getEnvVar('REACT_APP_API_URL', 'http://localhost:3001')}/api/payments/payfast/webhook`,
      
      // Buyer details
      name_first: user.firstName || user.first_name || 'Test',
      name_last: user.lastName || user.last_name || 'User',
      email_address: user.email,
      
      // Transaction details
      m_payment_id: `subscription_${userId}_${Date.now()}`, // Unique payment ID
      amount: plan.price.toFixed(2),
      item_name: `${plan.name} Plan - Monthly Subscription`,
      item_description: plan.description || `${plan.name} subscription for Young Eagles PWA`,
      
      // Custom fields for tracking
      custom_str1: userId.toString(),
      custom_str2: plan.id,
      custom_str3: JSON.stringify({
        source: 'young_eagles_pwa',
        timestamp: new Date().toISOString(),
        ...metadata
      }),
      custom_str4: plan.name,
      custom_str5: plan.price.toString()
      
      // For recurring payments (optional - can be added later)
      // subscription_type: 1,
      // billing_date: new Date().toISOString().split('T')[0],
      // recurring_amount: plan.price.toFixed(2),
      // frequency: 3, // Monthly
      // cycles: 0 // Until cancelled
    };

    // Generate signature
    const signature = this.generateSignature(paymentData, this.config.passphrase);
    paymentData.signature = signature;

    return paymentData;
  }

  async processPayment(subscriptionData) {
    try {
      const paymentData = this.createPaymentData(subscriptionData);
      
      console.log('PayFast Payment Data:', {
        ...paymentData,
        signature: paymentData.signature.substring(0, 10) + '...' // Don't log full signature
      });

      // Create and submit form to PayFast
      return this.submitPaymentForm(paymentData);
      
    } catch (error) {
      console.error('PayFast payment error:', error);
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  }

  submitPaymentForm(paymentData) {
    return new Promise((resolve, reject) => {
      try {
        // Create form element
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = this.config.apiUrl;
        form.style.display = 'none';

        // Add all payment data as hidden inputs
        Object.keys(paymentData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = paymentData[key];
          form.appendChild(input);
        });

        // Add form to document and submit
        document.body.appendChild(form);
        
        // Log form submission for debugging
        console.log('Submitting PayFast form to:', form.action);
        console.log('Form data count:', Object.keys(paymentData).length);
        
        form.submit();
        
        // Clean up
        setTimeout(() => {
          if (document.body.contains(form)) {
            document.body.removeChild(form);
          }
        }, 1000);

        resolve({ success: true, message: 'Redirecting to PayFast...' });
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Utility method to validate webhook data (for backend use)
  validateWebhookSignature(postData, passphrase) {
    const receivedSignature = postData.signature;
    const calculatedSignature = this.generateSignature(postData, passphrase);
    
    return receivedSignature === calculatedSignature;
  }

  // Test connection to PayFast (ping their servers)
  async testConnection() {
    try {
      // This is just a basic connectivity test
      const response = await fetch(this.config.apiUrl.replace('/eng/process', ''), {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      return { success: true, message: 'PayFast servers are reachable' };
    } catch (error) {
      return { success: false, message: 'Cannot reach PayFast servers', error };
    }
  }

  // Get current configuration for debugging
  getConfig() {
    return {
      ...this.config,
      merchantKey: this.config.merchantKey.substring(0, 5) + '...', // Don't expose full key
      passphrase: this.config.passphrase ? '***' : 'Not set'
    };
  }
}

export default new PayFastService();
