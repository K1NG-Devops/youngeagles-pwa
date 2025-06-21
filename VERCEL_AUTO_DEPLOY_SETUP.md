# Vercel Auto-Deployment Setup Guide

## ✅ **Completed Automatically**

The following has been set up and deployed:

1. **Enhanced `vercel.json`** with auto-deployment configuration
2. **GitHub Actions workflow** for automated builds
3. **Project linked** to Vercel (Project ID: `prj_m6XZikJAryf2hxfNGSz4HzUbepJ9`)
4. **Security headers** and service worker caching configured
5. **Environment variables** configured for production deployment

## 🔧 **Manual Steps Required**

### **Step 1: Connect GitHub Repository**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project: `young-eagles-pwa`
3. Go to **Settings** → **Git**
4. Click **Connect Git Repository**
5. Select `K1NG-Devops/youngeagles-pwa`
6. Ensure **Production Branch** is set to `main`

### **Step 2: Environment Variables** ✅ **COMPLETED**

Environment variables have been automatically configured via CLI:

```env
✅ VITE_API_BASE_URL=https://youngeagles-api-server.up.railway.app/api (Production)
✅ VITE_API_LOCAL_URL=http://localhost:3001/api (Development)
✅ VITE_FORCE_LOCAL_API=false (Production)
✅ VITE_MAIN_WEBSITE_URL=https://youngeagles.org.za (Production)
```

**Additional variables can be added via CLI:**
```bash
npx vercel env add VARIABLE_NAME production
npx vercel env add VARIABLE_NAME development
```

### **Step 3: Configure GitHub Secrets (Optional - for GitHub Actions)**

If you want to use GitHub Actions instead of Vercel Git integration:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add these secrets:

```
VERCEL_TOKEN=<your_vercel_token>
VERCEL_ORG_ID=team_giHKj8I9KO4Lt858w2ADYKb6
VERCEL_PROJECT_ID=prj_m6XZikJAryf2hxfNGSz4HzUbepJ9
```

**To get VERCEL_TOKEN:**
- Go to Vercel Dashboard → Settings → Tokens
- Create new token with appropriate permissions

## 🚀 **Auto-Deployment Configuration**

### **Current Setup:**

- **Framework**: Vite (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`
- **Auto-Alias**: Enabled
- **Job Cancellation**: Enabled

### **Deployment Triggers:**

✅ **Push to `main` branch** → Automatic deployment
✅ **Pull Request** → Preview deployment
✅ **Manual deployment** → `npx vercel --prod`

## 🌐 **Live URLs After Setup**

- **Primary**: `https://youngeagles-app.vercel.app`
- **Custom Domain**: `https://app.youngeagles.org.za`
- **Preview**: Auto-generated for PRs

## 🔍 **Verification Steps**

After completing manual steps:

1. **Test Auto-Deploy**:
   ```bash
   # Make a small change and commit
   echo "# Auto-deploy test" >> README.md
   git add README.md
   git commit -m "Test: Auto-deployment verification"
   git push origin main
   ```

2. **Check Deployment**:
   - Go to Vercel Dashboard → Deployments
   - Should see new deployment triggered automatically
   - Build time should be ~10-15 seconds

3. **Verify Live Site**:
   - Visit `https://youngeagles-app.vercel.app`
   - Check console for no errors
   - Test PWA functionality

## 📊 **Current Status**

| Component | Status | Notes |
|-----------|--------|-------|
| Local Config | ✅ Complete | vercel.json configured |
| GitHub Actions | ✅ Complete | Workflow file created |
| Vercel Project | ✅ Linked | Project ID configured |
| Git Connection | ⚠️ Manual | Needs dashboard setup |
| Environment Vars | ✅ Complete | Configured via CLI |
| Auto-Deploy | ⚠️ Pending | After manual steps |

## 🎯 **Expected Behavior After Setup**

Every commit to `main` branch will:
1. Trigger Vercel build automatically
2. Run `npm ci` and `npm run build`
3. Deploy to production URLs
4. Update live site in ~15 seconds
5. Send deployment notifications

---

**Next Action**: Complete the manual steps in Vercel Dashboard to enable full auto-deployment. 