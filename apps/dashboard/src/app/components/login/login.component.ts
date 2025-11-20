import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      this.authService.login(
        this.loginForm.value.email,
        this.loginForm.value.password,
      ).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Invalid credentials';
          this.loading = false;
        },
      });
    }
  }

  fillTestAccount(email: string, password: string): void {
    this.loginForm.patchValue({
      email,
      password,
    });
    // Optional: Auto-submit after a short delay for better UX
    setTimeout(() => {
      if (this.loginForm.valid) {
        this.onSubmit();
      }
    }, 300);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}

