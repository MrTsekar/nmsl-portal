# NMSL Portal - Healthcare Management System

Comprehensive healthcare management portal for **Nigerian Medical Services Limited (NMSL)**. This frontend application provides authenticated user management across two primary roles: **Admin** and **Appointment Officer**, with a focus on efficient appointment processing and tracking.

This repository contains the **Frontend UI + Mock Integration Layer**.  
Backend implementation specification available in `NESTJS_BACKEND_SPECIFICATION.md`.

---

## 🚀 Key Features

### 🔒 **Appointment Locking System** (Critical Feature)
- **Exclusive locks** prevent multiple officers from working on the same appointment
- **Real-time countdown timer** (30:00 → 00:00) shows remaining lock time
- **Admin override capability** - Admins can take over any locked appointment
- **Auto-unlock after 30 minutes** of inactivity
- **Visual indicators**: Timer changes to red and pulses when <5 minutes remain
- **Conflict prevention**: Frontend polling every 15s + backend Redis locks

### 📊 **Audit Trail & Statistics**
- Comprehensive audit logs tracking all appointment actions
- Officer performance statistics (accepted, rejected, rescheduled, completed)
- Date range filtering and officer-specific views
- Activity dashboard with real-time metrics

### 👥 **User Management**
- Admin user management (create, activate/deactivate, password reset)
- Appointment officer accounts with limited permissions
- Role-based access control (RBAC)
- Location-based filtering (Abuja, Lagos, Benin, Kaduna, Port Harcourt, Warri)

### 👨‍⚕️ **Doctor Management**
- Doctor profiles with specialties and qualifications
- Flexible availability scheduling (uniform or custom time slots per day)
- Location and specialty-based filtering
- Active/inactive status management

### 📅 **Appointment Processing**
- Status workflow: pending → confirmed/rejected/rescheduled → completed/no-show
- Appointment rescheduling with reason tracking
- Doctor assignment
- Urgent appointment flagging
- Physical and Telemedicine visit types

### 🏥 **Content Management**
- Medical services catalog with categories
- Trusted partners gallery
- Board of directors management
- Contact information updates
- Homepage statistics management

---

## 🛠 Technology Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui primitives
- **Icons**: Lucide React
- **Data Fetching**: TanStack Query 5.90.21 (React Query)
- **State Management**: Zustand 5 (auth/session)
- **Forms**: React Hook Form 7 + Zod 4 (validation)
- **UI Components**: Radix UI primitives
- **Theme**: Dark mode support via next-themes
- **API Client**: Axios 1.13.5

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 20+
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration

**Quick Setup:**
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your settings
```

**Environment Variables:**

See [`.env.example`](.env.example) for all available variables.

**Required Variables:**
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Mock Mode (set to "false" to use live backend)
NEXT_PUBLIC_USE_MOCKS=true

# Platform identifier
NEXT_PUBLIC_PLATFORM=local
```

**Optional Variables:**
```env
# Feature Flags
NEXT_PUBLIC_ENABLE_PREMIUM_THEME_TOGGLE=false
NEXT_PUBLIC_ENABLE_ROLE_SWITCHER=false

# App Settings
NEXT_PUBLIC_APP_NAME=NMSL Portal
NEXT_PUBLIC_DEFAULT_LOCATION=Abuja
```

**Important:**
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Never put secrets in `NEXT_PUBLIC_` variables
- Use `.env.local` for local development (gitignored)
- For production, set these in your hosting platform's UI

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Default Login Credentials (Mock Mode)

**Admin User:**
- Email: `admin@nmsl.app`
- Password: any password (mock mode accepts any)

**Appointment Officer:**
- Email: `appointments@nmsl.app`
- Password: any password (mock mode accepts any)

---

