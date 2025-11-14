# Shift Scheduler - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- An OpenAI API key (for GPT-4o-mini)

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (takes ~2 minutes)
3. Note your project URL and API keys from Settings > API

## Step 2: Run Database Migrations

1. In your Supabase project dashboard, go to the SQL Editor
2. Create a new query and paste the following SQL:

```sql
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Businesses table
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now(),
  owner_user_id uuid not null,
  metadata jsonb default '{}'
);

-- Employees table
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid references auth.users(id) unique,
  email text,
  name text not null,
  role text,
  color varchar(7),
  is_manager boolean default false,
  created_at timestamptz not null default now()
);

-- Shifts table
create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  employee_id uuid references employees(id),
  start timestamptz not null,
  "end" timestamptz not null,
  role text,
  notes text,
  source_text text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Indexes
create index if not exists idx_shifts_business_start on shifts (business_id, start);
create index if not exists idx_employees_business on employees (business_id);
create index if not exists idx_businesses_owner on businesses (owner_user_id);

-- Enable Row Level Security
alter table businesses enable row level security;
alter table employees enable row level security;
alter table shifts enable row level security;

-- Helper functions
create or replace function is_business_owner(business uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from businesses b
    where b.id = business and b.owner_user_id = auth.uid()
  );
$$;

create or replace function is_employee_of_business(business uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from employees e
    where e.business_id = business and e.user_id = auth.uid()
  );
$$;

-- RLS Policies for businesses
create policy "businesses_owner_full_access" on businesses
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "businesses_employee_select" on businesses
  for select using (is_employee_of_business(id));

-- RLS Policies for employees
create policy "employees_managers_crud" on employees
  for all using (
    exists (select 1 from businesses b where b.id = employees.business_id and b.owner_user_id = auth.uid())
  ) with check (
    exists (select 1 from businesses b where b.id = employees.business_id and b.owner_user_id = auth.uid())
  );

create policy "employees_self_select" on employees
  for select using (user_id = auth.uid());

-- RLS Policies for shifts
create policy "shifts_managers_crud" on shifts
  for all using (
    exists (select 1 from businesses b where b.id = shifts.business_id and b.owner_user_id = auth.uid())
  ) with check (
    exists (select 1 from businesses b where b.id = shifts.business_id and b.owner_user_id = auth.uid())
  );

create policy "shifts_employees_select" on shifts
  for select using (is_employee_of_business(business_id));
```

3. Click "Run" to execute the migration
4. Verify that tables were created in the Table Editor

## Step 3: Configure Environment Variables

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env`
2. Fill in your Supabase URL and anon key:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in all required variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   OPENAI_API_KEY=sk-your-openai-key-here
   PORT=3001
   NODE_ENV=development
   DEFAULT_TIMEZONE=America/New_York
   ```

⚠️ **Important**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and should NEVER be exposed to the frontend. Keep it server-side only.

## Step 4: Install Dependencies

```bash
# From the project root
npm install

# Or install individually
cd frontend && npm install
cd ../backend && npm install
```

## Step 5: Run the Application

```bash
# From the project root (runs both frontend and backend)
npm run dev

# Or run individually:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Step 6: Test the Application

### Manager Flow

1. Sign up with a new account at http://localhost:3000
2. After signup, you'll be prompted to create a business
3. Create a business (e.g., "Coffee Shop") and set timezone
4. Add employees with name, email, role, and color
5. Try adding shifts manually by clicking calendar days
6. Try the AI composer: "Schedule Alice for Monday 9am to 5pm"

### Employee Flow

1. After a manager creates an employee with an email, that employee can sign up using that email
2. Login with the employee account
3. You'll see the calendar in read-only mode (no edit/add/delete buttons)

## Troubleshooting

### Email Confirmation Required

**Problem**: After signup, login fails with authentication error.

**Solution**: Disable email confirmation for development:

1. Go to Supabase Dashboard → Authentication → Settings → Email Auth
2. Turn OFF "Confirm email"
3. Save
4. Try signing up and logging in again

⚠️ **Remember to re-enable this for production!**

### RLS Errors

If you see "permission denied" errors, verify:

1. RLS policies are correctly installed
2. Your user is authenticated (check browser console for auth token)
3. For manager actions, ensure the business's `owner_user_id` matches your `auth.uid()`

### OpenAI Errors

If AI shift generation fails:

1. Verify your OpenAI API key is correct
2. Check that you have API credits
3. Review backend logs for detailed error messages

### Build Errors

If you encounter TypeScript or build errors:

1. Ensure you're using Node.js 18 or higher
2. Delete `node_modules` and `package-lock.json`, then run `npm install` again
3. Check that all peer dependencies are installed

## Architecture Notes

### Multi-Tenancy

- Each business is completely isolated via RLS policies
- Managers can only see/edit data for their own businesses
- Employees can only view data for businesses they belong to

### Security

- All database access is protected by Row Level Security (RLS)
- Service role key is NEVER exposed to frontend
- All API endpoints verify authentication via Supabase JWT

### Timezones

- All timestamps are stored as `timestamptz` in UTC
- Each business has a `timezone` field (e.g., "America/New_York")
- Dates are displayed in the business's local timezone using date-fns-tz

### Real-time Updates

- The frontend subscribes to Supabase realtime changes on the `shifts` table
- When a manager creates/edits a shift, all connected clients see the update immediately
- RLS policies apply to realtime subscriptions too
