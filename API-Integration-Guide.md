# Dashboard API Integration Guide

## Overview
This document outlines the API integration patterns used in the Dashboard component and provides guidelines for developers working with the data layer.

## API Service Structure

### Base Service Configuration
\`\`\`javascript
// apiService.js structure
const apiService = {
  children: {
    getAll: () => Promise,
    getByParent: (parentId) => Promise,
    create: (childData) => Promise,
    update: (childId, data) => Promise,
    delete: (childId) => Promise
  },
  classes: {
    getAll: () => Promise,
    getByTeacher: (teacherId) => Promise,
    create: (classData) => Promise
  },
  stats: {
    getDashboard: (userId, role) => Promise,
    getDetailed: (userId) => Promise
  }
};
\`\`\`

### Error Handling Patterns
\`\`\`javascript
// Recommended error handling
const fetchDashboardData = async () => {
  try {
    setIsLoading(true);
    
    const response = await apiService.children.getByParent(user.id);
    
    if (response.success) {
      setChildren(response.data.children || []);
    } else {
      throw new Error(response.message || 'Failed to fetch data');
    }
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    
    // Set fallback data
    setStats(DEFAULT_STATS);
    
    // Optional: Show user-friendly error message
    showNotification('Unable to load latest data. Showing cached information.', 'warning');
  } finally {
    setIsLoading(false);
  }
};
\`\`\`

### Data Transformation
\`\`\`javascript
// Transform API response to component state
const transformStatsData = (apiResponse) => {
  return {
    children: apiResponse.children?.length || 0,
    classes: apiResponse.classes?.length || 0,
    homework: apiResponse.assignments?.filter(a => a.type === 'homework').length || 0,
    pending: apiResponse.assignments?.filter(a => a.status === 'pending').length || 0,
    submitted: apiResponse.assignments?.filter(a => a.status === 'submitted').length || 0,
    completionRate: calculateCompletionRate(apiResponse.assignments) || 0
  };
};
\`\`\`

## Caching Strategy

### Implementation Example
\`\`\`javascript
// Simple cache implementation
const useApiCache = (key, fetcher, ttl = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const cachedData = localStorage.getItem(key);
    const cacheTime = localStorage.getItem(`${key}_timestamp`);
    
    if (cachedData && cacheTime && Date.now() - parseInt(cacheTime) < ttl) {
      setData(JSON.parse(cachedData));
      setIsLoading(false);
      return;
    }
    
    fetcher()
      .then(response => {
        setData(response);
        localStorage.setItem(key, JSON.stringify(response));
        localStorage.setItem(`${key}_timestamp`, Date.now().toString());
      })
      .finally(() => setIsLoading(false));
  }, [key, fetcher, ttl]);
  
  return { data, isLoading };
};
\`\`\`

## Real-time Updates

### WebSocket Integration
\`\`\`javascript
// WebSocket connection for real-time updates
const useRealtimeUpdates = (userId) => {
  useEffect(() => {
    const ws = new WebSocket(`wss://api.yourapp.com/ws/${userId}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      switch (update.type) {
        case 'STATS_UPDATE':
          setStats(prevStats => ({ ...prevStats, ...update.data }));
          break;
        case 'NEW_ASSIGNMENT':
          // Handle new assignment notification
          break;
        case 'CHILD_PROGRESS':
          // Handle progress update
          break;
      }
    };
    
    return () => ws.close();
  }, [userId]);
};
