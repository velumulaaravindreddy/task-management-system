import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { Task } from './task.entity';
import { Role, UserStatus } from '../enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    type: 'simple-enum',
    enum: Role,
    default: Role.VIEWER,
  })
  role!: Role;

  @Column({ nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, (org) => org.users, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @OneToMany(() => Task, (task) => task.createdBy)
  tasks!: Task[];

  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks!: Task[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @Column({
    type: 'simple-enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ type: 'datetime', nullable: true })
  lastLogin?: Date;
}

