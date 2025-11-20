import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { TaskStatus } from '../enums';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'simple-enum',
    enum: TaskStatus,
    default: TaskStatus.NEW,
  })
  status!: TaskStatus;

  @Column({ nullable: true })
  category?: string;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date;

  @Column()
  createdById!: string;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @Column({ nullable: true })
  assignedToId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User;

  @Column()
  organizationId!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}

