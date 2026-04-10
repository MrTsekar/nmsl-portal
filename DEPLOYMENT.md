# NMSL Portal - Deployment Guide

This guide covers deploying the NMSL Portal frontend to **Render** (initial deployment) and migrating to **Azure** (future production).

---

## Table of Contents
1. [Environment Variables Setup](#environment-variables-setup)
2. [Deploying to Render](#deploying-to-render)
3. [Migrating to Azure](#migrating-to-azure)
4. [Environment Management Best Practices](#environment-management-best-practices)

---

## Environment Variables Setup

### Quick Start
All configuration is managed through environment variables. **No code changes needed** when switching between Render and Azure!

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `https://nmsl-api.onrender.com` |
| `NEXT_PUBLIC_USE_MOCKS` | Enable/disable mock data | `false` (production) |
| `NEXT_PUBLIC_PLATFORM` | Deployment platform | `render` or `azure` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | `NMSL Portal` |
| `NEXT_PUBLIC_APP_VERSION` | App version | `1.0.0` |
| `NEXT_PUBLIC_DEFAULT_LOCATION` | Default location | `Abuja` |

---

## Deploying to Render

### Prerequisites
- GitHub/GitLab repository with your code
- Render account (free tier available)
- Backend API deployed and URL ready

### Step 1: Create New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub/GitLab repository
4. Select the `nmslportal` repository

### Step 2: Configure Service

**Basic Settings:**
```
Name:              nmsl-portal
Region:            Frankfurt (Europe) or closest to Nigeria
Branch:            main
Runtime:           Node
Build Command:     npm install && npm run build
Start Command:     npm start
```

**Instance Type:**
- Free tier for testing
- Starter ($7/month) for production

### Step 3: Set Environment Variables

In the Render dashboard, go to **"Environment"** tab and add:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-app.onrender.com
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_PLATFORM=render
NEXT_PUBLIC_APP_NAME=NMSL Portal
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEFAULT_LOCATION=Abuja
```

**Important:** Replace `your-backend-app.onrender.com` with your actual backend URL!

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Wait 5-10 minutes for first deployment
4. Access your app at: `https://nmsl-portal.onrender.com`

### Step 5: Custom Domain (Optional)

1. Go to **"Settings"** → **"Custom Domain"**
2. Add your domain (e.g., `portal.nmsl.com`)
3. Update DNS records as instructed
4. SSL certificate auto-generated

### Render Health Checks

Render automatically monitors your app. To improve reliability, add a health check:

1. Go to **"Settings"** → **"Health & Alerts"**
2. Set Health Check Path: `/`
3. Set up email alerts for downtime

---

## Migrating to Azure

When you're ready to move to Azure, follow these steps. **No code changes required!**

### Prerequisites
- Azure account
- Azure CLI installed (optional but recommended)
- Your code in GitHub/GitLab

### Option 1: Azure Static Web Apps (Recommended for Next.js)

#### Step 1: Create Static Web App

1. Log in to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** → Search for **"Static Web Apps"**
3. Click **"Create"**

#### Step 2: Configure Basics

```
Subscription:          Your subscription
Resource Group:        Create new: "nmsl-portal-rg"
Name:                  nmsl-portal
Region:                West Europe (closest to Nigeria)
Hosting Plan:          Free (or Standard for production)
```

#### Step 3: Deployment Details

```
Source:                GitHub
Organization:          Your GitHub username
Repository:            nmslportal
Branch:                main
```

#### Step 4: Build Details

```
Build Presets:         Next.js
App location:          /
Api location:          (leave empty)
Output location:       .next
```

#### Step 5: Set Environment Variables

After creation, go to your Static Web App:

1. Click **"Configuration"** → **"Application settings"**
2. Add environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=https://nmsl-api.azurewebsites.net
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_PLATFORM=azure
NEXT_PUBLIC_APP_NAME=NMSL Portal
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEFAULT_LOCATION=Abuja
```

**Important:** Replace `nmsl-api.azurewebsites.net` with your actual Azure backend URL!

#### Step 6: Deploy

1. Azure automatically deploys from GitHub
2. Every push to `main` branch triggers auto-deployment
3. Access your app at: `https://[app-name].azurestaticapps.net`

#### Step 7: Custom Domain

1. Go to **"Custom domains"**
2. Click **"Add"**
3. Enter your domain: `portal.nmsl.com`
4. Follow DNS verification steps
5. SSL certificate auto-configured

### Option 2: Azure App Service (Alternative)

If you prefer Azure App Service:

#### Step 1: Create App Service

1. Azure Portal → **"App Services"** → **"Create"**
2. Configure:
   ```
   Name:           nmsl-portal
   Publish:        Code
   Runtime:        Node 20 LTS
   OS:             Linux
   Region:         West Europe
   ```

#### Step 2: Configure GitHub Deployment

1. Go to **"Deployment Center"**
2. Source: **GitHub**
3. Select your repository and branch
4. Azure creates GitHub Action automatically

#### Step 3: Set Environment Variables

1. Go to **"Configuration"** → **"Application settings"**
2. Add same variables as Static Web Apps

#### Step 4: Configure Startup Command

Go to **"Configuration"** → **"General settings"**:
```bash
Startup Command: npm start
```

---

## Environment Management Best Practices

### 1. Never Hardcode URLs

❌ **Bad:**
```typescript
const apiUrl = "https://my-api.onrender.com";
```

✅ **Good:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
```

### 2. Use Different .env Files for Different Environments

```
.env.local              # Local development (gitignored)
.env.example            # Template for team (committed)
.env.production.local   # Production overrides (gitignored)
```

### 3. Platform-Specific Configuration

Your code already handles this automatically:

```typescript
// src/lib/api/client.ts
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
export const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
```

### 4. Backend URL Updates

When you deploy your backend, simply update the environment variable:

**Render:**
1. Dashboard → Your service → Environment
2. Update `NEXT_PUBLIC_API_BASE_URL`
3. Save (auto-redeploys)

**Azure:**
1. Portal → Your app → Configuration → Application settings
2. Update `NEXT_PUBLIC_API_BASE_URL`
3. Save (auto-restarts)

### 5. Migration Checklist

When moving from Render to Azure:

- [ ] Deploy backend to Azure
- [ ] Note new backend URL
- [ ] Deploy frontend to Azure
- [ ] Update `NEXT_PUBLIC_API_BASE_URL` in Azure settings
- [ ] Update `NEXT_PUBLIC_PLATFORM` to `azure`
- [ ] Test all functionality
- [ ] Update DNS to point to Azure
- [ ] Keep Render deployment running for 24-48 hours (safety)
- [ ] Delete Render service

---

## Testing Before Migration

### Test Environment Variables Locally

1. Create `.env.production.local`:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://nmsl-api.azurewebsites.net
   NEXT_PUBLIC_USE_MOCKS=false
   NEXT_PUBLIC_PLATFORM=azure
   ```

2. Build and run:
   ```bash
   npm run build
   npm start
   ```

3. Verify it connects to Azure backend

---

## Troubleshooting

### Issue: Environment variables not updating

**Solution:** Rebuild and redeploy
```bash
# Render: Trigger manual deploy
# Azure: Settings → Configuration → Save (triggers restart)
```

### Issue: CORS errors after migration

**Solution:** Update backend CORS settings to allow new Azure domain
```typescript
// Backend: Add Azure URL to CORS whitelist
corsOptions: {
  origin: [
    'https://nmsl-portal.azurestaticapps.net',
    'https://portal.nmsl.com'
  ]
}
```

### Issue: 404 on Azure Static Web Apps

**Solution:** Add staticwebapp.config.json:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*", "/_next/*", "/images/*"]
  }
}
```

---

## Cost Estimates

### Render
- **Free Tier:** $0/month (sleeps after inactivity)
- **Starter:** $7/month (always on, 512MB RAM)
- **Standard:** $25/month (1GB RAM)

### Azure
- **Static Web Apps Free:** $0/month (100GB bandwidth)
- **Static Web Apps Standard:** $9/month (unlimited bandwidth)
- **App Service Basic:** ~$13/month

---

## Support & Resources

**Render:**
- Docs: https://render.com/docs
- Support: https://render.com/support

**Azure:**
- Docs: https://docs.microsoft.com/azure/static-web-apps/
- Support: Azure Portal → Support

**Next.js Deployment:**
- https://nextjs.org/docs/deployment

---

## Summary

✅ **The beauty of this setup:**

1. **No code changes** when switching platforms
2. **One variable change** updates API URL
3. **Same codebase** works everywhere
4. **Easy rollback** if needed
5. **Zero downtime migration** possible

Just update environment variables in your hosting platform's UI, and you're done! 🚀
