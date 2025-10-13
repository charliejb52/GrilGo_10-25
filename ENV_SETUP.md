# Environment Variables Setup

This document contains the required environment variables for the frontend and backend.

## Frontend Environment Variables

Create a file named `.env` in the `frontend/` directory with the following content:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### How to Get These Values

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the **Project URL** (for `VITE_SUPABASE_URL`)
4. Copy the **anon/public** key (for `VITE_SUPABASE_ANON_KEY`)

---

## Backend Environment Variables

Create a file named `.env` in the `backend/` directory with the following content:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx
PORT=3001
NODE_ENV=development
DEFAULT_TIMEZONE=America/New_York
```

### How to Get These Values

**Supabase Variables:**

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the **Project URL** (for `SUPABASE_URL`)
4. Copy the **anon/public** key (for `SUPABASE_ANON_KEY`)
5. Copy the **service_role** key (for `SUPABASE_SERVICE_ROLE_KEY`)
   - ⚠️ **WARNING**: The service role key bypasses all RLS policies. NEVER expose this to the frontend or commit it to version control!

**OpenAI API Key:**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to **API Keys**
3. Create a new API key (for `OPENAI_API_KEY`)
4. Make sure you have credits available

**Other Variables:**

- `PORT`: The port number for the backend server (default: 3001)
- `NODE_ENV`: Set to `development` for local development, `production` for production
- `DEFAULT_TIMEZONE`: Default timezone for new businesses (e.g., `America/New_York`)

---

## Security Notes

1. **Never commit `.env` files to version control**
   - The `.gitignore` file already excludes them
2. **Never expose the service role key**

   - Only use it in the backend
   - Never send it to the frontend
   - Never include it in client-side code

3. **Use different keys for different environments**
   - Development: Use a separate Supabase project
   - Production: Use different API keys
4. **Rotate keys regularly**

   - Generate new API keys periodically
   - Update them in your deployment platform

5. **Use environment variable management**
   - For production, use your hosting platform's env var management
   - Examples: Vercel Environment Variables, Railway Variables, Render Environment Groups

---

## Verification

After setting up your environment variables, verify they're loaded correctly:

**Frontend:**

```bash
cd frontend
npm run dev
# Check browser console for any missing env var errors
```

**Backend:**

```bash
cd backend
npm run dev
# Check terminal output - should show "Server running on http://localhost:3001"
```

If you see errors about missing environment variables, double-check:

1. File is named exactly `.env` (not `.env.txt` or `.env.example`)
2. File is in the correct directory (`frontend/.env` or `backend/.env`)
3. No extra spaces around the `=` sign
4. Values are not wrapped in quotes (unless the value contains spaces)
