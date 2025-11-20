import { DataSource } from 'typeorm';
import { Task, User, Organization, TaskStatus } from '@task-management-system/data';

export async function seedTasks(dataSource: DataSource) {
  const taskRepo = dataSource.getRepository(Task);
  const userRepo = dataSource.getRepository(User);
  const orgRepo = dataSource.getRepository(Organization);

  // Get existing users and organization
  const owner = await userRepo.findOne({ where: { email: 'owner@acme.com' } });
  const admin = await userRepo.findOne({ where: { email: 'admin@acme.com' } });
  const viewer = await userRepo.findOne({ where: { email: 'viewer@acme.com' } });
  const organization = await orgRepo.findOne({ where: { name: 'Acme Corporation' } });

  if (!owner || !admin || !organization) {
    console.log('⚠️  Users or organization not found. Please run seed.ts first.');
    return;
  }

  // Check if tasks already exist
  const existingTasksCount = await taskRepo.count();
  if (existingTasksCount > 0) {
    console.log(`ℹ️  ${existingTasksCount} tasks already exist. Skipping task seeding.`);
    return;
  }

  // Task Management System Project Tasks
  const tasksToCreate = [
    // Frontend Development Tasks
    {
      title: 'Implement Angular Dashboard Layout',
      description: 'Create the main dashboard component with sidebar navigation, header, and responsive layout. Include dark mode support and smooth transitions.',
      status: TaskStatus.CLOSED,
      category: 'Frontend',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Build Task Card Component (Kanban View)',
      description: 'Design and implement the task card component for Kanban board view. Include title, description, category, priority indicators, assignee avatar, and quick action buttons (edit/delete).',
      status: TaskStatus.CLOSED,
      category: 'Frontend',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Create Task Form Modal (Create/Edit)',
      description: 'Build a comprehensive task creation and editing form with all fields: title, description, status dropdown, priority selector, category dropdown, assignee selection, and optional due date picker.',
      status: TaskStatus.CLOSED,
      category: 'Frontend',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Implement Drag and Drop for Kanban Board',
      description: 'Add drag and drop functionality to move tasks between workflow status columns. Include visual feedback, drop zones, and workflow validation to ensure only valid transitions are allowed.',
      status: TaskStatus.CLOSED,
      category: 'Frontend',
      priority: 4,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Build Workflow Diagram Component',
      description: 'Create an interactive workflow visualization showing all 10 statuses (New, Awaiting Approval, Awaiting Board Approval, To Do, In Progress, Verify, Closed, On Hold, Waiting for Customer, Waiting for Support) with clickable nodes and transition arrows.',
      status: TaskStatus.CLOSED,
      category: 'Frontend',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Implement Dark Mode Theme',
      description: 'Add dark mode support across all components with theme toggle button in header. Ensure proper color contrast and visibility for all UI elements including cards, forms, tables, and navigation.',
      status: TaskStatus.CLOSED,
      category: 'Frontend',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Create Task List Table View (Owner Only)',
      description: 'Build a comprehensive table view showing all tasks with columns: Title, Description, Category, Priority, Status, Assignee, Created By, Created At, Updated At, and Actions. Only visible to Owner role.',
      status: TaskStatus.CLOSED,
      category: 'Frontend',
      priority: 2,
      createdById: owner.id,
      assignedToId: owner.id,
      organizationId: organization.id,
    },
    {
      title: 'Add Task Filtering and Search',
      description: 'Implement search functionality by title/description and filters by status and category. Add filter cards with icons and responsive grid layout.',
      status: TaskStatus.CLOSED,
      category: 'Frontend',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },

    // Backend Development Tasks
    {
      title: 'Set up NestJS API Structure',
      description: 'Create the NestJS backend application with proper module structure (Auth, Users, Tasks, AuditLog, Notifications). Configure TypeORM with SQLite database and implement dependency injection.',
      status: TaskStatus.CLOSED,
      category: 'Backend',
      priority: 4,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Implement JWT Authentication',
      description: 'Set up JWT-based authentication with Passport.js. Create login endpoint, JWT strategy, and authentication guards. Include token validation and user payload extraction.',
      status: TaskStatus.CLOSED,
      category: 'Backend',
      priority: 4,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Build RBAC (Role-Based Access Control) System',
      description: 'Implement comprehensive RBAC with three roles: Owner, Admin, and Viewer. Create guards (JwtAuthGuard, RolesGuard, RbacGuard, OrganizationAccessGuard) and enforce permissions at endpoint and service levels.',
      status: TaskStatus.CLOSED,
      category: 'Backend',
      priority: 4,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Create Task CRUD API Endpoints',
      description: 'Implement full CRUD operations for tasks: POST /tasks (create), GET /tasks (list all), GET /tasks/:id (get one), PATCH /tasks/:id (update), DELETE /tasks/:id (delete). Include proper validation, error handling, and audit logging.',
      status: TaskStatus.CLOSED,
      category: 'Backend',
      priority: 4,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Implement Workflow Service',
      description: 'Create workflow service to manage task status transitions. Define valid transitions between 10 workflow statuses, validate transitions, and provide status formatting utilities.',
      status: TaskStatus.CLOSED,
      category: 'Backend',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Set up Audit Logging System',
      description: 'Implement audit logging for all user actions (CREATE, READ, UPDATE, DELETE) on tasks, users, and organizations. Store action type, resource, resource ID, user ID, and timestamp.',
      status: TaskStatus.CLOSED,
      category: 'Backend',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Create Database Seeding System',
      description: 'Build seed functions to populate database with initial data: organizations, users (Owner, Admin, Viewer), and sample tasks. Ensure idempotent seeding that can run multiple times safely.',
      status: TaskStatus.IN_PROGRESS,
      category: 'Backend',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },

    // Database Tasks
    {
      title: 'Design Database Schema',
      description: 'Design and implement database schema with TypeORM entities: User, Organization, Task, and AuditLog. Define relationships, foreign keys, indexes, and proper data types.',
      status: TaskStatus.CLOSED,
      category: 'Database',
      priority: 4,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Configure TypeORM with SQLite',
      description: 'Set up TypeORM configuration for SQLite database. Enable synchronize mode for development, configure entity paths, and set up proper connection options.',
      status: TaskStatus.CLOSED,
      category: 'Database',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Add Task Status Enum to Database',
      description: 'Update Task entity to support all 10 workflow statuses: new, awaiting_approval, awaiting_board_approval, todo, in_progress, verify, closed, on_hold, waiting_for_customer, waiting_for_support.',
      status: TaskStatus.CLOSED,
      category: 'Database',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },

    // Authentication & Security
    {
      title: 'Implement User Registration and Login',
      description: 'Create user registration and login endpoints with password hashing using bcrypt. Validate email format, enforce password requirements, and return JWT tokens upon successful authentication.',
      status: TaskStatus.CLOSED,
      category: 'Authentication',
      priority: 4,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Add Password Reset Functionality',
      description: 'Implement password reset flow with email verification tokens. Create endpoints for requesting password reset and resetting password with token validation.',
      status: TaskStatus.TODO,
      category: 'Authentication',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Implement Session Management',
      description: 'Add session tracking with last login timestamps. Store user sessions and implement logout functionality that invalidates tokens.',
      status: TaskStatus.TODO,
      category: 'Authentication',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },

    // UI/UX Tasks
    {
      title: 'Design Modern Kanban Board UI',
      description: 'Create a visually appealing Kanban board with 10 columns representing workflow statuses. Include column headers with status indicators, task counts, and empty state messages.',
      status: TaskStatus.CLOSED,
      category: 'Design',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Implement Responsive Design',
      description: 'Ensure all components are fully responsive for mobile, tablet, and desktop views. Add proper breakpoints, collapsible sidebar, and touch-friendly interactions.',
      status: TaskStatus.CLOSED,
      category: 'Design',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Add Loading States and Animations',
      description: 'Implement loading spinners, skeleton screens, and smooth transitions for better user experience. Add fade-in animations for modals and task cards.',
      status: TaskStatus.VERIFY,
      category: 'Design',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Create Priority Color Coding System',
      description: 'Implement visual priority indicators: Urgent (red), High (orange), Medium (amber), Low (green). Apply colors to task cards, badges, and borders for quick visual recognition.',
      status: TaskStatus.CLOSED,
      category: 'Design',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },

    // Testing Tasks
    {
      title: 'Write Unit Tests for Task Service',
      description: 'Create comprehensive unit tests for TasksService covering all CRUD operations, role-based access control, and workflow validation. Use Jest and mock repositories.',
      status: TaskStatus.TODO,
      category: 'Testing',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Add Integration Tests for API Endpoints',
      description: 'Write integration tests for all task-related API endpoints. Test authentication, authorization, request validation, and response formats.',
      status: TaskStatus.TODO,
      category: 'Testing',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Test Workflow Transitions',
      description: 'Create test cases for all valid and invalid workflow status transitions. Verify that only allowed transitions are permitted and invalid ones are rejected.',
      status: TaskStatus.TODO,
      category: 'Testing',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },

    // Documentation Tasks
    {
      title: 'Write API Documentation',
      description: 'Document all API endpoints with request/response examples, authentication requirements, error codes, and usage instructions. Include OpenAPI/Swagger specification.',
      status: TaskStatus.IN_PROGRESS,
      category: 'Documentation',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Create User Guide',
      description: 'Write comprehensive user guide explaining how to use the task management system: creating tasks, assigning users, changing statuses, filtering, and using the Kanban board.',
      status: TaskStatus.TODO,
      category: 'Documentation',
      priority: 1,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Document RBAC Permissions',
      description: 'Create detailed documentation explaining role-based access control: what each role (Owner, Admin, Viewer) can and cannot do, with permission matrix tables.',
      status: TaskStatus.CLOSED,
      category: 'Documentation',
      priority: 2,
      createdById: owner.id,
      assignedToId: owner.id,
      organizationId: organization.id,
    },

    // Feature Enhancement Tasks
    {
      title: 'Add Task Comments System',
      description: 'Implement a commenting system for tasks where users can add comments, reply to comments, and receive notifications. Include comment timestamps and user attribution.',
      status: TaskStatus.AWAITING_APPROVAL,
      category: 'Feature',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Implement Task Attachments',
      description: 'Add file upload functionality for tasks. Allow users to attach documents, images, and other files. Include file size limits, type validation, and storage management.',
      status: TaskStatus.AWAITING_BOARD_APPROVAL,
      category: 'Feature',
      priority: 3,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Add Task Dependencies',
      description: 'Implement task dependency system where tasks can depend on other tasks. Show dependency chains, block task completion until dependencies are met, and visualize in workflow.',
      status: TaskStatus.NEW,
      category: 'Feature',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Create Task Templates',
      description: 'Allow users to create and save task templates for recurring task types. Include template library, quick task creation from templates, and template sharing within organization.',
      status: TaskStatus.NEW,
      category: 'Feature',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Implement Task Time Tracking',
      description: 'Add time tracking functionality to tasks. Allow users to log time spent, set estimated hours, track billable time, and generate time reports.',
      status: TaskStatus.ON_HOLD,
      category: 'Feature',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Add Task Recurrence',
      description: 'Implement recurring task functionality. Allow tasks to repeat daily, weekly, monthly, or custom intervals. Automatically create new task instances based on recurrence rules.',
      status: TaskStatus.WAITING_FOR_CUSTOMER,
      category: 'Feature',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
    {
      title: 'Create Task Analytics Dashboard',
      description: 'Build analytics dashboard showing task completion rates, average time to completion, status distribution, team productivity metrics, and custom date range reports.',
      status: TaskStatus.WAITING_FOR_SUPPORT,
      category: 'Feature',
      priority: 2,
      createdById: owner.id,
      assignedToId: admin.id,
      organizationId: organization.id,
    },
  ];

  // Create all tasks
  for (const taskData of tasksToCreate) {
    const task = taskRepo.create(taskData);
    await taskRepo.save(task);
  }

  console.log(`✅ Successfully seeded ${tasksToCreate.length} tasks!`);
  console.log('📋 Tasks created across different categories:');
  console.log(`   - Frontend: ${tasksToCreate.filter(t => t.category === 'Frontend').length} tasks`);
  console.log(`   - Backend: ${tasksToCreate.filter(t => t.category === 'Backend').length} tasks`);
  console.log(`   - Database: ${tasksToCreate.filter(t => t.category === 'Database').length} tasks`);
  console.log(`   - Authentication: ${tasksToCreate.filter(t => t.category === 'Authentication').length} tasks`);
  console.log(`   - Design: ${tasksToCreate.filter(t => t.category === 'Design').length} tasks`);
  console.log(`   - Testing: ${tasksToCreate.filter(t => t.category === 'Testing').length} tasks`);
  console.log(`   - Documentation: ${tasksToCreate.filter(t => t.category === 'Documentation').length} tasks`);
  console.log(`   - Feature: ${tasksToCreate.filter(t => t.category === 'Feature').length} tasks`);
}