## 🗂 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication routes
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── app/                      # Authenticated app routes
│       └── admin/                # Admin dashboard routes
│           ├── appointments/     # Appointment management
│           ├── board-members/    # Board of directors
│           ├── contact/          # Contact info management
│           ├── doctors/          # Doctor management
│           ├── partners/         # Trusted partners
│           ├── services/         # Medical services
│           ├── settings/         # Admin settings
│           ├── statistics/       # Homepage stats
│           ├── testimonials/     # Patient testimonials
│           └── users/            # User management
│
├── components/
│   ├── admin/                    # Admin-specific components
│   │   ├── audit-statistics.tsx # Audit dashboard
│   │   ├── create-doctor-dialog.tsx
│   │   ├── assign-doctor-dialog.tsx
│   │   └── reschedule-appointment-dialog.tsx
│   ├── app/                      # App shell components
│   │   ├── app-layout.tsx       # Main layout wrapper
│   │   ├── app-sidebar.tsx      # Navigation sidebar
│   │   ├── app-header.tsx       # Top header
│   │   ├── auth-guard.tsx       # Route protection
│   │   └── role-guard.tsx       # Role-based access
│   ├── shared/                   # Reusable domain components
│   │   ├── data-table.tsx
│   │   ├── status-badge.tsx
│   │   ├── stat-card.tsx
│   │   ├── filter-bar.tsx
│   │   ├── page-header.tsx
│   │   └── ...
│   └── ui/                       # shadcn/ui primitives
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
│
├── hooks/
│   └── use-app-data.ts          # React Query hooks
│
├── lib/
│   ├── api/                      # API client layer
│   │   ├── admin.api.ts         # Admin endpoints
│   │   ├── auth.api.ts          # Authentication
│   │   ├── users.api.ts         # User management
│   │   ├── services.api.ts      # Medical services
│   │   ├── partners.api.ts      # Partners
│   │   ├── board-members.api.ts # Board members
│   │   ├── contact.api.ts       # Contact info
│   │   ├── statistics.api.ts    # Statistics
│   │   ├── client.ts            # Axios instance
│   │   └── request.ts           # Mock fallback wrapper
│   ├── mocks/
│   │   ├── data.ts              # Mock datasets
│   │   └── handlers.ts          # Mock API handlers
│   ├── constants/
│   │   ├── locations.ts         # Nigerian locations
│   │   └── states.ts            # Nigerian states
│   └── utils.ts                 # Utility functions
│
├── store/
│   ├── auth-store.ts            # Zustand auth state
│   ├── notification-store.ts    # Notifications
│   └── ui-store.ts              # UI state
│
└── types/
    └── index.ts                 # TypeScript type definitions
```

---

## 🛣 Route Map

### 🔓 **Public Routes**
- `/sign-in` - User authentication
- `/sign-up` - User registration
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token

### 🔐 **Authenticated Routes** (Admin & Appointment Officer)

#### **Dashboard**
- `/app/admin` - Admin dashboard with KPIs

#### **Appointment Management** (Core Feature)
- `/app/admin/appointments` - Appointment processing with locking system
  - **Tabs**: Appointment Management | Audit & Statistics
  - **Actions**: Accept, Reject, Reschedule
  - **Lock System**: Radio button selection → 30-minute countdown timer
  - **Real-time Sync**: 15-second polling for conflict prevention

#### **User & Doctor Management**
- `/app/admin/users` - User list and management
- `/app/admin/users/[id]` - User details
- `/app/admin/doctors` - Doctor management with availability scheduling

#### **Content Management**
- `/app/admin/services` - Medical services CRUD
- `/app/admin/partners` - Trusted partners management
- `/app/admin/board-members` - Board of directors
- `/app/admin/testimonials` - Patient testimonials
- `/app/admin/contact` - Contact information
- `/app/admin/statistics` - Homepage statistics

#### **Settings**
- `/app/admin/settings` - Admin settings and preferences

---

## 🔑 Key Components & Patterns

### **Appointment Locking Flow**
```typescript
// 1. User clicks radio button
handleLockToggle(appointmentId)

// 2. API call with admin flag
lockMutation.mutate({ 
  id: appointmentId, 
  officerEmail: user.email,
  isAdmin: user.role === "admin" 
})

