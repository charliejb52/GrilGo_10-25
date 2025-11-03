# Production Deployment Guide

Complete guide to deploy the Shift Scheduler application for production use.

## 📋 Prerequisites

- GitHub repository with your code
- Supabase project created and migrations run
- OpenAI API key with credits
- Vercel account (free)
- Railway account (free tier available)

---

## 🚀 Part 1: Deploy Backend to Railway

### Step 1: Prepare Repository

```bash
# Make sure your code is committed and pushed to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. **Important:** Select the `backend` folder as the root directory

### Step 3: Configure Build Settings

Railway will auto-detect, but verify:

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `backend`

### Step 4: Add Environment Variables

In Railway dashboard → Variables → Add the following:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
NODE_ENV=production
DEFAULT_TIMEZONE=America/New_York
PORT=3001
```

### Step 5: Deploy

Railway will auto-deploy. Wait for it to complete and note your backend URL:

```
https://your-app.up.railway.app
```

✅ **Backend deployed!** Test it: `https://your-app.up.railway.app/health`

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. **Important:** Set Root Directory to `frontend`

### Step 2: Configure Build Settings

Vercel auto-detects Vite, but verify:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Root Directory:** `frontend`

### Step 3: Add Environment Variables

In Project Settings → Environment Variables → Add:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**For Production:**

- Environment: ✅ Production, ✅ Preview, ✅ Development
- Click "Save"

### Step 4: Update Vite Config for Backend URL

Edit `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

Add to Vercel environment variables:

```env
VITE_API_URL=https://your-backend.up.railway.app
```

### Step 5: Deploy

Click "Deploy" - Vercel will build and deploy automatically.

✅ **Frontend deployed!** You'll get a URL like: `https://your-app.vercel.app`

---

## 🔧 Part 3: Configure CORS

### Update Backend CORS Settings

Edit `backend/src/index.ts`:

```typescript
import cors from "cors";

// Replace the current cors() setup with:
app.use(
  cors({
    origin: ["http://localhost:3000", "https://your-frontend.vercel.app"],
    credentials: true,
  })
);
```

Update and redeploy backend:

```bash
# In Railway, this auto-redeploys on push to main
git push origin main
```

---

## 🔒 Part 4: Configure Supabase

### Enable Production URLs in Supabase

1. Go to Supabase Dashboard
2. Settings → API → URL Configuration
3. Add your Vercel frontend URL to allowed origins
4. Add Railway backend URL to allowed origins
5. Save

### Verify RLS Policies

1. Database → Policies
2. Ensure all tables have policies:
   - businesses
   - employees
   - shifts
3. Test that inserts work from production

---

## ✅ Part 5: Final Checklist

### Backend (Railway)

- [ ] Build completes successfully
- [ ] Health endpoint works: `curl https://your-app.up.railway.app/health`
- [ ] All environment variables set
- [ ] CORS configured for frontend URL
- [ ] Logs show no errors

### Frontend (Vercel)

- [ ] Build completes successfully
- [ ] Site loads at Vercel URL
- [ ] Login/signup form displays
- [ ] Environment variables set
- [ ] Can make API calls to backend

### Supabase

- [ ] Database migration completed
- [ ] RLS policies enabled
- [ ] Frontend URL added to allowed origins
- [ ] Service role key secured

### Testing

- [ ] Sign up new user
- [ ] Create business
- [ ] Add employee
- [ ] Create shift manually
- [ ] Try AI composer
- [ ] Test on mobile device

---

## 🐛 Troubleshooting

### Backend Issues

**Error: "Missing environment variables"**

- Verify all variables are set in Railway
- Check for typos in variable names
- Redeploy after adding variables

**Error: "Cannot connect to Supabase"**

- Verify SUPABASE_URL is correct
- Check service role key is valid
- Ensure no network restrictions

**Error: "OpenAI API error"**

- Verify API key starts with `sk-`
- Check you have OpenAI credits
- Test key locally first

### Frontend Issues

**Error: "Failed to fetch from API"**

- Check VITE_API_URL is set correctly
- Verify backend URL in Vercel env vars
- Check CORS is configured on backend
- Look at browser console for errors

**Error: "Missing Supabase URL"**

- Verify VITE_SUPABASE_URL is set
- Check Vercel env vars are deployed
- Clear browser cache and reload

**Blank page after deployment**

- Check Vercel build logs for errors
- Verify TypeScript compilation succeeded
- Look for missing dependencies

### Database Issues

**Error: "Permission denied"**

- Check RLS policies are enabled
- Verify user has correct role (manager/employee)
- Test policies in Supabase dashboard

**Error: "Table does not exist"**

- Re-run migration from SETUP.md
- Check database schema in Table Editor
- Verify migration ran successfully

---

## 🔄 Continuous Deployment

### Automatic Deploys

Both Railway and Vercel automatically redeploy on push to main:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Both platforms auto-deploy!
```

### Environment-Specific Deployments

- **Production:** Pushed to `main` branch
- **Preview:** Pull requests get preview URLs
- **Development:** Local dev with `npm run dev`

---

## 📊 Monitoring

### Railway Logs

1. Go to Railway dashboard
2. Click your backend service
3. View "Deployments" → "Logs"
4. Monitor errors and performance

### Vercel Analytics

1. Enable Analytics in project settings
2. View real-time traffic
3. Monitor performance metrics
4. Check for errors

### Supabase Monitoring

1. Dashboard → Database → Inspect queries
2. Monitor slow queries
3. Check connection pool usage
4. Review API usage

---

## 💰 Cost Estimates

### Free Tier Limits

**Railway:**

- $5 credit/month
- 512MB RAM
- ~100 hours runtime
- Perfect for testing

**Vercel:**

- Free forever for personal projects
- Unlimited deployments
- 100GB bandwidth
- Perfect for frontend

**Supabase:**

- Free tier: 500MB database, 2GB bandwidth
- Good for 1-2 businesses
- Upgrade if you need more

**OpenAI:**

- GPT-4o-mini: ~$0.15 per 1M tokens
- Very affordable for personal use
- Monitor usage in dashboard

### Recommended Upgrades

- **Supabase Pro ($25/month)** for production
- **Railway Pro ($20/month)** for more resources
- **OpenAI:** Pay-as-you-go, no subscription needed

---

## 🎯 Success Metrics

After deployment, you should have:

✅ Live frontend at `https://your-app.vercel.app`  
✅ Live backend at `https://your-app.up.railway.app`  
✅ Functional authentication  
✅ AI composer working  
✅ Real-time updates  
✅ Mobile responsive  
✅ Zero downtime deployments

---

## 📚 Next Steps

1. **Custom Domain:** Add your domain in Vercel settings
2. **Analytics:** Set up Google Analytics or Plausible
3. **Monitoring:** Add Sentry for error tracking
4. **Backups:** Enable Supabase daily backups
5. **Email:** Configure SMTP for production emails
6. **CDN:** Already included in Vercel deployment

---

## 🆘 Need Help?

- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
- Project issues: Open GitHub issue

**Congratulations! Your production app is live! 🚀**
