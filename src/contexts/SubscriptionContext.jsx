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
    const [isLoading, setIsLoading] = useState(true);
    const [features, setFeatures] = useState({});
    const [usage, setUsage] = useState({});
    const [plans, setPlans] = useState({});

    // Default plan configurations
    const defaultPlans = {
        free: {
            id: 'free',
            name: 'Free Plan',
            description: 'Basic features with limited access',
            price: 0,
            priceAnnual: 0,
      features: {
                children_limit: 1,
                homework_limit: 5,
                activities_limit: 3,
                storage_limit: 100, // MB
                ads_enabled: true,
                no_ads: false,
                progress_tracking: false,
                priority_support: false,
                bulk_management: false,
                analytics: false,
                api_access: false
            },
            popular: false,
            trial_days: 0
        },
        student: {
            id: 'student',
            name: 'Student Plan',
            description: 'Perfect for individual students',
            price: 99,
            priceAnnual: 990,
      features: {
                children_limit: 1,
                homework_limit: null, // unlimited
                activities_limit: null,
                storage_limit: null,
                ads_enabled: false,
                no_ads: true,
                progress_tracking: true,
                priority_support: true,
                bulk_management: false,
                analytics: false,
                api_access: false
            },
            popular: true,
            trial_days: 7
    },
    family: {
      id: 'family',
            name: 'Family Plan',
            description: 'Ideal for families with multiple children',
            price: 199,
            priceAnnual: 1990,
            features: {
                children_limit: 5,
                homework_limit: null,
                activities_limit: null,
                storage_limit: null,
                ads_enabled: false,
                no_ads: true,
                progress_tracking: true,
                priority_support: true,
                bulk_management: true,
                analytics: true,
                api_access: false
            },
            popular: false,
            trial_days: 14
        },
        institution: {
            id: 'institution',
            name: 'Institution Plan',
            description: 'Comprehensive solution for schools',
            price: 399,
            priceAnnual: 3990,
      features: {
                children_limit: null, // unlimited
                homework_limit: null,
                activities_limit: null,
                storage_limit: null,
                ads_enabled: false,
                no_ads: true,
                progress_tracking: true,
                priority_support: true,
                bulk_management: true,
                analytics: true,
                api_access: true
      },
            popular: false,
            trial_days: 30
    }
  };

    useEffect(() => {
        setPlans(defaultPlans);
        if (user) {
            fetchSubscriptionData();
      } else {
            setIsLoading(false);
    }
  }, [user]);

    const fetchSubscriptionData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch user subscription
            const subResponse = await apiService.subscriptions.getCurrent();
            setSubscription(subResponse.data.subscription);
            
            // Fetch features and usage
            const featuresResponse = await apiService.subscriptions.getFeatures();
            setFeatures(featuresResponse.data.features);
            
            const usageResponse = await apiService.subscriptions.getUsage();
            setUsage(usageResponse.data.usage);
            
    } catch (error) {
            console.error('Error fetching subscription data:', error);
            // Set default free plan if no subscription found
            setSubscription({
                plan_id: 'free',
                plan_name: 'Free Plan',
                status: 'active',
                subscription_end_date: null,
                auto_renew: false
            });
            setFeatures(defaultPlans.free.features);
    } finally {
            setIsLoading(false);
    }
  };

    const hasFeature = (featureName) => {
        if (!subscription) return false;
      
        const currentPlan = subscription.plan_id || 'free';
        const planFeatures = defaultPlans[currentPlan]?.features || {};
        
        return planFeatures[featureName] === true || planFeatures[featureName] === null;
    };

    const getFeatureLimit = (featureName) => {
        if (!subscription) return 0;
        
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
        
        // If limit is null, feature is unlimited
        if (limit === null) return true;
        
        // If limit is 0, feature is disabled
        if (limit === 0) return false;

        // Check if usage is within limit
        return currentUsage < limit;
    };

    const incrementUsage = async (featureName) => {
        try {
            await apiService.subscriptions.incrementUsage(featureName);
            setUsage(prev => ({
                ...prev,
                [featureName]: (prev[featureName] || 0) + 1
            }));
        } catch (error) {
            console.error('Error incrementing usage:', error);
        }
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

    const showAds = () => {
        if (!subscription) return true;
        const currentPlan = getCurrentPlan();
        return currentPlan.features.ads_enabled;
  };

    const upgradePlan = async (planId, billingCycle = 'monthly') => {
        try {
            setIsLoading(true);
            const response = await apiService.subscriptions.upgrade(planId, billingCycle);
            
            if (response.data.checkout_url) {
                // Redirect to payment gateway
                window.location.href = response.data.checkout_url;
            } else {
                nativeNotificationService.success('Subscription upgraded successfully!');
                await fetchSubscriptionData();
            }
        } catch (error) {
            console.error('Error upgrading subscription:', error);
            nativeNotificationService.error('Failed to upgrade subscription. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const cancelSubscription = async (reason = null) => {
        try {
            setIsLoading(true);
            await apiService.subscriptions.cancel(reason);
            nativeNotificationService.success('Subscription cancelled successfully');
            await fetchSubscriptionData();
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            nativeNotificationService.error('Failed to cancel subscription. Please try again.');
        } finally {
            setIsLoading(false);
        }
  };

    const reactivateSubscription = async () => {
        try {
            setIsLoading(true);
            await apiService.subscriptions.reactivate();
            nativeNotificationService.success('Subscription reactivated successfully');
            await fetchSubscriptionData();
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            nativeNotificationService.error('Failed to reactivate subscription. Please try again.');
        } finally {
            setIsLoading(false);
        }
  };

    const getSubscriptionStatus = () => {
        if (!subscription) return 'none';
        
        const now = new Date();
        const endDate = subscription.subscription_end_date ? new Date(subscription.subscription_end_date) : null;
        
        if (subscription.status === 'cancelled') return 'cancelled';
        if (subscription.status === 'expired') return 'expired';
        if (subscription.status === 'suspended') return 'suspended';
        if (subscription.status === 'trial') return 'trial';
        
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

    const isTrialExpired = () => {
    if (!subscription) return false;
    
        // Check if subscription is in trial status but expired
        if (subscription.status === 'trial' && subscription.trial_end_date) {
            const trialEndDate = new Date(subscription.trial_end_date);
            return trialEndDate < new Date();
        }
        
        return false;
  };

  const isSubscriptionExpired = () => {
    if (!subscription) return false;
        
        const status = getSubscriptionStatus();
        return status === 'expired';
    };

    const getDaysRemaining = () => {
        return getDaysUntilExpiry();
    };

    const getPaymentHistory = async () => {
        try {
            const response = await apiService.subscriptions.getPaymentHistory();
            return response.data.payments || [];
        } catch (error) {
            console.error('Error fetching payment history:', error);
            return [];
        }
    };

    const requestFeature = (featureName, onUpgrade = null) => {
        const currentPlan = getCurrentPlan();
        const availableInPlan = Object.entries(defaultPlans).find(([planId, plan]) => 
            plan.features[featureName] === true || plan.features[featureName] === null
        );
        
        if (availableInPlan) {
            const [planId, plan] = availableInPlan;
            nativeNotificationService.info(
                `This feature is available in the ${plan.name}. Upgrade to unlock it!`,
                {
                    duration: 5000,
                    action: onUpgrade ? {
                        label: 'Upgrade Now',
                        onClick: () => onUpgrade(planId)
                    } : null
                }
            );
        } else {
            nativeNotificationService.info('This feature is not available in any plan currently.');
        }
  };

  const value = {
    subscription,
        isLoading,
        features,
        usage,
    plans,
        
        // Feature access
    hasFeature,
    getFeatureLimit,
        getFeatureUsage,
        canUseFeature,
        incrementUsage,
        requestFeature,
        
        // Plan management
    getCurrentPlan,
        isSubscriptionActive,
        showAds,
        upgradePlan,
        cancelSubscription,
        reactivateSubscription,
        
        // Status
        getSubscriptionStatus,
        getDaysUntilExpiry,
    getDaysRemaining,
    isTrialExpired,
    isSubscriptionExpired,
        
        // Payment
        getPaymentHistory,
        
        // Refresh
        refreshSubscription: fetchSubscriptionData
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