// 3. Timer starts counting down from 30:00
{lockedAppointmentId === appointment.id && (
  <CountdownTimer 
    lockedAt={appointment.lockedAt}
    onExpire={handleAutoUnlock}
  />
)}

// 4. Auto-unlock on action or 30-minute expiry
unlockMutation.mutate({ id, officerEmail })
```

### **Real-Time Sync**
```typescript
useAppointments({
  refetchInterval: 15000,              // Poll every 15s
  refetchIntervalInBackground: true,   // Continue in background
  refetchOnWindowFocus: true,          // Refresh on focus
  staleTime: 10000                     // Consider stale after 10s
})
```

### **Role-Based Route Protection**
```typescript
<RoleGuard allowedRoles={["admin", "appointment_officer"]}>
  <AppointmentsPage />
</RoleGuard>
```

---

## 🎨 UI/UX Features

- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Dark Mode**: Full dark theme support
- **Loading States**: Skeleton screens and spinners
- **Empty States**: Helpful empty state messages
- **Error Handling**: User-friendly error messages with auto-dismiss
- **Toast Notifications**: Success/error feedback
- **Optimistic Updates**: Immediate UI feedback with rollback
- **Keyboard Navigation**: Full keyboard accessibility

---

## 🧪 Mock Data System

The app includes a comprehensive mock data layer for development:

- **Mock API Handlers**: Simulate backend responses with realistic delays
- **Data Persistence**: Mock data updates persist within session
- **Fallback Pattern**: Automatically uses mocks when backend unavailable
- **Sample Data**: Includes users, doctors, appointments, services, partners, board members

### Mock Data Includes:
- 4 users (3 admins + 1 appointment officer)
- 5 doctors across different specialties
- 10+ appointments in various states
- 3 medical services
- 11 trusted partners
- 7 board members
- Contact information
- 6 homepage statistics

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server (port 3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

---

## 🌐 API Integration

### Mock Mode (Default)
Set in `.env.local`:
```env
NEXT_PUBLIC_USE_MOCKS=true
```
Uses local mock handlers with simulated delays.

### Live Backend Mode
Set in `.env.local`:
```env
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```
Connects to real NestJS backend. See `NESTJS_BACKEND_SPECIFICATION.md` for backend setup.

### API Client Pattern
```typescript
// Automatic fallback to mocks
export const adminApi = {
  lockAppointment: async (id, email, isAdmin) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post(`/admin/appointments/${id}/lock`, 
          { officerEmail: email, isAdmin }
        );
        return data;
      },
      mock: () => mockHandlers.admin.lockAppointment(id, email, isAdmin)
    });
  }
};
```

---

## 📝 Type Definitions

Key TypeScript types in `src/types/index.ts`:

```typescript
type Role = "admin" | "appointment_officer";

type AppointmentStatus = 
  | "pending" 
  | "scheduled" 
  | "confirmed" 
  | "rescheduled" 
  | "rejected" 
  | "completed" 
  | "no-show";

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  location: string;
  specialty: MedicalSpecialty;
  visitType: "Physical" | "Telemedicine";
  lockedBy?: string;      // Email of officer who locked it
  lockedAt?: string;      // ISO timestamp of lock
  // ... more fields
}

interface AuditLog {
  id: string;
  appointmentId: string;
  patientName: string;
  action: "accepted" | "rejected" | "rescheduled" | "completed";
  performedBy: string;    // Officer email
  performedByName: string;
  performedAt: string;
  details?: string;
}

interface OfficerStatistics {
  officerEmail: string;
  officerName: string;
  totalProcessed: number;
  accepted: number;
  rejected: number;
  rescheduled: number;
  completed: number;
  lastActive?: string;
}
```

---

## 🚀 Deployment

### Quick Deployment (No Code Changes Needed!)

This app is designed to be deployed **anywhere** without code changes. Just update environment variables!

**Comprehensive Deployment Guide:** See [`DEPLOYMENT.md`](DEPLOYMENT.md) for detailed instructions on deploying to:
- 📦 **Render** (easy start, $0-7/month)
- ☁️ **Azure** (enterprise grade)
- 🔄 **Migrating from Render → Azure** (zero downtime)

### Quick Start: Render Deployment

**1. Prerequisites:**
- GitHub repository with your code
- Render account (free tier available)
- Backend API deployed and URL ready

**2. Deploy:**
```bash
# 1. Push code to GitHub
git push origin main

