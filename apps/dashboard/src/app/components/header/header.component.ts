import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() title: string = '';
  @Input() subtitle: string = '';

  user: any = null;
  menuOpen = false;
  workflowModalOpen = false;
  isDarkMode = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }

  openWorkflowModal(): void {
    this.workflowModalOpen = true;
  }

  closeWorkflowModal(): void {
    this.workflowModalOpen = false;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
    this.closeMenu();
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}

