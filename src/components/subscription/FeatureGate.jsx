import React, { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaLock, FaStar, FaCheckCircle, FaTimes, FaArrowUp, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FeatureGate = ({ 
    feature, 
    children, 
    fallback = null, 
    showUpgradePrompt = true,
    requiresPlan = null,
    customMessage = null,
    className = '',
    inline = false
}) => {
    const { hasFeature, canUseFeature, getCurrentPlan, plans, upgradePlan, requestFeature } = useSubscription();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Check if user has access to this feature
    const hasAccess = hasFeature(feature);
    const canUse = canUseFeature(feature);
    
    // If user has access and can use the feature, render children
    if (hasAccess && canUse) {
        return <>{children}</>;
    }

    // If fallback is provided and user doesn't have access, render fallback
    if (fallback && !hasAccess) {
        return <>{fallback}</>;
    }

    // Find the plan that includes this feature
    const availablePlan = Object.entries(plans).find(([planId, plan]) => {
        if (requiresPlan && planId !== requiresPlan) return false;
        return plan.features[feature] === true || plan.features[feature] === null;
    });

    const currentPlan = getCurrentPlan();

    const handleUpgrade = async (planId) => {
        try {
            await upgradePlan(planId);
        } catch (error) {
            console.error('Upgrade failed:', error);
        }
    };

    const handleUpgradeClick = () => {
        if (availablePlan) {
            if (showUpgradePrompt) {
                setShowUpgradeModal(true);
            } else {
                requestFeature(feature, handleUpgrade);
            }
        } else {
            navigate('/pricing');
        }
    };

    // Inline gate (small prompt)
    if (inline) {
        return (
            <div className={`inline-flex items-center space-x-2 ${className}`}>
                <FaLock className="text-gray-400 text-sm" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {customMessage || `${availablePlan ? availablePlan[1].name : 'Premium'} feature`}
                </span>
                {availablePlan && (
                    <button
                        onClick={handleUpgradeClick}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                        Upgrade
                    </button>
                )}
            </div>
        );
    }

    // Full feature gate
    return (
        <>
            <div className={`relative ${className}`}>
                {/* Blurred content */}
                <div className="filter blur-sm pointer-events-none opacity-50">
                    {children}
                </div>
                
                {/* Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center ${
                    isDark ? 'bg-gray-900/80' : 'bg-white/80'
                } backdrop-blur-sm`}>
                    <div className={`max-w-md p-6 rounded-xl shadow-lg text-center ${
                        isDark 
                            ? 'bg-gray-800 border border-gray-700' 
                            : 'bg-white border border-gray-200'
                    }`}>
                        <div className="flex justify-center mb-4">
                            <div className={`p-3 rounded-full ${
                                availablePlan 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                <FaLock className="text-2xl" />
                            </div>
                        </div>
                        
                        <h3 className={`text-lg font-semibold mb-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                            {availablePlan ? 'Premium Feature' : 'Feature Locked'}
                        </h3>
                        
                        <p className={`text-sm mb-4 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            {customMessage || (
                                availablePlan 
                                    ? `This feature is available in the ${availablePlan[1].name}. Upgrade to unlock it!`
                                    : 'This feature is not available in your current plan.'
                            )}
                        </p>
                        
                        {availablePlan && (
                            <div className="space-y-3">
                                <div className={`text-xs p-2 rounded-lg ${
                                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                        Current: {currentPlan.name}
                                    </span>
                                    <span className="mx-2">→</span>
                                    <span className="text-blue-500 font-medium">
                                        {availablePlan[1].name}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={handleUpgradeClick}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    <FaArrowUp className="inline mr-2" />
                                    Upgrade Now
                                </button>
                            </div>
                        )}
                        
                        {!availablePlan && (
                            <button
                                onClick={() => navigate('/pricing')}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                View Plans
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Upgrade Modal */}
            {showUpgradeModal && availablePlan && (
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    currentPlan={currentPlan}
                    targetPlan={availablePlan[1]}
                    feature={feature}
                    onUpgrade={() => handleUpgrade(availablePlan[0])}
                />
            )}
        </>
    );
};

// Upgrade Modal Component
const UpgradeModal = ({ isOpen, onClose, currentPlan, targetPlan, feature, onUpgrade }) => {
    const { isDark } = useTheme();
    const [isUpgrading, setIsUpgrading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            await onUpgrade();
            onClose();
        } catch (error) {
            console.error('Upgrade failed:', error);
        } finally {
            setIsUpgrading(false);
        }
    };

    const featureNames = {
        'no_ads': 'Ad-free experience',
        'progress_tracking': 'Progress tracking',
        'priority_support': 'Priority support',
        'bulk_management': 'Bulk management',
        'analytics': 'Advanced analytics',
        'api_access': 'API access',
        'multiple_children': 'Multiple children support',
        'unlimited_storage': 'Unlimited storage',
        'custom_branding': 'Custom branding'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className={`relative max-w-lg w-full mx-4 p-6 rounded-xl shadow-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                        Upgrade Required
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-lg hover:bg-gray-100 ${
                            isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500'
                        }`}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="mb-6">
                    <div className={`p-4 rounded-lg mb-4 ${
                        isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                    }`}>
                        <div className="flex items-center mb-2">
                            <FaInfoCircle className="text-blue-500 mr-2" />
                            <span className={`font-medium ${
                                isDark ? 'text-blue-300' : 'text-blue-700'
                            }`}>
                                Feature: {featureNames[feature] || feature}
                            </span>
                        </div>
                        <p className={`text-sm ${
                            isDark ? 'text-blue-200' : 'text-blue-600'
                        }`}>
                            This feature is included in the {targetPlan.name}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                Current Plan
                            </span>
                            <span className={`font-medium ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                                {currentPlan.name}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                Upgrade To
                            </span>
                            <span className="font-medium text-blue-500">
                                {targetPlan.name}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                Monthly Price
                            </span>
                            <span className={`font-bold text-lg ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                                R{targetPlan.price}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            isDark 
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        {isUpgrading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                Upgrading...
                            </span>
                        ) : (
                            <>
                                <FaStar className="inline mr-2" />
                                Upgrade Now
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeatureGate; 