# 2. Go to render.com → New Web Service
# 3. Connect your GitHub repo
# 4. Use these build settings:
Build Command: npm install && npm run build
Start Command: npm start
```

**3. Set Environment Variables in Render Dashboard:**
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_PLATFORM=render
```

**4. Deploy!** ✅  
Your app will be live at: `https://nmsl-portal.onrender.com`

### Quick Start: Azure Deployment

**1. Azure Static Web Apps (Recommended):**
```bash
# Create via Azure Portal or CLI:
az staticwebapp create \
  --name nmsl-portal \
  --resource-group nmsl-rg \
  --source https://github.com/youruser/nmslportal \
  --branch main \
  --app-location "/" \
  --output-location ".next"
```

**2. Set Environment Variables in Azure Portal:**
```env
NEXT_PUBLIC_API_BASE_URL=https://nmsl-api.azurewebsites.net
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_PLATFORM=azure
```

**3. Access:** `https://nmsl-portal.azurestaticapps.net`

### Migration: Render → Azure (Zero Downtime)

The beauty of using environment variables:

1. ✅ Deploy to Azure (keep Render running)
2. ✅ Update DNS to point to Azure
3. ✅ Monitor for 24-48 hours
4. ✅ Delete Render service

**No code changes required!** Just update `NEXT_PUBLIC_API_BASE_URL` in each platform.

### Other Platforms

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

`docker build -t nmsl-portal . && docker run -p 3000:3000 nmsl-portal`

### Environment Variable Setup

All platforms use the same environment variables. Set these in your platform's UI:

| Variable | Local | Render | Azure |
|----------|-------|--------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | `https://api.onrender.com` | `https://api.azure.net` |
| `NEXT_PUBLIC_USE_MOCKS` | `true` | `false` | `false` |
| `NEXT_PUBLIC_PLATFORM` | `local` | `render` | `azure` |

**👉 See [`DEPLOYMENT.md`](DEPLOYMENT.md) for complete step-by-step guides!**

---

## 📚 Additional Documentation

- **Backend Specification**: See `NESTJS_BACKEND_SPECIFICATION.md` for complete NestJS backend implementation guide
- **API Endpoints**: Full REST API documentation in backend spec
- **Database Schema**: Complete entity definitions with relationships
- **Authentication**: JWT-based auth with role-based access control

---

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly (especially appointment locking system)
4. Submit pull request

---

## 📄 License

Proprietary - Nigerian Medical Services Limited (NMSL)

---

## 🐛 Known Issues & Future Enhancements

### Planned Features
- Email notifications for appointment updates
- SMS reminders for appointments
- Patient portal for self-booking
- Doctor portal for schedule management
- Advanced analytics dashboard
- PDF report generation for audit logs
- Bulk appointment import/export

### Technical Debt
- Add comprehensive unit tests
- Add E2E tests for appointment locking workflow
- Implement WebSocket for real-time lock updates (replace polling)
- Add Redis integration for distributed locks in production
- Implement proper error boundary components
- Add performance monitoring (Sentry/DataDog)

---

## 💡 Tips for Development

1. **Appointment Lock Testing**: Use multiple browser tabs/windows with different user emails to test lock conflicts
2. **Mock Data**: Modify `src/lib/mocks/data.ts` to add more test scenarios
3. **Role Testing**: Use profile dropdown to switch roles in development
4. **API Inspection**: Check Network tab to see mock API responses
5. **Timer Testing**: Adjust `getTimeRemaining()` values to test urgency states

---

**Built with ❤️ for NMSL by the Development Team**
