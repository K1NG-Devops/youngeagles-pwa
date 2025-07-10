import React, { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
    FaCrown, 
    FaExclamationTriangle, 
    FaCalendarAlt, 
    FaStar, 
    FaTimes, 
    FaArrowUp,
    FaCheckCircle,
    FaClock
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SubscriptionBanner = ({ 
    showOnActive = false, 
    position = 'top',
    dismissible = true,
    className = ''
}) => {
    const { 
        subscription, 
        getCurrentPlan, 
        getSubscriptionStatus, 
        getDaysUntilExpiry,
        upgradePlan,
        reactivateSubscription
    } = useSubscription();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [isDismissed, setIsDismissed] = useState(false);

    const currentPlan = getCurrentPlan();
    const status = getSubscriptionStatus();
    const daysUntilExpiry = getDaysUntilExpiry();

    // Don't show banner if dismissed or if active and showOnActive is false
    if (isDismissed || (status === 'active' && !showOnActive)) {
        return null;
    }

    const getBannerConfig = () => {
        switch (status) {
            case 'trial':
                return {
                    type: 'trial',
                    icon: FaClock,
                    title: 'Trial Period',
                    message: daysUntilExpiry > 0 
                        ? `Your trial expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`
                        : 'Your trial expires today',
                    action: 'Upgrade Now',
                    color: 'blue',
                    urgent: daysUntilExpiry <= 3
                };
            
            case 'expiring_soon':
                return {
                    type: 'expiring',
                    icon: FaExclamationTriangle,
                    title: 'Subscription Expiring',
                    message: daysUntilExpiry > 0 
                        ? `Your subscription expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`
                        : 'Your subscription expires today',
                    action: 'Renew Now',
                    color: 'yellow',
                    urgent: daysUntilExpiry <= 1
                };
            
            case 'expired':
                return {
                    type: 'expired',
                    icon: FaExclamationTriangle,
                    title: 'Subscription Expired',
                    message: 'Your subscription has expired. Reactivate to continue using premium features.',
                    action: 'Reactivate',
                    color: 'red',
                    urgent: true
                };
            
            case 'cancelled':
                return {
                    type: 'cancelled',
                    icon: FaExclamationTriangle,
                    title: 'Subscription Cancelled',
                    message: 'Your subscription has been cancelled. You can reactivate it anytime.',
                    action: 'Reactivate',
                    color: 'gray',
                    urgent: false
                };
            
            case 'suspended':
                return {
                    type: 'suspended',
                    icon: FaExclamationTriangle,
                    title: 'Subscription Suspended',
                    message: 'Your subscription is suspended due to payment issues.',
                    action: 'Update Payment',
                    color: 'red',
                    urgent: true
                };
            
            case 'active':
                if (currentPlan.id === 'free') {
                    return {
                        type: 'free',
                        icon: FaStar,
                        title: 'Free Plan',
                        message: 'Upgrade to unlock premium features and remove limits.',
                        action: 'Upgrade',
                        color: 'blue',
                        urgent: false
                    };
                }
                return null;
            
            default:
                return null;
        }
    };

    const config = getBannerConfig();
    if (!config) return null;

    const handleAction = async () => {
        switch (config.type) {
            case 'trial':
            case 'expiring':
            case 'free':
                navigate('/pricing');
                break;
            case 'expired':
            case 'cancelled':
                try {
                    await reactivateSubscription();
                } catch (error) {
                    navigate('/pricing');
                }
                break;
            case 'suspended':
                navigate('/payment-settings');
                break;
        }
    };

    const getColorClasses = (color, urgent = false) => {
        const colors = {
            blue: urgent 
                ? `${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-100 border-blue-300'} text-blue-700 ${isDark ? 'text-blue-300' : ''}`
                : `${isDark ? 'bg-blue-900/50 border-blue-800' : 'bg-blue-50 border-blue-200'} text-blue-600 ${isDark ? 'text-blue-400' : ''}`,
            yellow: urgent 
                ? `${isDark ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-100 border-yellow-300'} text-yellow-700 ${isDark ? 'text-yellow-300' : ''}`
                : `${isDark ? 'bg-yellow-900/50 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} text-yellow-600 ${isDark ? 'text-yellow-400' : ''}`,
            red: `${isDark ? 'bg-red-900/50 border-red-800' : 'bg-red-50 border-red-200'} text-red-600 ${isDark ? 'text-red-400' : ''}`,
            gray: `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} text-gray-600 ${isDark ? 'text-gray-400' : ''}`
        };
        return colors[color] || colors.gray;
    };

    const positionClasses = {
        top: 'top-0',
        bottom: 'bottom-0',
        static: ''
    };

    return (
        <div className={`
            ${position !== 'static' ? 'fixed left-0 right-0 z-40' : ''}
            ${positionClasses[position]}
            ${className}
        `}>
            <div className={`
                border-l-4 p-4 
                ${getColorClasses(config.color, config.urgent)}
                ${position !== 'static' ? 'border-r border-t border-b' : 'border rounded-lg'}
            `}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                        <config.icon className={`mr-3 flex-shrink-0 ${
                            config.urgent ? 'animate-pulse' : ''
                        }`} />
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-sm">
                                    {config.title}
                                </h4>
                                {currentPlan.id !== 'free' && (
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {currentPlan.name}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm mt-1 opacity-90">
                                {config.message}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                        <button
                            onClick={handleAction}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                config.color === 'blue' 
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : config.color === 'yellow'
                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    : config.color === 'red'
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                            }`}
                        >
                            {config.action}
                        </button>
                        
                        {dismissible && (
                            <button
                                onClick={() => setIsDismissed(true)}
                                className={`p-1 rounded-lg transition-colors ${
                                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                                } opacity-60 hover:opacity-100`}
                            >
                                <FaTimes className="text-sm" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mini Banner Component for smaller spaces
export const MiniSubscriptionBanner = ({ className = '' }) => {
    const { getCurrentPlan, getSubscriptionStatus } = useSubscription();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const currentPlan = getCurrentPlan();
    const status = getSubscriptionStatus();

    if (status === 'active' && currentPlan.id !== 'free') {
        return null;
    }

    return (
        <div className={`
            flex items-center justify-between p-2 rounded-lg border text-sm
            ${isDark ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}
            ${className}
        `}>
            <div className="flex items-center">
                <FaCrown className="mr-2 text-xs" />
                <span>
                    {currentPlan.id === 'free' ? 'Upgrade to Premium' : 'Subscription Issue'}
                </span>
            </div>
            
            <button
                onClick={() => navigate('/pricing')}
                className="text-blue-500 hover:text-blue-600 font-medium"
            >
                <FaArrowUp className="inline mr-1" />
                Upgrade
            </button>
        </div>
    );
};

// Subscription Status Indicator
export const SubscriptionStatusIndicator = ({ showText = true, className = '' }) => {
    const { getCurrentPlan, getSubscriptionStatus } = useSubscription();
    const { isDark } = useTheme();

    const currentPlan = getCurrentPlan();
    const status = getSubscriptionStatus();

    const getStatusConfig = () => {
        switch (status) {
            case 'active':
                return {
                    icon: FaCheckCircle,
                    text: currentPlan.name,
                    color: 'green'
                };
            case 'trial':
                return {
                    icon: FaClock,
                    text: 'Trial',
                    color: 'blue'
                };
            case 'expiring_soon':
                return {
                    icon: FaExclamationTriangle,
                    text: 'Expiring Soon',
                    color: 'yellow'
                };
            case 'expired':
                return {
                    icon: FaExclamationTriangle,
                    text: 'Expired',
                    color: 'red'
                };
            case 'cancelled':
                return {
                    icon: FaTimes,
                    text: 'Cancelled',
                    color: 'gray'
                };
            case 'suspended':
                return {
                    icon: FaExclamationTriangle,
                    text: 'Suspended',
                    color: 'red'
                };
            default:
                return {
                    icon: FaCheckCircle,
                    text: 'Free',
                    color: 'gray'
                };
        }
    };

    const config = getStatusConfig();
    
    const colorClasses = {
        green: 'text-green-500',
        blue: 'text-blue-500',
        yellow: 'text-yellow-500',
        red: 'text-red-500',
        gray: isDark ? 'text-gray-400' : 'text-gray-500'
    };

    return (
        <div className={`flex items-center ${className}`}>
            <config.icon className={`${colorClasses[config.color]} ${showText ? 'mr-2' : ''}`} />
            {showText && (
                <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                    {config.text}
                </span>
            )}
        </div>
    );
};

export default SubscriptionBanner; 