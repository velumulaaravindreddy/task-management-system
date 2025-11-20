import { Injectable } from '@angular/core';
import { TaskStatus, WorkflowNode, WorkflowTransition, WorkflowConfig } from '../../../../../libs/data/src/index-frontend';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private workflowConfig: WorkflowConfig = {
    nodes: [
      {
        status: TaskStatus.NEW,
        label: 'New',
        color: '#6366f1',
        bgColor: '#eef2ff',
        borderColor: '#6366f1',
        icon: 'NEW',
        description: 'Task freshly created',
        position: { x: 0, y: 0 },
      },
      {
        status: TaskStatus.AWAITING_APPROVAL,
        label: 'Awaiting Approval',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        borderColor: '#f59e0b',
        icon: 'APR',
        description: 'Waiting for manager approval',
        position: { x: 220, y: 0 },
      },
      {
        status: TaskStatus.AWAITING_BOARD_APPROVAL,
        label: 'Awaiting Board Approval',
        color: '#d97706',
        bgColor: '#fed7aa',
        borderColor: '#d97706',
        icon: 'BRD',
        description: 'Higher-level approval flow',
        position: { x: 440, y: 0 },
      },
      {
        status: TaskStatus.TODO,
        label: 'To Do',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        borderColor: '#6b7280',
        icon: 'TODO',
        description: 'Ready to be worked on',
        position: { x: 660, y: 0 },
      },
      {
        status: TaskStatus.IN_PROGRESS,
        label: 'In Progress',
        color: '#3b82f6',
        bgColor: '#dbeafe',
        borderColor: '#3b82f6',
        icon: 'PROG',
        description: 'Developer/assignee is actively working',
        position: { x: 880, y: 0 },
      },
      {
        status: TaskStatus.VERIFY,
        label: 'Verify',
        color: '#8b5cf6',
        bgColor: '#ede9fe',
        borderColor: '#8b5cf6',
        icon: 'QA',
        description: 'QA/testing or validation phase',
        position: { x: 1100, y: 0 },
      },
      {
        status: TaskStatus.CLOSED,
        label: 'Closed',
        color: '#10b981',
        bgColor: '#d1fae5',
        borderColor: '#10b981',
        icon: 'DONE',
        description: 'Completed + locked',
        position: { x: 1320, y: 0 },
      },
      {
        status: TaskStatus.ON_HOLD,
        label: 'On Hold',
        color: '#ef4444',
        bgColor: '#fee2e2',
        borderColor: '#ef4444',
        icon: 'HOLD',
        description: 'Temporarily paused',
        position: { x: 220, y: 200 },
      },
      {
        status: TaskStatus.WAITING_FOR_CUSTOMER,
        label: 'Waiting for Customer',
        color: '#a855f7',
        bgColor: '#f3e8ff',
        borderColor: '#a855f7',
        icon: 'CUST',
        description: 'Waiting for customer response',
        position: { x: 880, y: 200 },
      },
      {
        status: TaskStatus.WAITING_FOR_SUPPORT,
        label: 'Waiting for Support',
        color: '#ec4899',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
        icon: 'SUP',
        description: 'Waiting on support/technical assistance',
        position: { x: 1100, y: 200 },
      },
    ],
    transitions: [
      // From New
      { from: TaskStatus.NEW, to: TaskStatus.AWAITING_APPROVAL },
      { from: TaskStatus.NEW, to: TaskStatus.TODO },
      { from: TaskStatus.NEW, to: TaskStatus.ON_HOLD },
      
      // From Awaiting Approval
      { from: TaskStatus.AWAITING_APPROVAL, to: TaskStatus.AWAITING_BOARD_APPROVAL },
      { from: TaskStatus.AWAITING_APPROVAL, to: TaskStatus.TODO },
      { from: TaskStatus.AWAITING_APPROVAL, to: TaskStatus.ON_HOLD },
      
      // From Awaiting Board Approval
      { from: TaskStatus.AWAITING_BOARD_APPROVAL, to: TaskStatus.TODO },
      { from: TaskStatus.AWAITING_BOARD_APPROVAL, to: TaskStatus.ON_HOLD },
      
      // From To Do
      { from: TaskStatus.TODO, to: TaskStatus.IN_PROGRESS },
      { from: TaskStatus.TODO, to: TaskStatus.ON_HOLD },
      { from: TaskStatus.TODO, to: TaskStatus.WAITING_FOR_SUPPORT },
      
      // From In Progress
      { from: TaskStatus.IN_PROGRESS, to: TaskStatus.VERIFY },
      { from: TaskStatus.IN_PROGRESS, to: TaskStatus.ON_HOLD },
      { from: TaskStatus.IN_PROGRESS, to: TaskStatus.WAITING_FOR_CUSTOMER },
      { from: TaskStatus.IN_PROGRESS, to: TaskStatus.WAITING_FOR_SUPPORT },
      
      // From Verify
      { from: TaskStatus.VERIFY, to: TaskStatus.CLOSED },
      { from: TaskStatus.VERIFY, to: TaskStatus.IN_PROGRESS },
      
      // From On Hold
      { from: TaskStatus.ON_HOLD, to: TaskStatus.TODO },
      { from: TaskStatus.ON_HOLD, to: TaskStatus.IN_PROGRESS },
      
      // From Waiting for Customer
      { from: TaskStatus.WAITING_FOR_CUSTOMER, to: TaskStatus.IN_PROGRESS },
      { from: TaskStatus.WAITING_FOR_CUSTOMER, to: TaskStatus.ON_HOLD },
      
      // From Waiting for Support
      { from: TaskStatus.WAITING_FOR_SUPPORT, to: TaskStatus.IN_PROGRESS },
      { from: TaskStatus.WAITING_FOR_SUPPORT, to: TaskStatus.ON_HOLD },
    ],
  };

  getWorkflowConfig(): WorkflowConfig {
    return this.workflowConfig;
  }

  getNode(status: TaskStatus): WorkflowNode | undefined {
    return this.workflowConfig.nodes.find((node: WorkflowNode) => node.status === status);
  }

  getAvailableTransitions(currentStatus: TaskStatus): TaskStatus[] {
    return this.workflowConfig.transitions
      .filter((t: WorkflowTransition) => t.from === currentStatus)
      .map((t: WorkflowTransition) => t.to);
  }

  isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
    return this.workflowConfig.transitions.some(
      (t: WorkflowTransition) => t.from === from && t.to === to,
    );
  }

  formatStatus(status: string): string {
    const node = this.workflowConfig.nodes.find((n: WorkflowNode) => n.status === status);
    return node ? node.label : status;
  }

  getAllStatuses(): TaskStatus[] {
    return this.workflowConfig.nodes.map((n: WorkflowNode) => n.status);
  }
}

