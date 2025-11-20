# Task Management System

## Setup Instructions
1. Install & configure:
   ```bash
   npm install
   cp .env.example .env
   ```
   `.env` must include at least:
   ```text
   JWT_SECRET=change-me
   DATABASE_URL=sqlite://task-management.db
   ```
2. Run backend:
   ```bash
   npm run start:api
   ```
   Serves `http://localhost:3000` and seeds demo Owner/Admin/Viewer accounts on first launch.
3. Run frontend:
   ```bash
   npm run start:dashboard
   ```
   Serves `http://localhost:4200`; log in with any seeded account.

## Architecture Overview
- **NX Monorepo:** `apps/api` (NestJS) and `apps/dashboard` (Angular) share tooling, lint/test, and CI.
- **Shared Libraries:** `libs/data` exposes DTOs/entities/enums; `libs/auth` centralizes RBAC guards, decorators, and interfaces so both sides enforce identical rules.

## Data Model Explanation
- Entities: `User` (role, org), `Organization` (supports parent/child hierarchy), `Task` (status, priority, dueDate, creator, assignee), `AuditLog` (action, resource, actor, metadata).
- ERD (simplified):
  ```text
  Organization 1─N User 1─N Task 1─N AuditLog
  Task ──(optional)──> User (assignee)
  ```

## Access Control Implementation
- **Roles:** Owner (full control), Admin (manage tasks & audits), Viewer (read-only).
- **Organization scoping:** every task/audit row stores `organizationId`; guards reject cross-org access.
- **JWT auth:** login issues a JWT containing user id, role, and organization id. `JwtAuthGuard` validates the token, `RolesGuard`/`RbacGuard` enforce role + org rules, and controllers use `@CurrentUser()` to read claims.

## API Docs
- Base URL: `http://localhost:3000`
- Key endpoints:
  | Method | Path            | Description                          |
  |--------|-----------------|--------------------------------------|
  | POST   | `/auth/login`   | Obtain JWT                           |
  | GET    | `/tasks`        | List tasks in user’s organization    |
  | POST   | `/tasks`        | Create task (Owner/Admin)            |
  | PATCH  | `/tasks/:id`    | Update task (Owner/Admin)            |
  | DELETE | `/tasks/:id`    | Remove task (Owner/Admin)            |
  | GET    | `/audit-log`    | View audit entries (Owner/Admin)     |
  | GET    | `/users/me`     | Fetch current user profile           |
- Example request:
  ```http
  POST /auth/login
  Content-Type: application/json

  { "email": "owner@acme.com", "password": "owner123" }
  ```
- Example response:
  ```json
  { "access_token": "jwt", "user": { "id": "uuid", "role": "Owner", "organizationId": "org-1" } }
  ```

## Future Considerations
- **Advanced role delegation:** temporary grants, project-scoped permissions, approval workflows.
- **Production security:** JWT refresh tokens with rotation, CSRF protection for dashboard actions, and caching RBAC decisions (e.g., Redis) to reduce DB lookups.
- **Scalable permission checks:** precompute allowed resource sets, use policy engines (OPA/Cerbos), or layer memoized ACL checks close to the services to keep authorization O(1) even as orgs grow.

