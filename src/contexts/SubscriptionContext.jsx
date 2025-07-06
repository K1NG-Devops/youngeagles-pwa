import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Plan definitions
  const plans = {
    basic: {
      id: 'basic',
      name: 'Basic',
      price: 99,
      currency: 'ZAR',
      period: 'month',
      features: {
        maxChildren: 2,
        maxFileSize: 10, // MB
        storage: 50, // MB
        support: 'email-48h',
        analytics: 'basic',
        messaging: false,
        prioritySupport: false,
        customReports: false,
        apiAccess: false
      },
      description: 'Perfect for small families just getting started'
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 199,
      currency: 'ZAR',
      period: 'month',
      features: {
        maxChildren: 5,
        maxFileSize: 50, // MB
        storage: 200, // MB
        support: 'email-24h',
        analytics: 'advanced',
        messaging: true,
        prioritySupport: true,
        customReports: false,
        apiAccess: false
      },
      description: 'Most popular choice for growing families',
      popular: true
    },
    family: {
      id: 'family',
      name: 'Family',
      price: 299,
      currency: 'ZAR',
      period: 'month',
      features: {
        maxChildren: -1, // unlimited
        maxFileSize: 100, // MB
        storage: 1000, // MB
        support: 'phone-24h',
        analytics: 'enterprise',
        messaging: true,
        prioritySupport: true,
        customReports: true,
        apiAccess: true
      },
      description: 'Complete solution for large families and educators'
    }
  };

  // Load subscription data
  useEffect(() => {
    loadSubscription();
  }, [user]);

  const loadSubscription = () => {
    setLoading(true);
    try {
      // In production, this would be an API call
      const savedSub = localStorage.getItem(`subscription_${user?.id}`);
      if (savedSub) {
        setSubscription(JSON.parse(savedSub));
      } else {
        // Default to basic plan for new users
        const defaultSub = {
          planId: 'basic',
          status: 'trial',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
          usage: {
            children: 0,
            storage: 0
          }
        };
        setSubscription(defaultSub);
        localStorage.setItem(`subscription_${user?.id}`, JSON.stringify(defaultSub));
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = (newSub) => {
    setSubscription(newSub);
    if (user?.id) {
      localStorage.setItem(`subscription_${user?.id}`, JSON.stringify(newSub));
    }
  };

  const upgradePlan = async (planId) => {
    try {
      setLoading(true);
      
      // In production, this would call your payment API
      const newSubscription = {
        ...subscription,
        planId,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
      
      updateSubscription(newSubscription);
      toast.success(`Successfully upgraded to ${plans[planId].name} plan!`);
      
      return { success: true };
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Failed to upgrade plan. Please try again.');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      
      const updatedSub = {
        ...subscription,
        status: 'cancelled',
        cancelDate: new Date().toISOString()
      };
      
      updateSubscription(updatedSub);
      toast.success('Subscription cancelled successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Feature access helpers
  const hasFeature = (feature) => {
    if (!subscription || !subscription.planId) return false;
    const plan = plans[subscription.planId];
    return plan?.features[feature] || false;
  };

  const getFeatureLimit = (feature) => {
    if (!subscription || !subscription.planId) return 0;
    const plan = plans[subscription.planId];
    return plan?.features[feature] || 0;
  };

  const canAddChild = () => {
    const maxChildren = getFeatureLimit('maxChildren');
    const currentChildren = subscription?.usage?.children || 0;
    return maxChildren === -1 || currentChildren < maxChildren;
  };

  const canUploadFile = (fileSizeInMB) => {
    const maxFileSize = getFeatureLimit('maxFileSize');
    const maxStorage = getFeatureLimit('storage');
    const currentStorage = subscription?.usage?.storage || 0;
    
    return fileSizeInMB <= maxFileSize && (currentStorage + fileSizeInMB) <= maxStorage;
  };

  const updateUsage = (usage) => {
    const updatedSub = {
      ...subscription,
      usage: {
        ...subscription.usage,
        ...usage
      }
    };
    updateSubscription(updatedSub);
  };

  const getCurrentPlan = () => {
    if (!subscription?.planId) return plans.basic;
    return plans[subscription.planId];
  };

  const getDaysRemaining = () => {
    if (!subscription?.endDate) return 0;
    const endDate = new Date(subscription.endDate);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isSubscriptionActive = () => {
    return subscription?.status === 'active' || subscription?.status === 'trial';
  };

  const value = {
    subscription,
    plans,
    loading,
    upgradePlan,
    cancelSubscription,
    hasFeature,
    getFeatureLimit,
    canAddChild,
    canUploadFile,
    updateUsage,
    getCurrentPlan,
    getDaysRemaining,
    isSubscriptionActive,
    updateSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
