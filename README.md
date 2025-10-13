# Shift Scheduler - AI-Powered Shift Management

A production-ready shift scheduling application with Supabase authentication, multi-tenancy, and AI-powered shift generation using OpenAI GPT-4o-mini.

## Features

✅ **Authentication & Multi-Tenancy**

- Supabase Auth with email/password
- Row-Level Security (RLS) for data isolation
- Manager and Employee role separation

✅ **Shift Management**

- Visual calendar interface with month view
- Create, edit, and delete shifts
- Employee assignment with color coding
- Conflict detection (overlapping shifts)
- Real-time updates across sessions

✅ **Employee Management**

- Add/remove employees
- Automatic Supabase Auth account creation
- Role and color customization
- Employee-specific shift views

✅ **AI-Powered Scheduling**

- Natural language shift generation
- Automatic employee matching
- Date/time parsing with timezone support
- Validation and conflict warnings

✅ **Accessibility & UX**

- Keyboard navigation
- ARIA labels and roles
- Focus management in modals
- Responsive design (mobile/tablet/desktop)
- Loading states and error handling

## Tech Stack

### Frontend

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Supabase JS Client** for auth & database
- **date-fns** + **date-fns-tz** for timezone handling

### Backend

- **Node.js** + **Express** + **TypeScript**
- **Supabase Admin SDK** for employee account creation
- **OpenAI API** (GPT-4o-mini) for natural language parsing
- **Zod** for validation

### Database & Auth

- **Supabase** (PostgreSQL + Auth)
- Row-Level Security (RLS) policies
- Real-time subscriptions

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- An OpenAI API key (for GPT-4o-mini)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd shift-scheduler-supabase
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration from `SETUP.md`
3. Get your project URL and API keys from Settings > API

### 3. Configure Environment Variables

