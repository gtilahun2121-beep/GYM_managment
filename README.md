# Gym Management Web Application System

A comprehensive, scalable web application for managing fitness centers with digital membership, class scheduling, payments, and member engagement.

## Project Overview

This monorepo contains the complete gym management system built with:

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Zustand
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Database**: PostgreSQL with Redis caching
- **Payments**: Stripe integration
- **Infrastructure**: Docker, Kubernetes, Terraform

## Project Structure

```
gym-management-system/
├── apps/
│   ├── api/              # NestJS backend application
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules
│   │   │   ├── common/   # Shared utilities
│   │   │   └── database/ # Database config
│   │   └── package.json
│   └── web/              # React frontend application
│       ├── src/
│       │   ├── pages/    # Page components
│       │   ├── components/
│       │   ├── store/    # Zustand stores
│       │   └── api/      # API client
│       └── package.json
├── packages/
│   └── shared-types/     # Shared TypeScript types
└── package.json          # Monorepo root
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 16+
- Docker & Docker Compose (for containerized development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd gym-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. **Start PostgreSQL:**
   ```bash
   # Using Docker
   docker-compose up -d postgres redis
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start development servers:**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000
   - API Docs: http://localhost:3000/api/docs

## Available Scripts

### Development

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages for production
- `npm run lint` - Lint all packages
- `npm run typecheck` - Type check all packages
- `npm run test` - Run tests
- `npm run db:migrate` - Run pending migrations
- `npm run db:seed` - Seed database with sample data

### Backend Specific

- `cd apps/api && npm run dev` - Start only backend
- `cd apps/api && npm run db:generate-migration -- -n MigrationName` - Create migration

### Frontend Specific

- `cd apps/web && npm run dev` - Start only frontend
- `cd apps/web && npm run build` - Build frontend

## Architecture Overview

### Backend Architecture

The NestJS backend follows a modular architecture:

```
Backend Modules:
- Auth: JWT authentication, authorization
- Users: User management
- Members: Member profiles, subscriptions
- Classes: Class types, scheduling, rooms
- Bookings: Class bookings, waitlist management
- Payments: Stripe integration, billing
- CheckIns: QR code check-in, attendance
- Workouts: Exercise library, workout plans
- Notifications: Email, SMS, push notifications
- Analytics: Revenue, attendance, member insights
```

### Frontend Architecture

The React frontend uses:

- **Routing**: React Router v6 for navigation
- **State Management**: Zustand for auth and data stores
- **API**: Axios with interceptors for JWT refresh
- **Styling**: Tailwind CSS for responsive UI
- **Components**: Reusable, composable components

## Database Schema

The PostgreSQL database includes 15+ tables:

- `gyms` - Multi-tenancy root
- `users` - Auth & identity
- `members` - Member profiles
- `membership_plans` - Subscription tiers
- `membership_subscriptions` - Active subscriptions
- `class_types` - Class templates
- `class_sessions` - Scheduled classes
- `bookings` - Class reservations
- `waitlist_entries` - Waitlist management
- `payments` - Transaction history
- `check_ins` - Attendance tracking
- `exercises` - Exercise library
- `workout_plans` - Workout programs
- `member_progress` - Body composition tracking
- `notifications` - Communication audit trail

## API Documentation

Swagger/OpenAPI documentation is available at:

```
http://localhost:3000/api/docs
```

### Key API Endpoints

**Authentication:**
- `POST /auth/register` - Register new member
- `POST /auth/login` - Authenticate user
- `POST /auth/refresh` - Refresh access token

**Members:**
- `GET /members` - List members
- `GET /members/:id` - Get member details
- `POST /members/:id/progress` - Log progress

**Classes:**
- `GET /schedule` - Get class schedule
- `POST /schedule/:sessionId/book` - Book a class
- `DELETE /bookings/:id` - Cancel booking

