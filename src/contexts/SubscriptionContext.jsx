import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { useAuth } from './AuthContext';
import nativeNotificationService from '../services/nativeNotificationService';

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
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [adFrequency, setAdFrequency] = useState({
    sessionAdCount: 0,
    lastAdShown: null,
    maxAdsPerSession: 3,
    minTimeBetweenAds: 5 * 60 * 1000, // 5 minutes
    naturalBreakPoints: ['dashboard', 'homework-complete', 'lesson-end', 'navigation-change']
  });
  const [features, setFeatures] = useState({});
  const [usage, setUsage] = useState({
    children: 0,
    homework: 0,
    activities: 0,
    storage: 0,
    ai_usage: 0,
    api_calls: 0
  });
  const [plans, setPlans] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);

  // Enhanced plan configurations with South African pricing
  const defaultPlans = {
    free: {
      id: 'free',
      name: 'Free Plan',
      description: 'Perfect for trying out Young Eagles',
      price: 0,
      priceAnnual: 0,
      period: 'month',
      features: {
        maxChildren: 1,
        maxHomework: 5,
        maxActivities: 3,
        maxFileSize: 5, // MB
        storage: 50, // Changed from 100 to 50 MB
        messaging: false, // No communication for free plan
        analytics: 'none',
        priority_support: false,
        bulk_management: false,
        api_access: false,
        ads_enabled: true,
        ai_grading: false,
        progress_reports: 'basic',
        parent_portal: true,
        mobile_app: true
      },
      popular: false,
      trial_days: 0,
      color: 'gray'
    },
    student: {
      id: 'student',
      name: 'Student Plan',
      description: 'Perfect for individual students',
      price: 49,
      priceAnnual: 490,
      period: 'month',
      features: {
        maxChildren: 1,
        maxHomework: -1, // unlimited
        maxActivities: -1,
        maxFileSize: 50, // MB
        storage: 100, // Changed from 1000 to 100 MB
        messaging: true, // Communication enabled for student plan
        analytics: 'basic',
        priority_support: true,
        bulk_management: false,
        api_access: false,
        ads_enabled: false,
        ai_grading: true,
        progress_reports: 'detailed',
        parent_portal: true,
        mobile_app: true
      },
      popular: true,
      trial_days: 14,
      color: 'blue',
      savings: 'Save R98/year'
    },
    family: {
      id: 'family',
      name: 'Family Plan',
      description: 'Ideal for families with multiple children',
      price: 99,
      priceAnnual: 990,
      period: 'month',
      features: {
        maxChildren: 5,
        maxHomework: -1,
        maxActivities: -1,
        maxFileSize: 100, // MB
        storage: 5000, // MB
        messaging: true,
        analytics: 'advanced',
        priority_support: true,
        bulk_management: true,
        api_access: false,
        ads_enabled: false,
        ai_grading: true,
        progress_reports: 'comprehensive',
        parent_portal: true,
        mobile_app: true
      },
      popular: false,
      trial_days: 14,
      color: 'purple',
      savings: 'Save R198/year'
    },
    institution: {
      id: 'institution',
      name: 'Institution Plan',
      description: 'Comprehensive solution for schools and educational institutions',
      price: 199,
      priceAnnual: 1990,
      period: 'month',
      features: {
        maxChildren: -1, // unlimited
        maxHomework: -1,
        maxActivities: -1,
        maxFileSize: 500, // MB
        storage: 50000, // MB
        messaging: true,
        analytics: 'enterprise',
        priority_support: true,
        bulk_management: true,
        api_access: true,
        ads_enabled: false,
        ai_grading: true,
        progress_reports: 'enterprise',
        parent_portal: true,
        mobile_app: true
      },
      popular: false,
      trial_days: 30,
      color: 'gold',
      savings: 'Save R398/year'
    }
  };

  // Remove the mock data generation functions - they're no longer needed
  // const generateRealisticSubscription = () => { ... }
  // const generateRealisticUsage = (planId) => { ... }
  // const generatePaymentHistory = (subscription) => { ... }

  useEffect(() => {
    setPlans(defaultPlans);
    if (user) {
      fetchSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch real subscription data
      const subResponse = await apiService.subscriptions.getCurrent();
      
      if (subResponse.data.success && subResponse.data.subscription) {
        const realSubscription = subResponse.data.subscription;
        setSubscription(realSubscription);
        setFeatures(defaultPlans[realSubscription.plan_id]?.features || defaultPlans.free.features);
        
        // Try to fetch real usage data
        try {
          const usageResponse = await apiService.subscriptions.getUsage();
          setUsage(usageResponse.data.usage || { children: 0, homework: 0, activities: 0, storage: 0 });
        } catch (usageError) {
          setUsage({ children: 0, homework: 0, activities: 0, storage: 0 });
        }
        
        // Try to fetch payment history
        try {
          const historyResponse = await apiService.subscriptions.getPaymentHistory();
          setPaymentHistory(historyResponse.data.payments || []);
        } catch (historyError) {
          setPaymentHistory([]);
        }
        
      } else {
        // No subscription found - user is on free plan
        setSubscription(null);
        setFeatures(defaultPlans.free.features);
        setUsage({ children: 0, homework: 0, activities: 0, storage: 0 });
        setPaymentHistory([]);
      }
      
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      
      // Set to free plan if API fails
      setSubscription(null);
      setFeatures(defaultPlans.free.features);
      setUsage({ children: 0, homework: 0, activities: 0, storage: 0 });
      setPaymentHistory([]);
      setError('Failed to load subscription data');
      
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const updateUsage = async (newUsage) => {
    try {
      // Try to update usage on server
      await apiService.subscriptions.updateUsage(newUsage);
      setUsage(prev => ({ ...prev, ...newUsage }));
    } catch (error) {
      console.error('Error updating usage:', error);
      // Update locally even if server fails
      setUsage(prev => ({ ...prev, ...newUsage }));
    }
  };

  const hasFeature = (featureName) => {
    if (!subscription) return false;
    
    const currentPlan = subscription.plan_id || 'free';
    const planFeatures = defaultPlans[currentPlan]?.features || {};
    
    return planFeatures[featureName] === true || planFeatures[featureName] === -1;
  };

  const getFeatureLimit = (featureName) => {
    if (!subscription) return defaultPlans.free.features[featureName] || 0;
    
    const currentPlan = subscription.plan_id || 'free';
    const planFeatures = defaultPlans[currentPlan]?.features || {};
    
    return planFeatures[featureName] || 0;
  };

  const getFeatureUsage = (featureName) => {
    return usage[featureName] || 0;
  };

  const canUseFeature = (featureName) => {
    const limit = getFeatureLimit(featureName);
    const currentUsage = getFeatureUsage(featureName);
    
    // If limit is -1, feature is unlimited
    if (limit === -1) return true;
    
    // If limit is 0, feature is disabled
    if (limit === 0) return false;
    
    // Check if usage is within limit
    return currentUsage < limit;
  };

  const getCurrentPlan = () => {
    if (!subscription) return defaultPlans.free;
    return defaultPlans[subscription.plan_id] || defaultPlans.free;
  };

  const isSubscriptionActive = () => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    if (subscription.subscription_end_date) {
      const endDate = new Date(subscription.subscription_end_date);
      return endDate > new Date();
    }
    return true;
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return 'none';
    
    const now = new Date();
    const endDate = subscription.subscription_end_date ? new Date(subscription.subscription_end_date) : null;
    
    if (subscription.status === 'cancelled') return 'cancelled';
    if (subscription.status === 'expired') return 'expired';
    if (subscription.status === 'suspended') return 'suspended';
    if (subscription.status === 'trial') {
      if (subscription.trial_end_date && new Date(subscription.trial_end_date) < now) {
        return 'trial_expired';
      }
      return 'trial';
    }
    
    if (endDate && endDate < now) return 'expired';
    if (endDate && endDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) return 'expiring_soon';
    
    return 'active';
  };

  const getDaysUntilExpiry = () => {
    if (!subscription || !subscription.subscription_end_date) return null;
    
    const endDate = new Date(subscription.subscription_end_date);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDaysRemaining = () => {
    return getDaysUntilExpiry();
  };

  const getUsagePercentage = (featureName) => {
    const limit = getFeatureLimit(featureName);
    const currentUsage = getFeatureUsage(featureName);
    
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100; // Disabled
    
    return Math.min(100, (currentUsage / limit) * 100);
  };

  const getNextBillingAmount = () => {
    if (!subscription) return 0;
    
    return subscription.billing_cycle === 'monthly' ? 
      subscription.price_monthly : subscription.price_annual;
  };

  const getNextBillingDate = () => {
    if (!subscription) return null;
    
    return subscription.next_billing_date ? 
      new Date(subscription.next_billing_date).toLocaleDateString() : 
      'Not scheduled';
  };

  const upgradePlan = async (planId, billingCycle = 'monthly') => {
    try {
      setLoading(true);
      const response = await apiService.subscriptions.upgrade(planId, billingCycle);
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        nativeNotificationService.success('Subscription upgraded successfully!');
        await fetchSubscriptionData();
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      nativeNotificationService.error('Failed to upgrade subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (reason = null) => {
    try {
      setLoading(true);
      await apiService.subscriptions.cancel(reason);
      nativeNotificationService.success('Subscription cancelled successfully');
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      nativeNotificationService.error('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const canAddChild = () => {
    const currentPlan = getCurrentPlan();
    const maxChildren = currentPlan.features.maxChildren;
    
    if (maxChildren === -1) return true; // unlimited
    
    const currentChildren = getFeatureUsage('children') || 0;
    return currentChildren < maxChildren;
  };

  const getMaxChildren = () => {
    const currentPlan = getCurrentPlan();
    return currentPlan.features.maxChildren;
  };

  const value = {
    subscription,
    loading,
    error,
    lastUpdated,
    features,
    usage,
    plans,
    paymentHistory,
    subscriptionHistory,
    
    // Feature access
    hasFeature,
    getFeatureLimit,
    getFeatureUsage,
    canUseFeature,
    updateUsage,
    
    // Plan management
    getCurrentPlan,
    isSubscriptionActive,
    upgradePlan,
    cancelSubscription,
    
    // Status and metrics
    getSubscriptionStatus,
    getDaysUntilExpiry,
    getDaysRemaining,
    getUsagePercentage,
    getNextBillingAmount,
    getNextBillingDate,
    
    // Child management
    canAddChild,
    getMaxChildren,
    
    // Refresh
    refreshSubscription: fetchSubscriptionData
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
