/**
 * Young Eagles PWA - Ad Revenue Optimization Strategy
 * 
 * This configuration defines our strategic approach to maximize ad revenue
 * while maintaining excellent user experience and educational focus.
 */

export const AD_STRATEGY = {
  // Page Value Tiers for Ad Placement
  HIGH_VALUE_PAGES: [
    '/dashboard',      // Primary user engagement
    '/homework',       // High activity and time spent
    '/activities',     // Interactive content, high engagement
    '/children',       // Core functionality, frequent visits
    '/management',     // Payment-related, high conversion potential
    '/checkout'        // Premium conversion funnel
  ],

  MEDIUM_VALUE_PAGES: [
    '/classes',        // Educational content
    '/notifications',  // Regular check-ins
    '/settings',       // User configuration
    '/events',         // Community engagement
    '/submit-work'     // Assignment submissions
  ],

  LOW_VALUE_PAGES: [
    '/login',          // Minimal ads to avoid signup friction
    '/signup',         // Focus on conversion, not ads
    '/register',       // Same as signup
    '/privacy-policy', // Legal pages, minimal ads
    '/terms-of-service'
  ],

  // Ad Frequency by Page Value
  AD_FREQUENCY: {
    HIGH_VALUE: 0.6,    // 60% chance - Maximum revenue potential
    MEDIUM_VALUE: 0.4,  // 40% chance - Balanced approach
    LOW_VALUE: 0.2,     // 20% chance - Minimal interruption
    PREMIUM_USER: 0.1   // 10% chance - Respect premium subscription
  },

  // Strategic Ad Positions
  AD_POSITIONS: {
    HEADER: {
      priority: 'high',
      format: 'banner',
      description: 'Premium visibility, first impression',
      revenue_potential: 'high'
    },
    CONTENT_TOP: {
      priority: 'high', 
      format: 'banner',
      description: 'Above-the-fold, high engagement',
      revenue_potential: 'high'
    },
    CONTENT_MIDDLE: {
      priority: 'medium',
      format: 'native-article',
      description: 'Natural content break, high CTR',
      revenue_potential: 'medium'
    },
    SIDEBAR: {
      priority: 'medium',
      format: 'rectangle',
      description: 'Persistent visibility, desktop focus',
      revenue_potential: 'medium'
    },
    CONTENT_BOTTOM: {
      priority: 'medium',
      format: 'native-feed',
      description: 'End of content, natural placement',
      revenue_potential: 'medium'
    },
    FOOTER: {
      priority: 'low',
      format: 'banner',
      description: 'Minimal interference, passive income',
      revenue_potential: 'low'
    }
  },

  // Educational Content Focus
  AD_CONTENT_STRATEGY: {
    EDUCATIONAL_THEMES: [
      'Khan Academy Kids - Free educational games',
      'Educational Resources - Premium learning materials', 
      'STEM Learning Kits - Hands-on experiments',
      'Language Learning Apps - Interactive lessons',
      'Educational Toys - Learning through play',
      'Online Tutoring - Personalized instruction'
    ],
    
    CONTENT_GUIDELINES: [
      'All ads must be education-related',
      'Child-safe and family-friendly content only',
      'No ads that compete directly with core features',
      'Prefer ads that complement the learning experience',
      'Avoid ads during active learning activities'
    ]
  },

  // Revenue Optimization Techniques
  OPTIMIZATION_TECHNIQUES: {
    DYNAMIC_FREQUENCY: {
      description: 'Adjust ad frequency based on user engagement',
      implementation: 'Higher frequency for highly engaged users'
    },
    
    CONTEXTUAL_TARGETING: {
      description: 'Show relevant ads based on current page/activity',
      implementation: 'Math ads on homework pages, reading ads on activities'
    },
    
    TIME_BASED_OPTIMIZATION: {
      description: 'Adjust ad strategy based on time of day/week',
      implementation: 'More ads during peak usage hours'
    },
    
    SUBSCRIPTION_INCENTIVE: {
      description: 'Use ads to encourage premium subscriptions',
      implementation: 'Show "Remove ads" prompts strategically'
    }
  },

  // User Experience Considerations
  UX_GUIDELINES: {
    NATURAL_BREAKS: [
      'Between major content sections',
      'After completing activities',
      'During natural page transitions',
      'In sidebar areas that don\'t interrupt flow'
    ],
    
    AVOID_INTERRUPTIONS: [
      'During active learning/homework',
      'In the middle of form submissions',
      'During video playback',
      'On error or loading screens'
    ],
    
    RESPONSIVE_DESIGN: [
      'Mobile-first ad placement',
      'Appropriate sizing for all devices',
      'Touch-friendly ad interactions',
      'Fast loading times'
    ]
  },

  // Performance Metrics
  SUCCESS_METRICS: {
    REVENUE_METRICS: [
      'Ad revenue per user (ARPU)',
      'Click-through rate (CTR)',
      'Cost per mille (CPM)',
      'Revenue per thousand impressions (RPM)'
    ],
    
    USER_EXPERIENCE_METRICS: [
      'User retention rate',
      'Session duration',
      'Bounce rate',
      'User satisfaction scores'
    ],
    
    ENGAGEMENT_METRICS: [
      'Time spent on educational content',
      'Activity completion rates',
      'Homework submission rates',
      'Feature usage frequency'
    ]
  },

  // Implementation Status
  IMPLEMENTATION_STATUS: {
    COMPLETED: [
      '✅ Strategic ad placement system',
      '✅ Page value tier classification',
      '✅ Dynamic frequency control',
      '✅ Educational content focus',
      '✅ Production simulation mode',
      '✅ Responsive ad layouts',
      '✅ Premium user considerations'
    ],
    
    PLANNED: [
      '🔄 Real Google AdSense integration',
      '🔄 A/B testing framework',
      '🔄 Advanced analytics dashboard',
      '🔄 Contextual targeting system',
      '🔄 Time-based optimization',
      '🔄 Revenue reporting tools'
    ]
  }
};

// Export individual configurations for easy import
export const HIGH_VALUE_PAGES = AD_STRATEGY.HIGH_VALUE_PAGES;
export const MEDIUM_VALUE_PAGES = AD_STRATEGY.MEDIUM_VALUE_PAGES;
export const LOW_VALUE_PAGES = AD_STRATEGY.LOW_VALUE_PAGES;
export const AD_FREQUENCY = AD_STRATEGY.AD_FREQUENCY;
export const AD_POSITIONS = AD_STRATEGY.AD_POSITIONS;

export default AD_STRATEGY; 