**Payments:**
- `POST /payments/subscribe` - Start subscription
- `GET /invoices` - Get invoices

**Analytics:**
- `GET /analytics/dashboard` - Dashboard KPIs
- `GET /analytics/revenue` - Revenue reports
- `GET /analytics/attendance` - Attendance data

## Security

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- HTTPS/TLS encryption
- GDPR/CCPA compliance
- PCI DSS compliant payment handling

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up
```

### Kubernetes Deployment

```bash
# Deploy to K8s
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl logs -f deployment/gym-api
```

### Terraform Infrastructure

```bash
# Initialize
terraform init

# Plan
terraform plan

# Deploy
terraform apply
```

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://user:pass@localhost/gym_system
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
SMTP_HOST=smtp.gmail.com
NODE_ENV=development
PORT=3000
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000/v1
VITE_APP_NAME=Gym Management System
```

## Performance Optimization

- Database indexing on frequently queried fields
- Redis caching for sessions and data
- Pagination for large datasets
- CDN for static assets
- Image optimization and lazy loading
- Code splitting and tree shaking

## Monitoring & Logging

- Sentry for error tracking
- Datadog for APM and metrics
- Structured logging with Winston
- Health check endpoints
- Performance monitoring

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open pull request

## License

Proprietary - All rights reserved

## Support

For support, contact: support@gym-system.com

## Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] AI-powered workout recommendations
- [ ] IoT equipment integration
- [ ] White-label franchise module
- [ ] Advanced biometric tracking
- [ ] Social community features


## Development Roadmap (30 Tasks)

### Completed ✅ (5/30)

- **Task #1**: Project setup - Monorepo structure with frontend, backend, shared packages
- **Task #2**: Database - PostgreSQL schema with 17 tables (gyms, users, members, classes, bookings, payments, etc.)
- **Task #3**: Backend Auth - JWT + refresh token system with role-based access control (5 roles)
- **Task #4**: Backend Auth - Password reset, email verification, TOTP MFA, backup codes
- **Task #5**: Backend Member Management - CRUD operations, profiles, family accounts, referral tracking

### In Progress 🔄

- **Task #6**: Backend Class Scheduling - Class types, recurring sessions, room allocation, trainer assignment

### Pending 📋 (25/30)

- **Tasks #7-12**: Bookings, Check-ins, Payments, Workouts, Notifications, Analytics (Backend)
- **Tasks #13-22**: Frontend pages for Auth, Member Portal, Class Booking, Check-in, Payments, Progress, Trainer Portal, Admin Dashboard, Analytics, Notifications
- **Tasks #23-30**: API Documentation, CI/CD, DevOps, Testing, Security, Performance, Deployment, Documentation

## Key Features Implemented

### Authentication & Security
- JWT-based authentication with access/refresh tokens
- Role-based access control (RBAC) with 5 roles
- Multi-factor authentication (TOTP) with backup codes
- Email verification with time-limited tokens
- Password reset with security validation
- Request logging middleware for audit trail
- GDPR compliance considerations

### Member Management
- Complete CRUD operations for members
- Member profile management (personal info, health notes, fitness goals)
- Family account linking (parent-child relationships)
- Referral code generation and tracking
- Automatic referral reward calculation ($10/active referral)
- Member activity statistics
- QR code generation for check-ins
- Membership suspension/resumption

### Database
- 17 tables with proper relationships
- Multi-tenant architecture (gym isolation)
- Strategic indexes for performance
- Soft delete support via metadata
- JSONB for flexible metadata storage

## Documentation

- [AUTH.md](./AUTH.md) - Authentication architecture and implementation
- [ADVANCED_AUTH.md](./ADVANCED_AUTH.md) - Advanced auth features (MFA, email verification, password reset)
- [DATABASE.md](./DATABASE.md) - Database schema, ERD, and optimization strategies
- [MEMBERS.md](./MEMBERS.md) - Member management API and business logic

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

Proprietary - All rights reserved
