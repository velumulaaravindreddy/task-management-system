import { TaskStatus } from '../enums';

export interface WorkflowNode {
  status: TaskStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
  position: { x: number; y: number };
}

export interface WorkflowTransition {
  from: TaskStatus;
  to: TaskStatus;
  label?: string;
}

export interface WorkflowConfig {
  nodes: WorkflowNode[];
  transitions: WorkflowTransition[];
}

