# 🎯 START HERE - Gym Management System

**Status**: ✅ **FULLY READY TO RUN**  
**Setup Time**: 5-10 minutes  
**Difficulty**: Easy

---

## 🚀 Quick Start (Choose One)

### 🎬 Fastest Way (3 Commands)

```powershell
# Open PowerShell and run from c:\GYM directory:

# 1. Setup database (follow prompts, press Enter for defaults)
.\setup-db.ps1

# 2. When done, in NEW PowerShell window:
.\start-backend.ps1

# 3. When that's running, in ANOTHER NEW PowerShell window:
.\start-frontend.ps1
```

**Done!** Visit:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

### 🎬 Automatic Way (1 Command)

```powershell
# After running .\setup-db.ps1, just run:
.\start-all.ps1

# This opens both backends automatically
```

---

## ✅ Pre-Flight Checklist

Before you start, make sure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **PostgreSQL 12+** installed and running ([Download](https://www.postgresql.org/download/))
- [ ] **PowerShell** available (comes with Windows)
- [ ] **c:\GYM** directory with files
- [ ] **npm dependencies installed** (already done: `npm install` was run)

---

## 🎯 5-Minute Setup Guide

### Step 1: Database Setup
```powershell
cd c:\GYM
.\setup-db.ps1
```

**What happens:**
1. Script prompts for database details
2. Press Enter to use defaults (recommended)
3. Creates gym_db database
4. Runs migrations
5. Seeds sample data

**Expected output:**
```
✅ Migrations completed successfully!
✅ Database seeded!
✅ Database setup complete!
```

### Step 2: Start Backend
```powershell
.\start-backend.ps1
```

**Expected output:**
```
[Nest] ... NestFactory bootstrapped successfully on port 3000
```

### Step 3: Start Frontend (new terminal)
```powershell
.\start-frontend.ps1
```

**Expected output:**
```
VITE v... ready in ... ms
➜  Local: http://localhost:5173
```

### ✅ Done!

Both servers running:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

---

## 📖 Next Steps

### 1. Test the Backend API
```bash
curl http://localhost:3000/members \
  -H "Authorization: Bearer TOKEN"
```

See [MEMBERS_QUICK_START.md](./MEMBERS_QUICK_START.md) for more examples.

### 2. Explore the Documentation
- [READY_TO_RUN.md](./READY_TO_RUN.md) - Full setup guide
- [MEMBERS.md](./MEMBERS.md) - API documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Architecture

### 3. Build Features (Tasks #6+)
Next tasks to implement:
- Class Scheduling (Task #6)
- Bookings System (Task #7)
- Check-in System (Task #8)
- Payments (Task #9)

---

## 🎓 What You Have

### ✅ Completed (5/30 Tasks)

**Backend:**
- JWT authentication with roles
- MFA (TOTP) support
- Email verification & password reset
- Member management (CRUD, referrals, family accounts)
- 13 API endpoints

**Database:**
- 17 tables with relationships
- 4 migrations ready
- Sample data

**Frontend:**
- React scaffolded
- TypeScript configured
- Tailwind CSS ready

**Documentation:**
- 2,500+ lines
- API reference
- Architecture guides
- Examples & quick start

---

## 🆘 Common Issues

### "Port 3000 already in use"
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Cannot connect to database"
- Is PostgreSQL running?
- Run: `psql -U postgres -h localhost`
- Check credentials in `apps/api/.env`

### "npm not found"
- Install Node.js from https://nodejs.org/
- Restart PowerShell

### "Module not found"
```powershell
cd c:\GYM
npm install
```

See [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) for more troubleshooting.

---

## 📋 Project Structure

```
c:\GYM/
├── apps/api/               ← Backend (NestJS)
├── apps/web/               ← Frontend (React)
├── packages/shared-types/  ← Shared types
├── start-backend.ps1       ← Run backend
├── start-frontend.ps1      ← Run frontend
├── start-all.ps1           ← Run both
├── setup-db.ps1            ← Setup database
└── READY_TO_RUN.md         ← Full guide
```

---

## 🎯 Key Files to Know

| File | Purpose |
|------|---------|
| `apps/api/src/main.ts` | Backend entry point |
| `apps/web/src/main.tsx` | Frontend entry point |
| `apps/api/.env` | Backend config (already created) |
| `apps/web/.env` | Frontend config (already created) |
| `READY_TO_RUN.md` | Full documentation |
| `MEMBERS.md` | API documentation |

---

## 📊 System Status

```
✅ Backend Code          Ready
✅ Frontend Code         Ready
✅ Database Schema       Ready
✅ Migrations            Ready
✅ Environment Files     Created
✅ Startup Scripts       Created
✅ Documentation         Complete
```

---

## 🚀 You're Ready!

```powershell
# From c:\GYM, run:
.\setup-db.ps1
```

Then follow the prompts. That's it!

---

## 📞 Questions?

- **Setup issues**: See [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
- **API usage**: See [MEMBERS_QUICK_START.md](./MEMBERS_QUICK_START.md)
- **Architecture**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Full guide**: See [READY_TO_RUN.md](./READY_TO_RUN.md)

---

**Ready? Run `.\setup-db.ps1` now! 🚀**

*Gym Management System • v1.0 • August 25, 2026*
