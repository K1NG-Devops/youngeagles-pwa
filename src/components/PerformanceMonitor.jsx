/* eslint-env browser */
/* global PerformanceObserver, performance */
import React, { useEffect, useRef } from 'react';

const PerformanceMonitor = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const metricsRef = useRef({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    memoryUsage: 0,
    componentCount: 0,
    routeChanges: 0
  });

  const lastReportTime = useRef(0);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Monitor Core Web Vitals with optimized handling
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
        case 'paint':
          if (entry.name === 'first-contentful-paint') {
            metricsRef.current.firstContentfulPaint = entry.startTime;
          }
          break;
        case 'largest-contentful-paint':
          metricsRef.current.largestContentfulPaint = entry.startTime;
          break;
        case 'layout-shift':
          if (!entry.hadRecentInput) {
            metricsRef.current.cumulativeLayoutShift += entry.value;
          }
          break;
        case 'first-input':
          metricsRef.current.firstInputDelay = entry.processingStart - entry.startTime;
          break;
        case 'navigation':
          metricsRef.current.pageLoadTime = entry.loadEventEnd - entry.fetchStart;
          break;
        }
      });
    });
    
    observerRef.current = observer;

    // Observe relevant metrics with error handling
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input', 'navigation'] });
    } catch (e) {
      console.warn('Performance Observer not fully supported', e);
    }

    // Enhanced memory monitoring with garbage collection optimization
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memInfo = performance.memory;
        const usedMB = Math.round(memInfo.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memInfo.totalJSHeapSize / 1048576);
        const limitMB = Math.round(memInfo.jsHeapSizeLimit / 1048576);
        
        metricsRef.current.memoryUsage = memInfo.usedJSHeapSize;
        
        // Enhanced memory logging with warnings
        if (usedMB > 80) {
          console.warn('⚠️ HIGH MEMORY USAGE:', {
            used: usedMB + ' MB',
            total: totalMB + ' MB',
            limit: limitMB + ' MB',
            percentage: Math.round((usedMB / limitMB) * 100) + '%'
          });
          
          // Suggest garbage collection if memory is very high
          if (usedMB > 100 && window.gc) {
            console.log('🗑️ Suggesting garbage collection...');
            window.gc();
          }
        } else {
          console.log('📊 Memory Status:', {
            used: usedMB + ' MB',
            total: totalMB + ' MB',
            limit: limitMB + ' MB'
          });
        }
      }
    };

    // Component counting for debugging
    const countComponents = () => {
      const components = document.querySelectorAll('[data-reactroot] *');
      metricsRef.current.componentCount = components.length;
      
      if (components.length > 1000) {
        console.warn('⚠️ HIGH COMPONENT COUNT:', components.length);
      }
    };

    // Enhanced performance metrics reporting
    const reportMetrics = () => {
      const currentTime = Date.now();
      
      // Throttle reporting to avoid spam
      if (currentTime - lastReportTime.current < 5000) {
        return;
      }
      
      lastReportTime.current = currentTime;
      
      const metrics = {
        ...metricsRef.current,
        timestamp: currentTime,
        userAgent: navigator.userAgent,
        viewportSize: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connectionType: navigator.connection?.effectiveType || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
      };

      console.group('📊 Performance Metrics Report');
      console.log('⏱️  Page Load Time:', metrics.pageLoadTime + 'ms');
      console.log('🎨 First Contentful Paint:', metrics.firstContentfulPaint + 'ms');
      console.log('🖼️  Largest Contentful Paint:', metrics.largestContentfulPaint + 'ms');
      console.log('📐 Cumulative Layout Shift:', metrics.cumulativeLayoutShift.toFixed(4));
      console.log('⚡ First Input Delay:', metrics.firstInputDelay + 'ms');
      console.log('💾 Memory Usage:', Math.round(metrics.memoryUsage / 1048576) + ' MB');
      console.log('🔗 Connection Type:', metrics.connectionType);
      console.log('📱 Viewport:', `${metrics.viewportSize.width}x${metrics.viewportSize.height}`);
      console.log('🧠 Device Memory:', metrics.deviceMemory + ' GB');
      console.log('⚙️  CPU Cores:', metrics.hardwareConcurrency);
      console.log('🧩 Component Count:', metrics.componentCount);
      console.groupEnd();

      // Enhanced performance issue detection
      const issues = [];
      const warnings = [];
      
      if (metrics.firstContentfulPaint > 3000) issues.push('Very Slow First Contentful Paint');
      else if (metrics.firstContentfulPaint > 2000) warnings.push('Slow First Contentful Paint');
      
      if (metrics.largestContentfulPaint > 4000) issues.push('Very Slow Largest Contentful Paint');
      else if (metrics.largestContentfulPaint > 2500) warnings.push('Slow Largest Contentful Paint');
      
      if (metrics.cumulativeLayoutShift > 0.25) issues.push('Very High Layout Shift');
      else if (metrics.cumulativeLayoutShift > 0.1) warnings.push('High Layout Shift');
      
      if (metrics.firstInputDelay > 300) issues.push('Very High Input Delay');
      else if (metrics.firstInputDelay > 100) warnings.push('High Input Delay');
      
      if (metrics.memoryUsage > 100 * 1048576) issues.push('Very High Memory Usage');
      else if (metrics.memoryUsage > 50 * 1048576) warnings.push('High Memory Usage');
      
      if (metrics.componentCount > 1500) issues.push('Too Many Components');
      else if (metrics.componentCount > 1000) warnings.push('High Component Count');

      if (issues.length > 0) {
        console.error('❌ Critical Performance Issues:', issues);
      }
      if (warnings.length > 0) {
        console.warn('⚠️ Performance Warnings:', warnings);
      }
      
      if (issues.length === 0 && warnings.length === 0) {
        console.log('✅ Performance looks good!');
      }
    };

    // Initial monitoring setup
    monitorMemory();
    countComponents();

    // Optimized intervals - less frequent monitoring
    const memoryInterval = setInterval(() => {
      monitorMemory();
      countComponents();
    }, 45000); // Every 45 seconds instead of 30

    // Delayed initial report
    const reportTimeout = setTimeout(reportMetrics, 5000);

    // Periodic reporting
    const reportInterval = setInterval(reportMetrics, 60000); // Every minute

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearInterval(memoryInterval);
      clearInterval(reportInterval);
      clearTimeout(reportTimeout);
    };
  }, [enabled]);

  // Enhanced route change monitoring with performance tracking
  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    metricsRef.current.routeChanges++;
    
    // Track route change performance
    const routeChangeObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log('Route Change Performance:', entry.name, entry.duration + 'ms');
        }
      });
    });
    
    try {
      routeChangeObserver.observe({ entryTypes: ['measure'] });
    } catch (e) {
      // Fallback for unsupported browsers
    }
    
    return () => {
      const endTime = performance.now();
      const routeChangeTime = endTime - startTime;
      
      if (routeChangeTime > 1000) {
        console.error('❌ Very slow route change:', routeChangeTime + 'ms');
      } else if (routeChangeTime > 500) {
        console.warn('⚠️ Slow route change:', routeChangeTime + 'ms');
      } else {
        console.log('✅ Route change performance:', routeChangeTime + 'ms');
      }
      
      routeChangeObserver.disconnect();
    };
  }, [enabled, window.location.pathname]);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
