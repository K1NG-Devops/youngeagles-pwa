import React from 'react';

/**
 * PerfectSpacing - Utility components for consistent spacing throughout the app
 * Provides standardized spacing, gaps, and layout containers
 */

// Main spacing wrapper component
export const SpacingContainer = ({ 
  children, 
  spacing = 'md', 
  className = '',
  vertical = true,
  horizontal = true 
}) => {
  const getSpacingClass = () => {
    const spacingMap = {
      xs: 'spacing-xs',
      sm: 'spacing-sm', 
      md: 'spacing-md',
      lg: 'spacing-lg',
      xl: 'spacing-xl'
    };
    
    const classes = [];
    
    if (vertical) {
      classes.push(`py-${spacingMap[spacing] || 'spacing-md'}`);
    }
    
    if (horizontal) {
      classes.push(`px-${spacingMap[spacing] || 'spacing-md'}`);
    }
    
    return classes.join(' ');
  };

  return (
    <div className={`${getSpacingClass()} ${className}`}>
      {children}
    </div>
  );
};

// Perfect grid component with consistent gaps
export const PerfectGrid = ({ 
  children, 
  columns = 'auto-fit', 
  gap = 'md',
  minWidth = '280px',
  className = '' 
}) => {
  const gapMap = {
    xs: 'gap-1',
    sm: 'gap-2', 
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const gridColumns = typeof columns === 'number' 
    ? `repeat(${columns}, 1fr)`
    : `repeat(auto-fit, minmax(${minWidth}, 1fr))`;

  return (
    <div 
      className={`grid ${gapMap[gap]} ${className}`}
      style={{ gridTemplateColumns: gridColumns }}
    >
      {children}
    </div>
  );
};

// Perfect flex container with consistent spacing
export const PerfectFlex = ({ 
  children, 
  direction = 'row', 
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  className = '' 
}) => {
  const gapMap = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4', 
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center', 
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const flexDirection = direction === 'column' ? 'flex-col' : 'flex-row';
  const flexWrap = wrap ? 'flex-wrap' : 'flex-nowrap';

  return (
    <div className={`
      flex ${flexDirection} ${flexWrap}
      ${gapMap[gap]} 
      ${alignMap[align]} 
      ${justifyMap[justify]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Perfect card component with consistent spacing
export const PerfectCard = ({ 
  children, 
  padding = 'md',
  spacing = 'md', 
  shadow = true,
  hover = true,
  className = '' 
}) => {
  const paddingMap = {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4', 
    lg: 'p-6',
    xl: 'p-8'
  };

  const spacingMap = {
    xs: 'mb-2',
    sm: 'mb-3',
    md: 'mb-4',
    lg: 'mb-6', 
    xl: 'mb-8'
  };

  return (
    <div className={`
      ${paddingMap[padding]}
      ${spacingMap[spacing]}
      rounded-xl
      ${shadow ? 'shadow-lg' : ''}
      ${hover ? 'card-enhanced' : ''}
      transition-all duration-200
      ${className}
    `}>
      {children}
    </div>
  );
};

// Perfect section with proper spacing
export const PerfectSection = ({ 
  children, 
  spacing = 'lg',
  className = '' 
}) => {
  const spacingMap = {
    sm: 'section-spacing-compact',
    md: 'section-spacing',
    lg: 'section-spacing',
    xl: 'py-24'
  };

  return (
    <section className={`${spacingMap[spacing]} ${className}`}>
      {children}
    </section>
  );
};

// Perfect list with consistent item spacing
export const PerfectList = ({ 
  children, 
  spacing = 'md',
  className = '' 
}) => {
  const spacingMap = {
    xs: 'list-spacing-tight',
    sm: 'list-spacing-tight', 
    md: 'list-spacing',
    lg: 'list-spacing-loose',
    xl: 'list-spacing-loose'
  };

  return (
    <div className={`${spacingMap[spacing]} ${className}`}>
      {children}
    </div>
  );
};

export default {
  SpacingContainer,
  PerfectGrid,
  PerfectFlex, 
  PerfectCard,
  PerfectSection,
  PerfectList
};