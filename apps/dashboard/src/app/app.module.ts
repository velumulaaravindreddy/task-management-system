import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { TaskCardComponent } from './components/task-card/task-card.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { OrganizationSettingsComponent } from './components/organization-settings/organization-settings.component';
import { AuditLogsComponent } from './components/audit-logs/audit-logs.component';
import { NotificationDropdownComponent } from './components/notification-dropdown/notification-dropdown.component';
import { WorkflowDiagramComponent } from './components/workflow-diagram/workflow-diagram.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';
import { TaskService } from './services/task.service';
import { UserService } from './services/user.service';
import { WorkflowService } from './services/workflow.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    TaskListComponent,
    TaskFormComponent,
    SidebarComponent,
    HeaderComponent,
    TaskCardComponent,
    UsersManagementComponent,
    OrganizationSettingsComponent,
    AuditLogsComponent,
    NotificationDropdownComponent,
    WorkflowDiagramComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    AuthService,
    TaskService,
    UserService,
    WorkflowService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

