# Docker Installation Guide for Windows

**Last Updated**: August 25, 2026  
**Windows Versions Supported**: Windows 10 Pro/Enterprise or Windows 11

---

## 📋 System Requirements

### Minimum Requirements
- **Processor**: 64-bit with Second Level Address Translation (SLAT)
- **RAM**: 8GB minimum (16GB recommended)
- **Windows Version**: 
  - Windows 10 64-bit: Pro, Enterprise, or Education (build 22H2 or later)
  - Windows 11 64-bit: Pro, Enterprise, or Education (build 22631 or later)
- **Virtualization**: Must be enabled in BIOS/UEFI

### Not Supported
- Windows 10/11 Home Edition (can only run Linux containers via WSL 2)
- Windows Server editions (2019, 2022, etc.)

---

## ✅ Pre-Installation Checklist

Before installing Docker, verify:

- [ ] Windows version is Pro, Enterprise, or Education (not Home)
- [ ] You have 8GB+ RAM free
- [ ] You have administrator privileges
- [ ] Your system supports virtualization (check BIOS)

### Check Your Windows Version

Press `Win + R`, type `winver`, and press Enter. Look for:
- **Edition**: Pro, Enterprise, or Education
- **OS Build**: 22H2 for Windows 10, or 22631+ for Windows 11

If you have **Windows Home**, skip to the WSL 2 alternative section below.

---

## 🚀 Installation Steps

### Step 1: Enable Virtualization in BIOS

1. Restart your computer
2. Press `F2`, `F10`, `Del`, or `Esc` during startup (varies by manufacturer)
3. Look for settings named:
   - "Virtualization"
   - "VT-x" (Intel) or "AMD-V" (AMD)
   - "SVM Mode"
4. Enable the option
5. Save and exit

### Step 2: Download Docker Desktop

**Option A: Direct Download** (Recommended)
1. Visit: https://www.docker.com/products/docker-desktop
2. Click **Download for Windows**
3. Choose your architecture:
   - **x86_64** (most common)
   - **ARM** (newer Apple Silicon-based systems)
4. Save the `.exe` file

**Option B: Microsoft Store**
1. Open Microsoft Store
2. Search for "Docker"
3. Install "Docker Desktop"

### Step 3: Install Docker Desktop

1. Open the downloaded `.exe` file (or launch from Store)
2. Click **Install**
3. When prompted, choose installation mode:
   - **Per-user** (recommended) - No admin rights needed
   - **All users** - Requires admin, enables Hyper-V
4. Click **Continue**
5. Review the Service Agreement
6. Click **Accept & Install**
7. Installation begins (may take 5-10 minutes)
8. When complete, click **Finish**
9. Restart your computer

### Step 4: First Launch

1. After restart, Docker Desktop will start automatically
2. Look for the Docker icon in the system tray (bottom right)
3. Wait for status to show "Docker Desktop is running"

---

## ✨ Verify Installation

### Via PowerShell

```powershell
# Check Docker version
docker --version

# Should output: Docker version 25.x.x or higher

# Check Docker Compose version
docker compose version

# Should output: Docker Compose version v2.x.x or higher

# Test with hello-world
docker run hello-world

# Should download and run successfully
```

### Via Docker Desktop UI

1. Docker icon in system tray
2. Click it
3. Look for "Docker Desktop is running"

---

## 🔧 Configuration

### For Gym Management System

After Docker is installed, the `docker-compose up` command will work:

```powershell
cd c:\GYM
docker-compose up -d

# Starts PostgreSQL and Redis
# Services available at:
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Backend Environment

If using Docker, update `.env`:

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=gym_db
```

---

## 🐛 Troubleshooting

### "Docker daemon is not running"
**Solution:**
```powershell
# Start Docker Desktop
# Or use WSL 2 mode (default)
# Check system tray for Docker icon
```

### "Port 5432 already in use"
**Solution:**
```powershell
# Either:
# 1. Stop other PostgreSQL instances
# 2. Use different port in docker-compose.yml
# 3. Stop containers: docker-compose down
```

### "WSL 2 installation incomplete"
**Solution:**
1. Install WSL 2: https://aka.ms/wsl2kernel
2. Set WSL 2 as default: `wsl --set-default-version 2`
3. Restart Docker Desktop

### "Insufficient memory"
**Solution:**
- Increase Docker Desktop allocated memory
- Docker Desktop → Settings → Resources → Memory
- Set to 6-8GB minimum

### "Virtualization not enabled"
**Solution:**
- Enable in BIOS (see Step 1 above)
- Or enable Hyper-V on Windows
- Run PowerShell as admin: `Enable-WindowsOptionalFeature -FeatureName Hyper-V -Online -All`

### "Permission denied"
**Solution:**
```powershell
# Use per-user installation (recommended)
# Or restart Docker Desktop
# Or add your user to docker group (admin mode):
# docker run --rm --privileged alpine chown -R nobody:nogroup /var/lib/docker
```

---

## 🎯 For Gym Management System

Once Docker is installed:

```powershell
cd c:\GYM

# Start all services
docker-compose up -d

# Verify services running
docker ps

# View logs
docker-compose logs

# Stop services
docker-compose down
```

---

## 📊 Docker Desktop Modes

### WSL 2 (Recommended)
- Default backend
- Better performance
- No admin rights needed (per-user install)
- Supports Linux containers only
- Works on Windows 10/11 Home+ (with WSL 2)

### Hyper-V
- Traditional Docker backend
- Requires Windows Pro+ 
- Requires admin rights
- Supports both Linux and Windows containers
- Slightly more resource-heavy

### Docker VMM (Beta)
- Newest option
- Better memory management
- Improved file I/O
- Requires Windows 11

---

## 🔐 Security

After installation, Docker runs as a service. Best practices:

```powershell
# Don't run containers as root unnecessarily
# Use minimal base images
# Scan images for vulnerabilities
docker scan image-name

# Keep Docker updated
# Updates available via Docker Desktop UI
```

---

## 📱 Alternative: Without Docker

If you cannot install Docker, use local PostgreSQL:

```powershell
# Install PostgreSQL locally
# https://www.postgresql.org/download/

# Then use .\setup-db.ps1 script
cd c:\GYM
.\setup-db.ps1
```

---

## ✅ Verification Checklist

After installation:

- [ ] `docker --version` shows v25+
- [ ] `docker compose version` shows v2+
- [ ] `docker run hello-world` succeeds
- [ ] Docker Desktop starts automatically
- [ ] System tray shows Docker running

---

## 🚀 Next Steps

After Docker is installed:

```powershell
cd c:\GYM
docker-compose up -d

# Then proceed with .\setup-db.ps1
.\setup-db.ps1
```

---

## 📞 Support

### Official Resources
- [Docker Documentation](https://docs.docker.com/)
- [Docker on Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- [WSL 2 Setup](https://docs.docker.com/desktop/features/wsl/)

### For Gym Management System
- [READY_TO_RUN.md](./READY_TO_RUN.md)
- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)

---

**Installation time**: 15-20 minutes  
**Difficulty**: Easy  
**Required for**: Using docker-compose with local services

Once complete, you can use `docker-compose up -d` to start PostgreSQL and Redis automatically!