**Frontend** (`frontend/.env`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Backend** (`backend/.env`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OPENAI_API_KEY=sk-your-openai-key-here
PORT=3001
NODE_ENV=development
DEFAULT_TIMEZONE=America/New_York
```

⚠️ **Security Note**: Never commit `.env` files or expose the service role key to the frontend.

### 4. Run the Application

```bash
# Run both frontend and backend
npm run dev

# Or run individually:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

The app will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Usage Guide

### Manager Flow

1. **Sign Up**: Create an account at http://localhost:3000
2. **Create Business**: After signup, you'll be prompted to create a business
3. **Add Employees**:
   - Click "Add" in the Employees panel
   - Enter name, email (optional), role, and color
   - If email is provided, an auth account is created automatically
4. **Add Shifts Manually**:
   - Click the "+" icon on any calendar day
   - Select employee, date/time, role, and notes
   - Click "Add Shift"
5. **Use AI Generator**:
   - Type in the AI composer: "Schedule Alice for Monday 9am to 5pm"
   - Review the preview
   - Click "Accept & Add Shifts"
6. **Edit/Delete Shifts**:
   - Click on any shift bar
   - Modify details or click "Delete"

### Employee Flow

1. **Sign Up**: Use the email address your manager added
2. **View Schedule**: See the calendar in read-only mode
3. **Click Shifts**: View shift details (cannot edit)

### AI Composer Examples

```
"Add two shifts for Bob next Monday and Tuesday 8am to 4pm"

"Schedule Alice on October 15th from 9:00 AM to 5:00 PM as Barista"

"Create shifts for all employees on Friday 10am-6pm"

"Bob and Alice work together next Wednesday morning shift"
```

## Architecture

### Multi-Tenancy

Each business is completely isolated via Supabase RLS policies:

- Managers can only see/edit data for businesses they own
- Employees can only view data for businesses they belong to
- All queries are filtered by `business_id` at the database level

### Security

- **RLS Policies**: All database access is protected by Row Level Security
- **JWT Verification**: Backend verifies Supabase JWTs on all API routes
- **Service Role Key**: Never exposed to frontend, only used in backend
- **Input Validation**: Zod schemas validate all API inputs

### Timezones

- All timestamps stored as `timestamptz` (UTC) in PostgreSQL
- Each business has a `timezone` field (e.g., "America/New_York")
- Frontend displays dates in the business's local timezone using date-fns-tz
- OpenAI generates timestamps with correct timezone offsets

### Real-time Updates

- Frontend subscribes to Supabase realtime changes on `shifts` table
- When a manager creates/edits/deletes a shift, all connected clients see the update
- RLS policies apply to realtime subscriptions (employees only see their business)

## API Endpoints

### POST `/api/parse-shifts`

Parse natural language shift requests using OpenAI.

**Auth**: Manager JWT required

**Request**:

```json
{
  "text": "Schedule Alice for Monday 9am to 5pm",
  "month": "2025-10",
  "business_id": "uuid",
  "timezone": "America/New_York",
  "employees": [{ "id": "uuid", "name": "Alice", "role": "Barista" }]
}
```

**Response**:

```json
{
  "shifts": [...],
  "warnings": [],
  "errors": []
}
```

### POST `/api/businesses/:id/employees`

Create a Supabase Auth account for an employee.

**Auth**: Manager JWT required

**Request**:

```json
{
  "employeeId": "uuid",
  "email": "employee@example.com"
}
```

**Response**:

```json
{
  "success": true,
  "userId": "uuid",
  "email": "employee@example.com",
  "tempPassword": "random-password"
}
```

### GET `/api/shifts/:businessId`

Fetch shifts for a business (optional, most operations use Supabase client directly).

**Query params**: `start`, `end` (ISO date strings)

## Database Schema

See `SETUP.md` for the complete SQL schema including:

- `businesses`: Business accounts with owner_user_id
- `employees`: Employee records with optional user_id link
- `shifts`: Shift records with employee and business references
- RLS policies for data isolation
- Helper functions for permission checks

## Development

### Project Structure

```
shift-scheduler-supabase/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Supabase client
│   │   ├── store/            # Zustand store
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/           # Express routes
│   │   ├── services/         # OpenAI service
│   │   ├── lib/              # Supabase admin client
│   │   ├── middleware/       # Auth middleware
│   │   ├── utils/            # Validation, prompts
│   │   └── index.ts          # Server entry point
│   └── package.json
│
├── README.md
├── SETUP.md
└── package.json
```

### Running Tests

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

### Building for Production

```bash
# Build both
npm run build

# Build individually
cd frontend && npm run build
cd backend && npm run build
```

## Troubleshooting

### RLS Permission Denied

**Symptom**: "permission denied for table X" errors

**Solution**:

1. Verify RLS policies are installed correctly
2. Check that your user is authenticated (browser console)
3. For manager actions, ensure `business.owner_user_id === auth.uid()`
4. Check Supabase logs for detailed policy violations

### OpenAI Errors

**Symptom**: AI shift generation fails

**Solution**:

1. Verify `OPENAI_API_KEY` is correct in `backend/.env`
2. Check you have API credits at platform.openai.com
3. Review backend terminal logs for detailed error messages
4. Ensure you're using `gpt-4o-mini` model (or update in code)

### Real-time Not Working

**Symptom**: Changes don't appear immediately

**Solution**:

1. Check that Realtime is enabled in Supabase (Database > Replication)
2. Verify browser console for subscription errors
3. Ensure RLS policies allow the current user to SELECT shifts
4. Try refreshing the page

### Build/TypeScript Errors

**Solution**:

1. Ensure Node.js 18+ is installed
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Check for missing type definitions

## Production Deployment

### Frontend

Deploy to **Vercel**, **Netlify**, or any static host:

```bash
cd frontend
npm run build
# Upload dist/ folder
```

Set environment variables in your hosting provider's dashboard.

### Backend

Deploy to **Railway**, **Render**, or **Fly.io**:

```bash
cd backend
npm run build
npm start
```

Set environment variables in your platform's settings.

### Database

Supabase handles database hosting. For production:

1. Upgrade to a paid plan for better performance
2. Enable Point-in-Time Recovery (backups)
3. Set up database webhooks for monitoring

## Security Best Practices

1. ✅ **Never commit `.env` files**
2. ✅ **Never expose service role key to frontend**
3. ✅ **Always verify JWTs in backend routes**
4. ✅ **Use RLS policies for all tables**
5. ✅ **Validate all inputs with Zod**
6. ✅ **Use HTTPS in production**
7. ✅ **Rotate API keys regularly**
8. ✅ **Enable 2FA on Supabase account**

## License

MIT

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ using React, Supabase, and OpenAI
