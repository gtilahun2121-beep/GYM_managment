# Gym Management System - Setup Checklist

## ✅ Already Completed

### Environment & Dependencies
- [x] Node.js 18+ installed
- [x] npm dependencies installed (see `npm ls`)
- [x] package.json configured
- [x] tsconfig.base.json configured
- [x] turbo.json configured

### Code Structure
- [x] Monorepo setup (apps/, packages/)
- [x] Backend app (NestJS) created
- [x] Frontend app (React) scaffolded
- [x] Shared types package created

### Backend Implementation
- [x] Auth module (JWT, MFA, email, password reset)
- [x] Members module (CRUD, referrals, family accounts)
- [x] Database migrations (3 migrations + metadata migration)
- [x] Database entities (17 tables)
- [x] TypeORM configuration
- [x] Environment template (.env.example)

### Documentation
- [x] API documentation
- [x] Database documentation
- [x] Architecture documentation
- [x] Quick start guide
- [x] Usage examples

---

## ⚠️ Still Need to Do to RUN

### 1. **Database Setup** ⚠️ CRITICAL

#### PostgreSQL Installation
```bash
# Option 1: Using Docker (Recommended for development)
docker-compose up -d postgres redis

# Option 2: Install PostgreSQL locally
# Download from: https://www.postgresql.org/download/
# Or use Homebrew: brew install postgresql
```

#### Database Configuration
```bash
# Create .env file in apps/api/
cp apps/api/.env.example apps/api/.env

# Edit apps/api/.env with your database details:
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=gym_db
DATABASE_SYNCHRONIZE=false  # Use migrations instead
```

#### Run Migrations
```bash
# From root directory
cd apps/api
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 2. **Backend Startup** 🚀

#### Option A: Development Mode (with auto-reload)
```bash
cd apps/api
npm run dev

# Server runs on http://localhost:3000
# API docs available at http://localhost:3000/api/docs
```

#### Option B: Production Mode
```bash
cd apps/api
npm run build
npm start
```

### 3. **Frontend Setup** 🎨

#### Environment Configuration
```bash
# Create .env file in apps/web/
cp apps/web/.env.example apps/web/.env

# Configure API endpoint:
VITE_API_URL=http://localhost:3000
```

#### Start Development Server
```bash
cd apps/web
npm run dev

# Frontend runs on http://localhost:5173
```

### 4. **Optional: Redis Setup** (For caching/sessions)

```bash
# Using Docker (already in docker-compose.yml)
docker-compose up -d redis

# Or install locally
# macOS: brew install redis
# Windows: Download from https://github.com/microsoftarchive/redis/releases
```

---

## 🔧 Step-by-Step Setup Guide

### Step 1: Start Database
```bash
# From root directory
docker-compose up -d postgres redis

# Wait 10 seconds for services to start
# Check status: docker ps
```

### Step 2: Configure Backend
```bash
cd apps/api

# Copy environment file
cp .env.example .env

# Edit .env if needed (default values work with docker-compose)
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_USER=postgres
# DATABASE_PASSWORD=postgres
# DATABASE_NAME=gym
```

### Step 3: Run Migrations
```bash
# Still in apps/api
npm run db:migrate

# You should see: "✓ X migrations executed successfully"
```

### Step 4: Seed Database (Optional)
```bash
npm run db:seed

# Creates sample: 1 gym, 4 users, 10 members, etc.
```

### Step 5: Start Backend
```bash
# Still in apps/api
npm run dev

# Output should show:
# [Nest] ... NestFactory bootstrapped successfully on port 3000
```

### Step 6: Start Frontend (New Terminal)
```bash
cd apps/web
npm run dev

# Output should show:
# VITE v... ready in ... ms
# ➜  Local: http://localhost:5173
```

### Step 7: Test the System
```bash
# Backend API
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gym.com", "password": "password", "gymId": "gym-uuid"}'
```

---

## 📋 Detailed Checklist

### Pre-Startup (Do This First)
- [ ] PostgreSQL running (check: `docker ps` or local service running)
- [ ] Redis running (optional but recommended)
- [ ] `.env` file created in `apps/api/`
- [ ] Database migrations completed (`npm run db:migrate`)
- [ ] Optional: Database seeded (`npm run db:seed`)

### Backend Startup
- [ ] Terminal open in `c:\GYM\apps\api`
- [ ] Run: `npm run dev`
- [ ] Wait for: "NestFactory bootstrapped successfully"
- [ ] Verify: `http://localhost:3000` responds

### Frontend Startup
- [ ] Terminal open in `c:\GYM\apps\web`
- [ ] Run: `npm run dev`
- [ ] Wait for: "ready in ... ms"
- [ ] Verify: `http://localhost:5173` opens

