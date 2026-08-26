# 🚀 GET STARTED - Gym Management System

**Status**: ✅ **FULLY READY TO RUN**  
**Setup Time**: 10-15 minutes  
**Difficulty**: Easy

---

## ⚡ QUICK START (3 Steps)

### Step 1: Initialize System
```powershell
cd c:\GYM
.\init.ps1
```
This will:
- ✅ Verify Node.js and npm
- ✅ Install dependencies
- ✅ Create environment files
- ✅ Setup database
- ✅ Run migrations
- ✅ Seed sample data

**Time**: ~5 minutes (first time only)

### Step 2: Start Everything
```powershell
.\run.ps1
```
This will:
- ✅ Open backend terminal (port 3000)
- ✅ Open frontend terminal (port 5173)
- ✅ Both servers running automatically

**Time**: ~30 seconds

### Step 3: Visit the App
```
Frontend: http://localhost:5173
Backend:  http://localhost:3000
```

**That's it!** You're done! 🎉

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Windows 10/11** (Pro or higher)
- [ ] **Node.js 18+** ([Download](https://nodejs.org/))
- [ ] **npm** (comes with Node.js)
- [ ] **PostgreSQL 12+** ([Download](https://www.postgresql.org/download/))
  - OR use Docker if installed
- [ ] **Administrator access** (for npm install)
- [ ] **8GB+ RAM**

---

## 📋 Detailed Setup Instructions

### Step 1A: Install Prerequisites

#### Node.js
1. Visit https://nodejs.org/
2. Download LTS version (18+)
3. Run installer, follow prompts
4. Restart PowerShell
5. Verify: `node --version`

#### PostgreSQL
1. Visit https://www.postgresql.org/download/
2. Download Windows installer
3. Run installer
4. Remember the password you set
5. Default settings are fine
6. During installation, ensure PostgreSQL starts as service

#### Verify Installation
```powershell
# Test Node.js
node --version
npm --version

# Test PostgreSQL
psql -U postgres -h localhost -c "SELECT version();"
```

### Step 1B: Navigate to Project
```powershell
cd c:\GYM
```

### Step 1C: Run Initialization
```powershell
.\init.ps1
```

Follow the prompts:
- Use default database credentials: `postgres / postgres`
- Answer "y" to seed database with sample data

### Step 2: Start the System

```powershell
# Start both backend and frontend automatically
.\run.ps1

# Or start individually:
.\run.ps1 backend    # Terminal 1
.\run.ps1 frontend   # Terminal 2
```

### Step 3: Access the Application

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:5173 | User interface |
| Backend API | http://localhost:3000 | REST API |
| API Docs | http://localhost:3000/api/docs | Swagger docs |

---

## 📊 System Overview

```
┌─────────────────────────────────────────────┐
│         Gym Management System              │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (React)     Backend (NestJS)     │
│  Port: 5173           Port: 3000           │
│  - Dashboard          - REST API           │
│  - Member Portal      - Authentication     │
│  - Class Booking      - Database Access    │
│  - Payments           - Business Logic     │
│                                             │
│           ↓          ↓                     │
│      Database (PostgreSQL)                │
│      Port: 5432                           │
│      - 17 Tables                          │
│      - Sample Data                        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎮 Available Commands

### Main Scripts

```powershell
# Initialize system (first time setup)
.\init.ps1

# Start everything
.\run.ps1

# Start specific component
.\run.ps1 backend      # Backend only
.\run.ps1 frontend     # Frontend only
.\run.ps1 init         # Run initialization

# Health check
.\health.ps1

# Troubleshooting
.\troubleshoot.ps1     # (When created)
```

### npm Commands (in respective directories)

```powershell
# Backend (apps/api)
npm run dev            # Development server
npm run build          # Production build
npm run lint           # Linter
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database

# Frontend (apps/web)
npm run dev            # Development server
npm run build          # Production build
npm run lint           # Linter
```

---

## 🧪 Testing the API

### Using curl

#### List Members
```bash
curl http://localhost:3000/members \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Member
```bash
curl -X POST http://localhost:3000/members \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "membershipPlanId": "uuid"
  }'
```

### Using Browser

1. Visit http://localhost:3000/api/docs
2. Explore interactive API documentation
3. Try endpoints directly from the browser

### Sample Credentials

After seeding (if you answered "y" during init):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gym.com | password |
| Manager | manager@gym.com | password |
| Trainer | trainer@gym.com | password |
| Member | member@gym.com | password |

**Note**: Change these in production!

---

## 📁 Project Structure

```
c:\GYM\
├── apps/
│   ├── api/                    Backend (NestJS)
│   │   ├── src/
│   │   │   ├── main.ts         Entry point
│   │   │   ├── app.module.ts   App configuration
│   │   │   └── modules/        Feature modules
│   │   ├── .env                Configuration
│   │   └── package.json
│   │
│   └── web/                    Frontend (React)
│       ├── src/
│       │   ├── main.tsx        Entry point
│       │   └── App.tsx         Main component
│       ├── .env                Configuration
│       └── package.json
│
├── packages/
│   └── shared-types/           Shared TypeScript types
│
├── init.ps1                    Setup script
├── run.ps1                     Startup script
├── health.ps1                  Health check
│
└── Documentation/
    ├── START_HERE.md
    ├── GET_STARTED.md (this file)
    ├── READY_TO_RUN.md
    ├── MEMBERS.md
    ├── DOCKER_INSTALLATION_GUIDE.md
    └── ... more docs
```

---

## 🆘 Troubleshooting

### "Node.js not found"
```powershell
# Restart PowerShell after installing Node.js
# Or verify: node --version
```

### "Port 3000 already in use"
```powershell
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Cannot connect to database"
```powershell
# Verify PostgreSQL is running
psql -U postgres -h localhost -c "SELECT 1"

# Or check port 5432
netstat -ano | findstr :5432
```

### "Dependencies missing"
```powershell
cd c:\GYM
npm install
```

### "Module not found"
```powershell
cd c:\GYM\apps\api
npm install
# and
cd c:\GYM\apps\web
npm install
```

For more help, see [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)

---

## 📚 What's Included

### ✅ Completed Features (Tasks 1-5)

**Authentication:**
- JWT-based authentication
- Role-based access control (5 roles)
- MFA with TOTP
- Email verification
- Password reset

**Member Management:**
- Full CRUD operations
- Profile management
- Family account linking
- Referral tracking ($10 per active referral)
- QR code generation
- Activity statistics

**Database:**
- 17 tables with relationships
- 4 migrations
- Sample data
- Strategic indexes

### 📋 Pending Features (Tasks 6-30)

- Class scheduling and recurring classes
- Booking system with waitlist
- Check-in system with QR codes
- Stripe payment integration
- Workout tracking
- Push/SMS notifications
- Analytics and reporting
- Mobile app (future)

---

## 🎯 Common Tasks

### Check System Health
```powershell
.\health.ps1
```

### Restart Everything
```powershell
# Kill existing processes, then:
.\run.ps1
```

### View Backend Logs
```powershell
# In backend terminal, press Ctrl+C then:
.\run.ps1 backend
```

### Rebuild Database
```powershell
cd apps/api
npm run db:migrate:revert
npm run db:migrate
npm run db:seed
```

### Reset Everything
```powershell
# Backup important data first!
# Then:
.\init.ps1
```

---

## 🔍 Features Overview

### Authentication System
- Secure JWT tokens
- Refresh token rotation
- MFA support
- Email verification
- Password reset
- Login tracking

### Member Management
- Member CRUD
- Profile customization
- Family account groups
- Referral program
- QR code check-in
- Activity tracking

### Database Features
- Multi-tenant support (multiple gyms)
- Relationship integrity
- Data consistency
- Transaction support
- Backup capabilities

### API
- RESTful architecture
- 13+ endpoints
- Comprehensive documentation
- Error handling
- Rate limiting ready

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [START_HERE.md](./START_HERE.md) | Quick start (5 min) |
| [GET_STARTED.md](./GET_STARTED.md) | This guide |
| [READY_TO_RUN.md](./READY_TO_RUN.md) | Full setup guide |
| [MEMBERS.md](./MEMBERS.md) | API reference |
| [MEMBERS_QUICK_START.md](./MEMBERS_QUICK_START.md) | API examples |
| [AUTH.md](./AUTH.md) | Authentication guide |
| [DATABASE.md](./DATABASE.md) | Database schema |
| [DOCKER_INSTALLATION_GUIDE.md](./DOCKER_INSTALLATION_GUIDE.md) | Docker setup |
| [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) | Troubleshooting |

---

## 🚀 Next Steps

### Immediate (Now)
1. Run: `.\init.ps1`
2. Run: `.\run.ps1`
3. Visit: http://localhost:5173

### Next Hour
1. Test the API with sample credentials
2. Explore the documentation
3. Try the different endpoints

### Next Day
1. Customize the frontend UI
2. Add your gym data
3. Integrate with your systems

### Next Week
1. Deploy to staging
2. Test with real users
3. Configure production settings

---

## 💡 Tips & Tricks

### Faster Development
```powershell
# Terminal 1: Backend with auto-reload
.\run.ps1 backend

# Terminal 2: Frontend with auto-reload
.\run.ps1 frontend

# Changes auto-reload - no restart needed!
```

### Database Inspection
```powershell
# Connect to database
psql -U postgres -h localhost -d gym_db

# List tables
\dt

# Query members
SELECT * FROM members;

# Exit
\q
```

### API Testing
```powershell
# Use the built-in Swagger docs
# http://localhost:3000/api/docs

# Or use curl/Postman for more control
```

### Performance Monitoring
```powershell
# Watch network usage
netstat -an | findstr ESTABLISHED

# Monitor processes
tasklist | findstr node
```

---

## ✨ You're All Set!

Everything is ready to go. Just run:

```powershell
cd c:\GYM
.\init.ps1
.\run.ps1
```

Then visit **http://localhost:5173** 🎉

---

## 📞 Support

**Issues?** Check:
1. [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Troubleshooting guide
2. [READY_TO_RUN.md](./READY_TO_RUN.md) - Full setup guide
3. Run: `.\health.ps1` - Check system status
4. Documentation files - Detailed guides

**Having fun?** Check [MEMBERS_QUICK_START.md](./MEMBERS_QUICK_START.md) for API examples!

---

**Status**: ✅ Ready to launch  
**Time to first run**: ~10 minutes  
**Complexity**: Easy  

**Let's go!** 🚀
