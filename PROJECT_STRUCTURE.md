# 📁 YoungEagles PWA - Project Structure

## 🏗️ **Organized Project Layout**

This project has been organized with a clean structure separating core application code from documentation, testing, and development artifacts.

## 📂 **Directory Structure**

```
YoungEagles_PWA/
├── src/                          # Core application source code
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── services/                # API and utility services
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom React hooks
│   └── utils/                   # Utility functions
├── public/                      # Static assets
├── scripts/                     # Build and deployment scripts
├── docs/                        # Documentation and development files
│   ├── documentation/           # All markdown documentation
│   ├── lighthouse/              # Performance audit reports
│   ├── reports/                 # Build logs and reports
│   ├── setup-scripts/           # Setup and utility scripts
│   └── testing/                 # Test files and scripts
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── index.html                  # Main HTML entry point
└── .gitignore                  # Git ignore rules (includes docs/)
```

## 📋 **Documentation Categories**

### **docs/documentation/**
- API documentation
- Implementation guides
- Feature specifications
- Deployment guides
- Performance optimization docs

### **docs/lighthouse/**
- Lighthouse performance reports
- Performance audit history
- Optimization tracking

### **docs/reports/**
- Build logs
- Development logs
- Error reports
- Binary artifacts

### **docs/setup-scripts/**
- Image optimization scripts
- Build helpers
- Development utilities

### **docs/testing/**
- Test scripts (currently none, but ready for future tests)

## 🚫 **What's Excluded from Git**

The `docs/` folder is added to `.gitignore` to keep the repository clean:
- Documentation files
- Test artifacts
- Build reports
- Development logs
- Binary files

## 🎯 **Core Application Files**

### **Key Components**
- Native notification system
- Push notification service
- Progressive Web App features
- Mobile-responsive design
- Advertisement integration
- Payment processing

### **Key Services**
- `nativeNotificationService.js` - Device native notifications
- `pushNotificationService.js` - Background push notifications
- `apiService.js` - Backend API communication
- `authService.js` - Authentication management

## 🔧 **Development Workflow**

1. **Core Code**: Work in `src/` directory
2. **Documentation**: Auto-moved to `docs/` (gitignored)
3. **Builds**: Use standard npm scripts
4. **Deployment**: Vercel auto-deploys from main branch

## 🚀 **Production Ready**

✅ Clean project structure  
✅ Optimized build pipeline  
✅ PWA compliance  
✅ Native notifications  
✅ Push notifications  
✅ Mobile responsiveness  
✅ Performance optimized  

---

**Last Updated**: January 2025 - Project restructuring complete 