# 🔴 CRITICAL: Vercel Environment Variable Fix

## The Problem

You're seeing `/api/parse-shifts:1 Failed to load resource: 404` because `VITE_API_URL` is **NOT set** in your Vercel deployment.

**Why this happens:**

- Vite environment variables are embedded at **BUILD TIME**, not runtime
- If the variable wasn't set when Vercel built your app, it won't be available
- You **MUST** set the variable **BEFORE** building, or **redeploy** after setting it

---

## ✅ Step-by-Step Fix

### Step 1: Get Your Railway Backend URL

1. Go to **Railway Dashboard**: https://railway.app
2. Click your **backend service**
3. Find the URL (looks like: `https://your-app.up.railway.app`)
4. **Copy it** (no trailing slash!)

### Step 2: Set Environment Variable in Vercel

1. Go to **Vercel Dashboard**: https://vercel.com
2. Click your **project**
3. Go to **Settings** → **Environment Variables**
4. **Add New Variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-app.up.railway.app` (your Railway URL, NO trailing slash)
   - **Environments**:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**
5. Click **Save**

### Step 3: REDEPLOY (CRITICAL!)

**This is the most important step!**

1. Go to **Deployments** tab in Vercel
2. Find your latest deployment
3. Click the **3 dots (⋮)** menu
4. Click **Redeploy**
5. **Wait for deployment to complete** (2-3 minutes)
6. **DO NOT** skip this step!

### Step 4: Clear Browser Cache

1. Open your deployed app
2. Press **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. Or clear cache: **Ctrl+Shift+Delete** → Clear cache

### Step 5: Verify It's Working

1. Open your deployed app
2. Press **F12** → **Console** tab
3. Try the AI generator
4. Look for these logs:
   ```
   [API] VITE_API_URL: https://your-app.up.railway.app
   [ChatComposer] API Endpoint: https://your-app.up.railway.app/api/parse-shifts
   ```
5. If you see `VITE_API_URL: NOT SET`, the variable isn't being read

---

## 🔍 How to Verify Environment Variable is Set

### In Vercel Dashboard:

1. **Settings** → **Environment Variables**
2. Look for `VITE_API_URL`
3. Check:
   - ✅ Variable exists
   - ✅ Value is correct (your Railway URL)
   - ✅ **Production** is checked (not just Development!)
   - ✅ No trailing slash in the URL

### In Browser Console (After Redeploy):

1. Open deployed app → F12 → Console
2. Look for: `[API] VITE_API_URL: ...`
3. If it says `NOT SET`, the variable wasn't embedded during build

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Setting Variable But Not Redeploying

- **Problem**: Variable is set, but old build doesn't have it
- **Fix**: **MUST redeploy** after setting environment variables

### ❌ Mistake 2: Only Setting for Development

- **Problem**: Variable only set for "Development" environment
- **Fix**: Check **Production** checkbox too!

### ❌ Mistake 3: Wrong Variable Name

- **Problem**: Typo in variable name
- **Fix**: Must be exactly `VITE_API_URL` (case-sensitive, starts with `VITE_`)

### ❌ Mistake 4: Trailing Slash

- **Problem**: URL has trailing slash: `https://app.up.railway.app/`
- **Fix**: Remove trailing slash: `https://app.up.railway.app`

### ❌ Mistake 5: Not Waiting for Deployment

- **Problem**: Testing before deployment finishes
- **Fix**: Wait for "Ready" status in Vercel

---

## 📋 Checklist

Before testing, verify:

- [ ] Railway backend is running (test `/health` endpoint)
- [ ] `VITE_API_URL` is set in Vercel
- [ ] Variable value is your Railway URL (no trailing slash)
- [ ] **Production** environment is checked
- [ ] Frontend has been **redeployed** after setting variable
- [ ] Deployment status is "Ready" in Vercel
- [ ] Browser cache cleared (hard refresh)
- [ ] Console shows correct API endpoint (not `/api/parse-shifts`)

---

## 🆘 Still Not Working?

### Check Browser Console:

1. Open deployed app → F12 → Console
2. Look for these messages:
   - `[API] VITE_API_URL: NOT SET` → Variable not set or not redeployed
   - `[API] WARNING: VITE_API_URL is not set in production!` → Same issue
   - `[ChatComposer] API Endpoint: /api/parse-shifts` → Variable not being used

### Check Network Tab:

1. F12 → Network tab
2. Try AI generator
3. Look for request to `/api/parse-shifts`
4. **Request URL** should be: `https://your-railway-url.up.railway.app/api/parse-shifts`
5. If it's just `/api/parse-shifts`, the variable isn't set

### Verify Railway Backend:

1. Visit: `https://your-railway-url.up.railway.app/health`
2. Should see: `{"status":"ok","timestamp":"..."}`
3. If you see error, backend isn't running

---

## ✅ Success Indicators

You'll know it's working when:

- ✅ Console shows: `[API] VITE_API_URL: https://your-app.up.railway.app`
- ✅ Console shows: `[ChatComposer] API Endpoint: https://your-app.up.railway.app/api/parse-shifts`
- ✅ Network tab shows request to Railway URL (not `/api/parse-shifts`)
- ✅ AI generator works without errors
- ✅ No 404 errors in console

---

**Remember: Environment variables in Vite are BUILD-TIME, not runtime. You MUST redeploy after setting them!**
