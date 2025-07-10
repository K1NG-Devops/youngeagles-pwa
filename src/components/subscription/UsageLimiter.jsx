import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaExclamationTriangle, FaChartBar, FaArrowUp, FaCheckCircle } from 'react-icons/fa';

const UsageLimiter = ({ 
    feature, 
    children, 
    showProgress = true,
    showWarning = true,
    warningThreshold = 0.8,
    onLimitReached = null,
    className = ''
}) => {
    const { 
        getFeatureLimit, 
        getFeatureUsage, 
        canUseFeature, 
        incrementUsage,
        getCurrentPlan,
        upgradePlan,
        requestFeature
    } = useSubscription();
    const { isDark } = useTheme();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);

    const limit = getFeatureLimit(feature);
    const usage = getFeatureUsage(feature);
    const canUse = canUseFeature(feature);
    const currentPlan = getCurrentPlan();

    // Calculate usage percentage
    const usagePercentage = limit === null ? 0 : Math.min((usage / limit) * 100, 100);
    const isNearLimit = usagePercentage >= (warningThreshold * 100);
    const isAtLimit = !canUse && limit !== null;

    // Handle feature usage
    const handleFeatureUse = async () => {
        if (!canUse) {
            setShowLimitModal(true);
            if (onLimitReached) {
                onLimitReached();
            }
            return false;
        }

        setIsProcessing(true);
        try {
            await incrementUsage(feature);
            return true;
        } catch (error) {
            console.error('Failed to increment usage:', error);
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    // Render children with usage tracking
    const enhancedChildren = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                onClick: async (e) => {
                    const canProceed = await handleFeatureUse();
                    if (canProceed && child.props.onClick) {
                        child.props.onClick(e);
                    } else if (!canProceed) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                },
                disabled: child.props.disabled || isAtLimit || isProcessing
            });
        }
        return child;
    });

    return (
        <div className={className}>
            {/* Usage Progress Bar */}
            {showProgress && limit !== null && (
                <UsageProgress 
                    feature={feature}
                    usage={usage}
                    limit={limit}
                    percentage={usagePercentage}
                    isNearLimit={isNearLimit}
                />
            )}

            {/* Warning Message */}
            {showWarning && isNearLimit && !isAtLimit && (
                <UsageWarning 
                    feature={feature}
                    usage={usage}
                    limit={limit}
                    onUpgrade={() => requestFeature(feature)}
                />
            )}

            {/* Enhanced Children */}
            {enhancedChildren}

            {/* Limit Reached Modal */}
            {showLimitModal && (
                <LimitReachedModal 
                    isOpen={showLimitModal}
                    onClose={() => setShowLimitModal(false)}
                    feature={feature}
                    usage={usage}
                    limit={limit}
                    currentPlan={currentPlan}
                />
            )}
        </div>
    );
};

// Usage Progress Component
const UsageProgress = ({ feature, usage, limit, percentage, isNearLimit }) => {
    const { isDark } = useTheme();

    const getProgressColor = () => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getFeatureName = (feature) => {
        const names = {
            'homework_limit': 'Homework Assignments',
            'activities_limit': 'Activities',
            'children_limit': 'Children',
            'storage_limit': 'Storage'
        };
        return names[feature] || feature.replace('_', ' ');
    };

    return (
        <div className={`mb-3 p-3 rounded-lg ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                    {getFeatureName(feature)}
                </span>
                <span className={`text-xs ${
                    isNearLimit 
                        ? 'text-yellow-500' 
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                    {usage} / {limit}
                </span>
            </div>
            
            <div className={`w-full h-2 rounded-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
                <div 
                    className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
};

// Usage Warning Component
const UsageWarning = ({ feature, usage, limit, onUpgrade }) => {
    const { isDark } = useTheme();
    const remaining = limit - usage;

    return (
        <div className={`mb-3 p-3 rounded-lg border-l-4 border-yellow-500 ${
            isDark ? 'bg-yellow-900/20 border-r border-t border-b border-yellow-800' : 'bg-yellow-50 border-r border-t border-b border-yellow-200'
        }`}>
            <div className="flex items-start">
                <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                    <p className={`text-sm font-medium ${
                        isDark ? 'text-yellow-300' : 'text-yellow-800'
                    }`}>
                        Usage Limit Warning
                    </p>
                    <p className={`text-xs mt-1 ${
                        isDark ? 'text-yellow-200' : 'text-yellow-700'
                    }`}>
                        You have {remaining} {remaining === 1 ? 'use' : 'uses'} remaining. 
                        <button 
                            onClick={onUpgrade}
                            className="underline ml-1 hover:no-underline"
                        >
                            Upgrade for unlimited access
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Limit Reached Modal
const LimitReachedModal = ({ isOpen, onClose, feature, usage, limit, currentPlan }) => {
    const { isDark } = useTheme();
    const { plans, upgradePlan } = useSubscription();
    const [isUpgrading, setIsUpgrading] = useState(false);

    if (!isOpen) return null;

    const getFeatureName = (feature) => {
        const names = {
            'homework_limit': 'homework assignments',
            'activities_limit': 'activities',
            'children_limit': 'children',
            'storage_limit': 'storage space'
        };
        return names[feature] || feature.replace('_', ' ');
    };

    // Find plans that offer unlimited or higher limits for this feature
    const betterPlans = Object.entries(plans).filter(([planId, plan]) => {
        const planFeature = plan.features[feature];
        return planFeature === null || (typeof planFeature === 'number' && planFeature > limit);
    }).filter(([planId]) => planId !== currentPlan.id);

    const handleUpgrade = async (planId) => {
        setIsUpgrading(true);
        try {
            await upgradePlan(planId);
            onClose();
        } catch (error) {
            console.error('Upgrade failed:', error);
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className={`relative max-w-md w-full mx-4 p-6 rounded-xl shadow-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <FaExclamationTriangle className="text-red-600 text-xl" />
                    </div>
                    
                    <h3 className={`text-lg font-semibold mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                        Usage Limit Reached
                    </h3>
                    
                    <p className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        You've reached your limit of {limit} {getFeatureName(feature)} for the {currentPlan.name}.
                    </p>
                </div>

                {betterPlans.length > 0 && (
                    <div className="space-y-3 mb-6">
                        <p className={`text-sm font-medium ${
                            isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                            Upgrade to continue:
                        </p>
                        
                        {betterPlans.map(([planId, plan]) => (
                            <div 
                                key={planId}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                    isDark 
                                        ? 'border-gray-600 hover:border-blue-500 bg-gray-700 hover:bg-gray-600' 
                                        : 'border-gray-200 hover:border-blue-500 bg-gray-50 hover:bg-blue-50'
                                }`}
                                onClick={() => handleUpgrade(planId)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className={`font-medium ${
                                            isDark ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {plan.name}
                                        </div>
                                        <div className={`text-xs ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            {plan.features[feature] === null 
                                                ? 'Unlimited' 
                                                : `Up to ${plan.features[feature]}`
                                            } {getFeatureName(feature)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-blue-500 font-semibold">
                                            R{plan.price}
                                        </div>
                                        <div className={`text-xs ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            /month
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            isDark 
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                    >
                        Close
                    </button>
                    
                    {betterPlans.length === 0 && (
                        <button
                            onClick={() => window.open('/contact', '_blank')}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                            Contact Support
                        </button>
                    )}
                </div>

                {isUpgrading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                        <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2" />
                            <span>Upgrading...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsageLimiter; 