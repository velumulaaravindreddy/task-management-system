import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Organization, Role } from '@task-management-system/data';

export async function seedDatabase(dataSource: DataSource) {
  const orgRepo = dataSource.getRepository(Organization);
  const userRepo = dataSource.getRepository(User);

  // Create or get organizations
  let savedParentOrg = await orgRepo.findOne({ where: { name: 'Acme Corporation' } });
  if (!savedParentOrg) {
    const parentOrg = orgRepo.create({
      name: 'Acme Corporation',
    });
    savedParentOrg = await orgRepo.save(parentOrg);
  }

  let savedChildOrg = await orgRepo.findOne({ where: { name: 'Acme Subsidiary' } });
  if (!savedChildOrg) {
    const childOrg = orgRepo.create({
      name: 'Acme Subsidiary',
      parentId: savedParentOrg.id,
    });
    savedChildOrg = await orgRepo.save(childOrg);
  }

  // Hash passwords
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const viewerPassword = await bcrypt.hash('viewer123', 10);

  // Create or update users - ensure all three exist
  const usersToCreate = [
    {
      email: 'owner@acme.com',
      password: ownerPassword,
      firstName: 'Aravind',
      lastName: 'Reddy',
      role: Role.OWNER,
      organizationId: savedParentOrg.id,
    },
    {
      email: 'admin@acme.com',
      password: adminPassword,
      firstName: 'Jane',
      lastName: 'Admin',
      role: Role.ADMIN,
      organizationId: savedParentOrg.id,
    },
    {
      email: 'viewer@acme.com',
      password: viewerPassword,
      firstName: 'Bob',
      lastName: 'Viewer',
      role: Role.VIEWER,
      organizationId: savedParentOrg.id,
    },
  ];

  for (const userData of usersToCreate) {
    const existingUser = await userRepo.findOne({ where: { email: userData.email } });
    
    if (existingUser) {
      // Update existing user with correct password and role
      existingUser.password = userData.password;
      existingUser.role = userData.role;
      existingUser.firstName = userData.firstName;
      existingUser.lastName = userData.lastName;
      existingUser.organizationId = userData.organizationId;
      await userRepo.save(existingUser);
      console.log(`✅ Updated user: ${userData.email}`);
    } else {
      // Create new user
      const user = userRepo.create(userData);
      await userRepo.save(user);
      console.log(`✅ Created user: ${userData.email}`);
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Test users available:');
  console.log('   👑 Owner: owner@acme.com / owner123');
  console.log('   🔧 Admin: admin@acme.com / admin123');
  console.log('   👁️  Viewer: viewer@acme.com / viewer123');
}

