import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TaskStatus, WorkflowNode, WorkflowTransition } from '../../../../../../libs/data/src/index-frontend';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-workflow-diagram',
  templateUrl: './workflow-diagram.component.html',
  styleUrls: ['./workflow-diagram.component.css'],
})
export class WorkflowDiagramComponent implements OnInit {
  @Input() currentStatus?: TaskStatus;
  @Input() taskId?: string;
  @Output() statusChange = new EventEmitter<{ taskId: string; newStatus: TaskStatus }>();

  nodes: WorkflowNode[] = [];
  transitions: WorkflowTransition[] = [];
  availableTransitions: TaskStatus[] = [];
  hoveredNode: TaskStatus | null = null;
  selectedNode: TaskStatus | null = null;

  constructor(private workflowService: WorkflowService) {}

  ngOnInit(): void {
    const config = this.workflowService.getWorkflowConfig();
    this.nodes = config.nodes;
    this.transitions = config.transitions;
    
    if (this.currentStatus) {
      this.availableTransitions = this.workflowService.getAvailableTransitions(this.currentStatus);
      this.selectedNode = this.currentStatus;
    } else {
      // For header modal view, start with New status selected
      this.selectedNode = TaskStatus.NEW;
      this.availableTransitions = this.workflowService.getAvailableTransitions(TaskStatus.NEW);
    }
  }

  getNode(status: TaskStatus): WorkflowNode | undefined {
    return this.nodes.find((n) => n.status === status);
  }

  isCurrentStatus(status: TaskStatus): boolean {
    return status === this.currentStatus;
  }

  isAvailableTransition(status: TaskStatus): boolean {
    return this.availableTransitions.includes(status);
  }

  canTransitionTo(status: TaskStatus): boolean {
    if (!this.currentStatus) return false;
    return this.workflowService.isValidTransition(this.currentStatus, status);
  }

  onNodeClick(status: TaskStatus): void {
    if (this.canTransitionTo(status) && this.taskId) {
      this.statusChange.emit({ taskId: this.taskId, newStatus: status });
    } else if (!this.currentStatus) {
      // When viewing in header modal, show available transitions for clicked node
      this.selectedNode = status;
      this.availableTransitions = this.workflowService.getAvailableTransitions(status);
    }
  }

  onNodeHover(status: TaskStatus | null): void {
    this.hoveredNode = status;
  }

  getTransitionPath(from: TaskStatus, to: TaskStatus): string {
    const fromNode = this.getNode(from);
    const toNode = this.getNode(to);
    if (!fromNode || !toNode) return '';

    // Node center positions (200px width / 2 = 100px, 50px height offset)
    const x1 = fromNode.position.x + 100;
    const y1 = fromNode.position.y + 50;
    const x2 = toNode.position.x + 100;
    const y2 = toNode.position.y + 50;

    // Adjust for arrow direction
    const arrowOffset = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const adjustedX2 = x2 - arrowOffset * Math.cos(angle);
    const adjustedY2 = y2 - arrowOffset * Math.sin(angle);

    // Calculate control points for smooth curves
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Use different curve styles based on direction
    if (Math.abs(dy) < 50) {
      // Horizontal or near-horizontal: use simple curve
      const controlX1 = x1 + dx * 0.5;
      const controlY1 = y1 + (dy > 0 ? 30 : -30);
      const controlX2 = x2 - dx * 0.5;
      const controlY2 = y2 + (dy > 0 ? 30 : -30);
      return `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${adjustedX2} ${adjustedY2}`;
    } else {
      // Vertical or diagonal: use smoother curve
      const controlX1 = x1 + dx * 0.5;
      const controlY1 = y1;
      const controlX2 = x2 - dx * 0.5;
      const controlY2 = y2;
      return `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${adjustedX2} ${adjustedY2}`;
    }
  }

  getNodeDescription(status: TaskStatus): string {
    const node = this.getNode(status);
    return node?.description || '';
  }

  isTransitionHighlighted(from: TaskStatus, to: TaskStatus): boolean {
    return (
      this.currentStatus === from &&
      this.isAvailableTransition(to) &&
      (this.hoveredNode === to || this.hoveredNode === from)
    );
  }

  getNodeTooltip(status: TaskStatus): string {
    const node = this.getNode(status);
    const description = node?.description || '';
    
    if (this.isCurrentStatus(status)) {
      return `${node?.label} - Current Status\n${description}`;
    }
    if (!this.currentStatus) {
      return `${node?.label}\n${description}\n\nClick to see available transitions`;
    }
    if (this.canTransitionTo(status)) {
      return `${node?.label}\n${description}\n\nClick to transition to this status`;
    }
    return `${node?.label}\n${description}\n\nNot available from current status`;
  }
}

