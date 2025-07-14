/* eslint-env browser */
/* global performance, EventTarget */
// Memory optimization utilities for the YoungEagles PWA
// Addresses the 83MB memory usage issue

class MemoryOptimizer {
  constructor() {
    this.cleanupTasks = [];
    this.memoryThreshold = 100 * 1024 * 1024; // 100MB
    this.optimizationInterval = null;
    this.imageCache = new Map();
    this.maxCacheSize = 50; // Maximum cached images
    this.initialized = false;
  }

  // Initialize memory optimization
  init() {
    if (this.initialized) return; // Prevent double initialization
    
    this.startMemoryMonitoring();
    this.setupImageOptimization();
    this.setupEventListenerCleanup();
    this.setupComponentCleanup();
    this.initialized = true;
  }

  // Start continuous memory monitoring
  startMemoryMonitoring() {
    if (this.optimizationInterval) return;
    
    this.optimizationInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  // Check current memory usage and trigger cleanup if needed
  checkMemoryUsage() {
    if (!('memory' in performance)) return;
    
    const memInfo = performance.memory;
    const usedMemory = memInfo.usedJSHeapSize;
    const percentUsed = (usedMemory / memInfo.jsHeapSizeLimit) * 100;
    
    console.log('🧠 Memory Check:', {
      used: `${Math.round(usedMemory / 1024 / 1024)}MB`,
      total: `${Math.round(memInfo.totalJSHeapSize / 1024 / 1024)}MB`,
      limit: `${Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)}MB`,
      percentage: `${percentUsed.toFixed(1)}%`
    });

    // Trigger cleanup if memory usage is high
    if (usedMemory > this.memoryThreshold || percentUsed > 85) {
      console.warn('⚠️ High memory usage detected, triggering cleanup...');
      this.performCleanup();
    }
  }

  // Perform comprehensive memory cleanup
  performCleanup() {
    console.log('🧹 Starting memory cleanup...');
    
    // Clean up image cache
    this.cleanupImageCache();
    
    // Clean up DOM elements
    this.cleanupDOMElements();
    
    // Clean up event listeners
    this.cleanupEventListeners();
    
    // Clean up React component references
    this.cleanupReactComponents();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
      console.log('🗑️ Forced garbage collection');
    }
    
    // Run registered cleanup tasks
    this.runCleanupTasks();
    
    console.log('✅ Memory cleanup completed');
  }

  // Setup image optimization to reduce memory usage
  setupImageOptimization() {
    // Intercept image loading
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(this, tagName);
      
      if (tagName.toLowerCase() === 'img') {
        // Add loading='lazy' by default
        element.loading = 'lazy';
        
        // Optimize image on load
        element.addEventListener('load', () => {
          memoryOptimizer.optimizeImage(element);
        });
      }
      
      return element;
    };
  }

  // Optimize individual image
  optimizeImage(imgElement) {
    if (!imgElement || !imgElement.src) return;
    
    const src = imgElement.src;
    
    // Check if image is already cached
    if (this.imageCache.has(src)) {
      return;
    }
    
    // Cache the image with size limits
    if (this.imageCache.size >= this.maxCacheSize) {
      // Remove oldest cached image
      const firstKey = this.imageCache.keys().next().value;
      this.imageCache.delete(firstKey);
    }
    
    this.imageCache.set(src, {
      timestamp: Date.now(),
      size: imgElement.naturalWidth * imgElement.naturalHeight
    });
    
    // Compress image if it's too large
    if (imgElement.naturalWidth > 1920 || imgElement.naturalHeight > 1080) {
      this.compressImage(imgElement);
    }
  }

  // Compress large images
  compressImage(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const maxWidth = 1920;
    const maxHeight = 1080;
    
    let { width, height } = imgElement;
    
    // Calculate new dimensions
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw compressed image
    ctx.drawImage(imgElement, 0, 0, width, height);
    
    // Replace original with compressed version
    imgElement.src = canvas.toDataURL('image/jpeg', 0.8);
  }

  // Clean up image cache
  cleanupImageCache() {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    for (const [src, info] of this.imageCache.entries()) {
      if (now - info.timestamp > maxAge) {
        this.imageCache.delete(src);
      }
    }
    
    console.log(`🖼️ Image cache cleaned, ${this.imageCache.size} images remaining`);
  }

  // Clean up DOM elements
  cleanupDOMElements() {
    // Remove hidden elements
    const hiddenElements = document.querySelectorAll('[style*="display: none"]');
    hiddenElements.forEach(el => {
      if (el.parentNode && !el.hasAttribute('data-keep')) {
        el.remove();
      }
    });
    
    // Clean up unused stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(link => {
      if (link.sheet && link.sheet.cssRules.length === 0) {
        link.remove();
      }
    });
    
    console.log('🧹 DOM elements cleaned up');
  }

  // Setup event listener cleanup
  setupEventListenerCleanup() {
    // Track event listeners for cleanup
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (!this._eventListeners) this._eventListeners = [];
      this._eventListeners.push({ type, listener, options });
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    EventTarget.prototype.removeEventListener = function(type, listener, options) {
      if (this._eventListeners) {
        this._eventListeners = this._eventListeners.filter(
          l => !(l.type === type && l.listener === listener)
        );
      }
      return originalRemoveEventListener.call(this, type, listener, options);
    };
  }

  // Clean up event listeners
  cleanupEventListeners() {
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      if (element._eventListeners) {
        element._eventListeners.forEach(({ type, listener, options }) => {
          element.removeEventListener(type, listener, options);
        });
        element._eventListeners = [];
      }
    });
    
    console.log('🎯 Event listeners cleaned up');
  }

  // Setup React component cleanup
  setupComponentCleanup() {
    // Override React's unmount to ensure cleanup
    if (window.React && window.React.Component) {
      const originalComponentWillUnmount = window.React.Component.prototype.componentWillUnmount;
      
      window.React.Component.prototype.componentWillUnmount = function() {
        // Clean up component references
        this.props = null;
        this.state = null;
        this.refs = null;
        
        if (originalComponentWillUnmount) {
          originalComponentWillUnmount.call(this);
        }
      };
    }
  }

  // Clean up React components
  cleanupReactComponents() {
    // Clear React fiber references
    const reactRoots = document.querySelectorAll('[data-reactroot]');
    reactRoots.forEach(root => {
      if (root._reactInternalFiber) {
        root._reactInternalFiber = null;
      }
      if (root._reactInternalInstance) {
        root._reactInternalInstance = null;
      }
    });
    
    console.log('⚛️ React components cleaned up');
  }

  // Register cleanup task
  registerCleanupTask(task) {
    this.cleanupTasks.push(task);
  }

  // Run all registered cleanup tasks
  runCleanupTasks() {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });
    
    console.log(`🧹 Ran ${this.cleanupTasks.length} cleanup tasks`);
  }

  // Get memory statistics
  getMemoryStats() {
    if (!('memory' in performance)) {
      return { supported: false };
    }
    
    const memInfo = performance.memory;
    return {
      supported: true,
      used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024),
      percentage: Math.round((memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100),
      imageCacheSize: this.imageCache.size
    };
  }

  // Stop memory monitoring
  stop() {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
    
    this.imageCache.clear();
    this.cleanupTasks = [];
  }
}

// Create global instance
const memoryOptimizer = new MemoryOptimizer();

// Auto-initialize
if (typeof window !== 'undefined') {
  memoryOptimizer.init();
}

export default memoryOptimizer;
