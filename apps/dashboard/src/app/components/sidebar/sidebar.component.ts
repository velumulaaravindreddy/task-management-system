import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  currentUser: any = null;
  isOpen: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    
    // On desktop, sidebar is open by default
    // On mobile, sidebar is closed by default
    if (window.innerWidth <= 1024) {
      this.isOpen = false;
    }
    
    // Listen for toggle events from header
    window.addEventListener('toggleSidebar', () => {
      this.toggleSidebar();
    });
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  closeSidebar(): void {
    if (window.innerWidth <= 1024) {
      this.isOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

