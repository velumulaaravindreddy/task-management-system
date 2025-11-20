import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css'],
})
export class AuditLogsComponent {
  user$ = this.authService.currentUser$;

  constructor(private authService: AuthService) {}
}

