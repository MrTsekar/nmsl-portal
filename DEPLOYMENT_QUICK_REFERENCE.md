# 🚀 NMSL Portal - Quick Deployment Reference

## Environment Variables (Same for All Platforms)

```env
# Backend URL - CHANGE THIS FOR EACH ENVIRONMENT
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com

# Mock mode - false for production
NEXT_PUBLIC_USE_MOCKS=false

# Platform identifier
NEXT_PUBLIC_PLATFORM=render  # or azure, local, vercel
```

---

## 📦 Render Deployment (5 minutes)

### Step 1: Create Service
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. New → Web Service
3. Connect GitHub repo

### Step 2: Build Settings
```
Build Command:  npm install && npm run build
Start Command:  npm start
```

### Step 3: Environment Variables
```
NEXT_PUBLIC_API_BASE_URL=https://YOUR-BACKEND.onrender.com
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_PLATFORM=render
```

### Step 4: Deploy
Click "Create Web Service" ✅

**Live at:** `https://nmsl-portal.onrender.com`

**Cost:** Free tier or $7/month

---

## ☁️ Azure Deployment (10 minutes)

### Step 1: Create Static Web App
1. Azure Portal → Static Web Apps → Create
2. Connect GitHub repo

### Step 2: Build Configuration
```
App location:      /
Output location:   .next
Build preset:      Next.js
```

### Step 3: Environment Variables
Configuration → Application settings:
```
NEXT_PUBLIC_API_BASE_URL=https://YOUR-API.azurewebsites.net
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_PLATFORM=azure
```

### Step 4: Deploy
Auto-deploys from GitHub ✅

**Live at:** `https://nmsl-portal.azurestaticapps.net`

**Cost:** Free tier or $9/month

---

## 🔄 Migration: Render → Azure (Zero Downtime)

### Pre-Migration Checklist
- [ ] Backend deployed to Azure
- [ ] Frontend built successfully locally
- [ ] All environment variables documented

### Migration Steps

**Day 1: Parallel Deployment**
1. Deploy frontend to Azure (keep Render running)
2. Update backend URL in Azure env vars
3. Test Azure deployment thoroughly
4. Both platforms running ✅

**Day 2: DNS Switch**
1. Update DNS CNAME to Azure URL
2. Monitor both platforms
3. Azure serving production ✅

**Day 3-4: Monitoring**
1. Verify all features working
2. Check analytics/logs
3. No issues? Proceed ✅

**Day 5: Cleanup**
1. Delete Render service
2. Migration complete! 🎉

### Critical: What to Update

**Only One Thing Changes:**
```env
# Old (Render)
NEXT_PUBLIC_API_BASE_URL=https://api.onrender.com

# New (Azure)
NEXT_PUBLIC_API_BASE_URL=https://api.azurewebsites.net
```

**Everything else stays the same!** 🎯

---

## 🔧 Troubleshooting

### Issue: Environment variables not updating
**Solution:** Redeploy or restart service
- Render: Manual deploy button
- Azure: Configuration → Save (auto-restarts)

### Issue: 404 errors
**Solution:** Check build output location
- Should be: `.next`
- Not: `out` or `dist`

### Issue: API not connecting
**Check:**
1. Is `NEXT_PUBLIC_API_BASE_URL` correct?
2. Does backend have CORS enabled for frontend domain?
3. Is backend actually deployed and running?

### Issue: Slow load times
**Solutions:**
- Render: Upgrade from free tier ($7/mo prevents sleep)
- Azure: Enable CDN
- Both: Check if using mocks (set `NEXT_PUBLIC_USE_MOCKS=false`)

---

## 📊 Platform Comparison

| Feature | Render Free | Render Starter | Azure Free | Azure Standard |
|---------|-------------|----------------|------------|----------------|
| **Price** | $0 | $7/mo | $0 | $9/mo |
| **Sleep** | Yes (inactive) | No | No | No |
| **Bandwidth** | 100GB | 100GB | 100GB | Unlimited |
| **Build Time** | 500 min/mo | Unlimited | Unlimited | Unlimited |
| **SSL** | ✅ Free | ✅ Free | ✅ Free | ✅ Free |
| **Custom Domain** | ✅ | ✅ | ✅ | ✅ |
| **Auto Deploy** | ✅ | ✅ | ✅ | ✅ |
| **Region** | Global | Global | Global | Global |

**Recommendation:**
- **Development/Testing:** Render Free
- **Small Production:** Render Starter or Azure Free
- **Enterprise:** Azure Standard

---

## 🎯 Quick Commands

### Local Development
```bash
npm install              # Install dependencies
cp .env.example .env.local   # Setup environment
npm run dev              # Start dev server (port 3000)
```

### Pre-Deployment Checks
```bash
npm run build            # Test production build
npm start                # Test production server
npm run lint             # Check for errors
```

### Environment Switch
```bash
# Test with production API locally
echo "NEXT_PUBLIC_API_BASE_URL=https://api.onrender.com" > .env.production.local
echo "NEXT_PUBLIC_USE_MOCKS=false" >> .env.production.local
npm run build && npm start
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_USE_MOCKS=false`
- [ ] Update backend CORS to allow frontend domain
- [ ] Enable HTTPS only (auto-enabled on Render/Azure)
- [ ] Set strong JWT secret in backend
- [ ] Review all environment variables
- [ ] Test authentication flow
- [ ] Verify appointment locking works
- [ ] Check audit logs recording properly

---

## 📞 Support Resources

**Render:**
- Docs: https://render.com/docs
- Status: https://status.render.com
- Support: dashboard → Support

**Azure:**
- Docs: https://docs.microsoft.com/azure
- Status: https://status.azure.com
- Support: Portal → Support

**Next.js:**
- Docs: https://nextjs.org/docs
- Deployment: https://nextjs.org/docs/deployment

---

## 💡 Pro Tips

1. **Always test locally first** with production settings
2. **Keep Render during migration** as backup (costs $7/mo for peace of mind)
3. **Monitor in parallel** for 48 hours before switching
4. **Document backend URLs** in a secure location
5. **Set up health checks** on both platforms
6. **Enable error tracking** (Sentry) for production

---

**✅ Remember: The entire deployment difference is ONE environment variable!**

```env
# This is all you need to change when migrating:
NEXT_PUBLIC_API_BASE_URL=<new-url-here>
```

🎉 **Happy Deploying!**
