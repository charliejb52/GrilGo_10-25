# Production Deployment Fixes

## 🔴 Current Issue: Login Not Working After Signup

**Symptoms:**

- Signup succeeds (account created)
- Login does nothing/fails silently
- Re-signup shows "account already exists"

**Root Cause:**

- Supabase email confirmation is enabled
- User must confirm email before login works
- In production, emails might be blocked/spam

---

## ✅ Solution 1: Disable Email Confirmation (Recommended for Testing)

### Steps:

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Settings** (gear icon)
3. Scroll down to **Email Auth** section
4. Find **"Confirm email"** toggle
5. **Turn it OFF**
6. Click **Save**

### Test:

1. Try logging in with your existing account (should work now!)
2. If still issues, create a new account and login immediately

---

## ✅ Solution 2: Manually Confirm Your Account

If you want to keep email confirmation enabled:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find your email address in the users list
3. Click on your user row
4. Look for **"Email Confirmed"** field
5. If it says **"No"**, click the **checkmark** or **"Confirm email"** button
6. Try logging in again

---

## ✅ Solution 3: Check Email Spam Folder

1. Check your email inbox for confirmation email from Supabase
2. Check spam/junk folder
3. Click the confirmation link in the email
4. Try logging in again

---

## 🔍 Debugging: Check What's Happening

### Check Browser Console:

1. Open your deployed app (Vercel URL)
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Try to log in
5. Look for any errors (red text)
6. Common errors:
   - `Email not confirmed`
   - `Invalid login credentials`
   - Network errors

### Check Network Tab:

1. Developer Tools → **Network** tab
2. Try to log in
3. Look for requests to Supabase
4. Check response status codes:
   - `200` = success
   - `400` = bad request (check error message)
   - `401` = unauthorized (likely email not confirmed)

---

## 🛠️ Additional Fixes

### If Login Still Fails After Disabling Confirmation:

**Check your Supabase project settings:**

1. Go to **Settings** → **API**
2. Verify **Project URL** matches your `.env` file:
   ```
   VITE_SUPABASE_URL=https://hneqwuztxpjejbqnofkx.supabase.co
   ```
3. Verify **anon/public key** matches:
   ```
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

**Check Vercel Environment Variables:**

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify:
   - `VITE_SUPABASE_URL` is set (without quotes)
   - `VITE_SUPABASE_ANON_KEY` is set (without quotes)
   - Both are assigned to **Production** environment
5. If you made changes, **redeploy**:
   - Go to **Deployments** tab
   - Click the **3 dots** on latest deployment
   - Click **Redeploy**

---

## 📊 Quick Status Check

Run these checks to verify everything:

### 1. Check Supabase User Exists:

```bash
# Go to Supabase Dashboard → Authentication → Users
# Verify your email appears in the list
```

### 2. Check Email Confirmation Status:

```bash
# In Supabase Dashboard → Authentication → Users
# Click your user → Check "Email Confirmed" field
```

### 3. Check Vercel Environment Variables:

```bash
# Go to Vercel → Your Project → Settings → Environment Variables
# Verify both VITE_SUPABASE_* variables are set
```

### 4. Check Railway Environment Variables:

```bash
# Go to Railway → Your Service → Variables
# Verify all backend environment variables are set:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY
# - NODE_ENV=production
```

---

## 🚨 Common Production Issues

### Issue: "Unexpected token 'T', "The page c"... is not valid JSON" (AI Generator)

**Problem**: AI shift generator fails with JSON parsing error.

**Root Cause**:

- Frontend is trying to call `/api/parse-shifts` which only works in development (Vite proxy)
- In production, it needs to call the Railway backend URL directly

**Solution**:

1. **Code Fix** (Already applied): The code now uses `VITE_API_URL` environment variable
2. **Set Environment Variable in Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add new variable:
     - **Name**: `VITE_API_URL`
     - **Value**: Your Railway backend URL (e.g., `https://your-app.up.railway.app`)
     - **Environment**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**
3. **Redeploy Frontend**:
   - Go to Deployments tab
   - Click 3 dots on latest deployment → **Redeploy**
   - Wait for deployment to complete
4. **Test Again**: Try the AI generator - should work now!

**To Find Your Railway Backend URL**:

1. Go to Railway Dashboard
2. Click your backend service
3. Find the URL under **Settings** → **Networking** (or in the service overview)
4. It looks like: `https://your-app.up.railway.app`

### Issue: "Cannot connect to Supabase"

**Fix:**

- Verify CORS is configured in Supabase
- Go to **Settings** → **API**
- Add your Vercel URL to **Allowed Origins**

### Issue: "Missing environment variables"

**Fix:**

- Check Vercel env vars are set for **Production**
- Redeploy after adding variables
- Check for typos (no quotes around values)

### Issue: "RLS policy violation"

**Fix:**

- Verify SQL migration ran in Supabase
- Check **Table Editor** shows: businesses, employees, shifts
- Verify RLS policies exist in **Database** → **Policies**

---

## 🎯 Recommended Action Plan

**For immediate testing:**

1. ✅ Disable email confirmation in Supabase
2. ✅ Try logging in with existing account
3. ✅ If still fails, check browser console for errors
4. ✅ Verify Vercel environment variables are correct
5. ✅ Redeploy frontend if needed

**For production:**

1. ⚠️ Keep email confirmation **enabled** (security)
2. ✅ Configure SMTP in Supabase for custom emails
3. ✅ Test email delivery works
4. ✅ Add password reset functionality
5. ✅ Monitor authentication logs

---

## 📝 Next Steps After Login Works

Once you can log in:

1. **Create a business** (should prompt after login)
2. **Add employees**
3. **Create shifts**
4. **Test AI composer** (requires OpenAI key in Railway)
5. **Test real-time updates** (open in two browsers)

---

## 🆘 Still Not Working?

If login still doesn't work after trying all solutions:

1. **Check Supabase Logs:**

   - Dashboard → **Logs** → **Auth Logs**
   - Look for authentication errors

2. **Check Railway Logs:**

   - Railway Dashboard → Your Service → **Deployments** → **Logs**
   - Look for errors on startup

3. **Check Vercel Logs:**

   - Vercel Dashboard → Your Project → **Deployments** → **Functions Logs**
   - Look for runtime errors

4. **Verify Database Migration:**
   - Supabase → **SQL Editor**
   - Run: `SELECT * FROM businesses LIMIT 1;`
   - Should work without error (if RLS allows)

---

## ✅ Success Criteria

You'll know it's working when:

- ✅ Login button actually responds
- ✅ You're redirected to Business Setup page (new users)
- ✅ You're redirected to Calendar page (existing users)
- ✅ No errors in browser console
- ✅ Supabase logs show successful authentication

---

**Need more help? Check the browser console and Supabase logs for specific error messages!**