### Health Checks
- [ ] Backend responds to `GET http://localhost:3000/health` (if endpoint exists)
- [ ] Frontend loads at `http://localhost:5173`
- [ ] Database connection works (no connection errors in backend logs)
- [ ] API endpoints respond with proper auth errors (not 500)

---

## 🐳 Docker Setup (Recommended)

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# Check services running
docker ps

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Stop services
docker-compose down

# Stop and remove volumes (CAREFUL - deletes data)
docker-compose down -v
```

### Docker Compose Services
- **postgres:16** - Port 5432 (user: postgres, password: postgres)
- **redis:7** - Port 6379

---

## 🔑 Environment Variables

### apps/api/.env
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=gym
DATABASE_SYNCHRONIZE=false

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE_IN=15m

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@gym.com

# Stripe (Optional for now)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Environment
NODE_ENV=development
```

### apps/web/.env
```env
# API Configuration
VITE_API_URL=http://localhost:3000

# App
VITE_APP_NAME=Gym Management
```

---

## 🧪 Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/health
# Expected: 200 OK (or endpoint not implemented yet)
```

### List Members
```bash
curl http://localhost:3000/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
# Expected: 200 OK with member list (or 401 Unauthorized without token)
```

### Create Member
```bash
curl -X POST http://localhost:3000/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "membershipPlanId": "uuid"
  }'
# Expected: 201 Created
```

---

## 🆘 Troubleshooting

### Error: "Connection refused" on port 5432
**Solution**: 
- PostgreSQL not running
- Start with: `docker-compose up -d postgres`
- Or check `.env` DATABASE_HOST is correct

### Error: "Cannot find module '@nestjs/...'"
**Solution**:
```bash
cd c:\GYM
npm install
npm install --legacy-peer-deps  # If dependency issues
```

### Error: "Migration failed"
**Solution**:
- Check PostgreSQL is running
- Check `.env` database credentials
- Try: `npm run db:migrate:revert` then `npm run db:migrate`

### Error: "Port 3000 already in use"
**Solution**:
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port in code
```

### Error: "Cannot find module 'react'"
**Solution**:
```bash
cd apps/web
npm install
```

### API returns 401 Unauthorized
**Solution**:
- No JWT token provided
- Token expired (need to refresh)
- Token invalid/tampered
- See [AUTH.md](./AUTH.md) for login flow

---

## 📖 Next Steps After Startup

1. **Test Backend**
   - Try member endpoints (see [MEMBERS_QUICK_START.md](./MEMBERS_QUICK_START.md))
   - Test authentication (see [AUTH.md](./AUTH.md))
   - Review API docs (see [MEMBERS.md](./MEMBERS.md))

2. **Test Frontend** (Once built)
   - Login page
   - Member dashboard
   - Class booking
   - Admin panel

3. **Development**
   - Modify code and auto-reload will apply
   - Backend: changes auto-reload with `npm run dev`
   - Frontend: changes auto-reload with Vite

4. **Building for Production**
   ```bash
   # Backend
   cd apps/api
   npm run build

   # Frontend
   cd apps/web
   npm run build
   ```

---

## 📚 Important Files to Know

| File | Purpose |
|------|---------|
| `apps/api/src/main.ts` | Backend entry point |
| `apps/api/src/app.module.ts` | NestJS app configuration |
| `apps/web/src/main.tsx` | Frontend entry point |
| `apps/web/vite.config.ts` | Vite configuration |
| `.env` | Environment variables |
| `docker-compose.yml` | Docker services config |

---

## ✨ Success Indicators

When everything is running correctly:

```
✅ Backend starts without errors
   "NestFactory bootstrapped successfully on port 3000"

✅ Frontend loads
   "ready in XXX ms"

✅ Can make API calls
   GET /members returns 401 (no token) or member list

✅ No connection errors in logs
   No "ECONNREFUSED" or "ENOTFOUND"

✅ Database migrations completed
   "X migrations executed"
```

---

## 🚀 Quick Start Script

```bash
# From root directory
cd c:\GYM

# 1. Start database
docker-compose up -d postgres redis

# 2. Setup backend
cd apps/api
cp .env.example .env
npm run db:migrate
npm run db:seed

# 3. Start backend (keep running)
npm run dev

# 4. In NEW terminal: Start frontend
cd apps/web
npm run dev

# Done! 
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

---

## 📞 Support

- **Backend Issues**: Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **API Issues**: Check [MEMBERS.md](./MEMBERS.md) or [AUTH.md](./AUTH.md)
- **Database Issues**: Check [DATABASE.md](./DATABASE.md)
- **Setup Issues**: See Troubleshooting section above

---

**Status**: Ready to run after completing steps above  
**Estimated Setup Time**: 5-10 minutes  
**Latest Update**: August 25, 2026
