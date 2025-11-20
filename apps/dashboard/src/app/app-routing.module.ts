import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { OrganizationSettingsComponent } from './components/organization-settings/organization-settings.component';
import { AuditLogsComponent } from './components/audit-logs/audit-logs.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersManagementComponent, canActivate: [AuthGuard] },
  { path: 'organization', component: OrganizationSettingsComponent, canActivate: [AuthGuard] },
  { path: 'audit-log', component: AuditLogsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

