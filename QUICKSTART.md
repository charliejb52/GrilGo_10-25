# Quick Start Guide

Get your shift scheduling app running in 10 minutes!

## Step 1: Install Dependencies (2 min)

```bash
cd shift-scheduler-supabase
npm install
```

This installs dependencies for both frontend and backend.

## Step 2: Set Up Supabase (3 min)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Fill in:
   - **Name**: shift-scheduler
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to you
4. Wait ~2 minutes for provisioning

### Run the Database Migration

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire SQL migration from `SETUP.md` (starting from line 16)
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify: Click **Table Editor** and confirm you see `businesses`, `employees`, and `shifts` tables

## Step 3: Get API Keys (1 min)

1. In Supabase dashboard, go to **Settings** > **API**
2. You'll need three values:

   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (also starts with `eyJ...`)

3. Get an OpenAI API key:
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the key (starts with `sk-...`)

## Step 4: Configure Environment Variables (2 min)

### Frontend `.env`

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxYOUR_ANON_KEYxxx
```

### Backend `.env`

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJxxxYOUR_ANON_KEYxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxYOUR_SERVICE_ROLE_KEYxxx
OPENAI_API_KEY=sk-xxxYOUR_OPENAI_KEYxxx
PORT=3001
NODE_ENV=development
DEFAULT_TIMEZONE=America/New_York
```

**Pro tip**: Copy the template from `ENV_SETUP.md` and just replace the values!

## Step 5: Run the App (1 min)

```bash
npm run dev
```

This starts both the frontend (localhost:3000) and backend (localhost:3001).

Open your browser to **http://localhost:3000** 🎉

## Step 6: Try It Out (1 min)

1. Click **"create a new account"**
2. Enter:
   - Name: Your Name
   - Email: test@example.com
   - Password: test123456
3. Click **Sign up**
4. You'll see "Account created successfully!"
5. Click **Go to Login** and log in
6. Create your first business (e.g., "Coffee Shop")
7. Add an employee (e.g., "Alice", role "Barista")
8. Click on a calendar day to add a shift
9. Try the AI composer: "Schedule Alice for tomorrow 9am to 5pm"

---

## Common Issues

### "Missing Supabase environment variables"

**Fix**: Make sure your `.env` files are in the correct directories:

- `frontend/.env` (inside the frontend folder)
- `backend/.env` (inside the backend folder)

### "Permission denied for table businesses"

**Fix**: The SQL migration didn't run correctly. Go back to Step 2 and re-run the migration.

### Backend won't start

**Fix**:

1. Check if port 3001 is already in use: `lsof -i :3001` (Mac/Linux) or `netstat -ano | findstr :3001` (Windows)
2. Change the `PORT` in `backend/.env` to a different number (e.g., 3002)

### OpenAI errors

**Fix**:

1. Verify your API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Check that you have API credits available
3. Make sure you copied the full key (starts with `sk-`)

---

## What's Next?

- Read the full [README.md](README.md) for detailed feature documentation
- Review [SETUP.md](SETUP.md) for database schema details
- Check [ENV_SETUP.md](ENV_SETUP.md) for environment variable explanations
- Test manager vs employee roles (add an employee with an email, then login as that employee)
- Explore the AI composer with different prompts
- Try the real-time updates (open two browser windows and make changes in one)

---

## Need Help?

If you get stuck:

1. Check the browser console (F12) for errors
2. Check the terminal where the backend is running for server errors
3. Verify your `.env` files have the correct values
4. Make sure the Supabase migration ran successfully
5. Open an issue on GitHub with:
   - What you were trying to do
   - Error message (if any)
   - Screenshots (if helpful)

---

Happy scheduling! 🗓️✨
