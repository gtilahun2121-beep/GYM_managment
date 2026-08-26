# Docker Quick Start for Gym Management System

**Fastest way to run the system WITH Docker**

---

## ⚡ 3 Steps to Run with Docker

### Step 1: Install Docker Desktop
```
Download: https://www.docker.com/products/docker-desktop
Follow: DOCKER_INSTALLATION_GUIDE.md
```

**Or read [DOCKER_INSTALLATION_GUIDE.md](./DOCKER_INSTALLATION_GUIDE.md) for detailed instructions.**

### Step 2: Start Services
```powershell
cd c:\GYM
docker-compose up -d
```

This starts:
- **PostgreSQL** on localhost:5432
- **Redis** on localhost:6379

### Step 3: Setup Database
```powershell
.\setup-db.ps1
```

Then start servers:
```powershell
.\start-backend.ps1    # Terminal 1
.\start-frontend.ps1   # Terminal 2
```

---

## 🎯 What Happens with Docker

### Services Started by `docker-compose up -d`

| Service | Port | Usage |
|---------|------|-------|
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Caching (optional) |

### Data Persistence

Docker volumes ensure data persists:
```powershell
# Data survives container restart
docker-compose down
docker-compose up -d

# Data still there!
```

---

## 🚀 Common Docker Commands

```powershell
# Start services in background
docker-compose up -d

# View running services
docker ps

# View logs
docker-compose logs

# Stop services
docker-compose down

# Stop and remove data (CAREFUL!)
docker-compose down -v

# Restart services
docker-compose restart

# View PostgreSQL logs
docker-compose logs postgres

# Access PostgreSQL directly
docker-compose exec postgres psql -U postgres

# View Redis info
docker-compose logs redis
```

---

## ✅ Verify Docker is Working

```powershell
# Check services running
docker ps

# Should show:
# CONTAINER ID   NAMES      STATUS
# xxxxxxxx       postgres   Up 2 minutes
# xxxxxxxx       redis      Up 2 minutes
```

---

## 🔄 With vs Without Docker

### With Docker ✅ (Recommended)
```powershell
docker-compose up -d          # Services start
.\setup-db.ps1                # Setup database
.\start-backend.ps1           # Start backend
.\start-frontend.ps1          # Start frontend
```

**Advantages:**
- No local PostgreSQL needed
- Easy to manage services
- Reproducible environment
- Simple cleanup

### Without Docker
```powershell
# Install PostgreSQL locally first
# Then:
.\setup-db.ps1
.\start-backend.ps1
.\start-frontend.ps1
```

**Advantages:**
- No Docker overhead
- Native database
- Direct control

---

## 🔧 Configuration with Docker

### Default Connection String
```env
DATABASE_HOST=postgres    # Docker service name
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=gym_db
```

### Manual Connection
```powershell
# Connect to PostgreSQL in Docker
docker-compose exec postgres psql -U postgres -d gym_db

# List tables
\dt

# Exit
\q
```

---

## 🛑 Stop Services

```powershell
# Graceful stop (data preserved)
docker-compose down

# Hard stop (may lose data)
docker-compose kill

# Stop and remove volumes (DELETE DATA!)
docker-compose down -v
```

---

## 🐛 Common Issues

### "Docker daemon not running"
```powershell
# Start Docker Desktop
# Check system tray for Docker icon
```

### "Port 5432 already in use"
```powershell
# Option 1: Stop Docker services
docker-compose down

# Option 2: Kill conflicting process
netstat -ano | findstr :5432
taskkill /PID <PID> /F

# Option 3: Change port in docker-compose.yml
# Change "5432:5432" to "5433:5432"
```

### "Cannot connect to database"
```powershell
# Check if services are running
docker ps

# Check logs
docker-compose logs postgres

# Restart services
docker-compose down
docker-compose up -d
```

---

## 📊 System Architecture with Docker

```
Your Computer
├── Docker Desktop (WSL 2 or Hyper-V)
│   ├── PostgreSQL Container (port 5432)
│   └── Redis Container (port 6379)
├── Node.js Backend (port 3000)
└── Node.js Frontend (port 5173)
```

---

## ✨ Complete Flow

```powershell
# 1. Install Docker (one-time)
#    Download from docker.com and install

# 2. Start services
cd c:\GYM
docker-compose up -d

# 3. Verify services
docker ps

# 4. Setup database
.\setup-db.ps1

# 5. Start backend
.\start-backend.ps1

# 6. Start frontend (new terminal)
.\start-frontend.ps1

# 7. Visit
#    Frontend: http://localhost:5173
#    Backend:  http://localhost:3000
```

---

## 📚 References

- [DOCKER_INSTALLATION_GUIDE.md](./DOCKER_INSTALLATION_GUIDE.md) - Full Docker setup
- [READY_TO_RUN.md](./READY_TO_RUN.md) - System setup guide
- [docker-compose.yml](./docker-compose.yml) - Service configuration
- [Official Docker Docs](https://docs.docker.com/) - Docker documentation

---

## 🎯 Quick Decision

**Use Docker if:**
- ✅ You want to avoid installing PostgreSQL locally
- ✅ You want services to be isolated
- ✅ You want easy cleanup
- ✅ You might use Docker for other projects

**Use Local PostgreSQL if:**
- ✅ You already have PostgreSQL installed
- ✅ You want minimal overhead
- ✅ You prefer native database
- ✅ Docker is problematic on your system

---

**Next**: Read [DOCKER_INSTALLATION_GUIDE.md](./DOCKER_INSTALLATION_GUIDE.md) for detailed installation steps!

*Docker is optional but highly recommended for development.*
