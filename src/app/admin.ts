import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent {
  username = '';
  password = '';
  error = '';
  isLoggedIn = signal(false);

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  login() {
    this.http.post<{ token: string }>('/api/admin', {
      username: this.username,
      password: this.password,
    }).subscribe({
      next: (response) => {
        sessionStorage.setItem('adminToken', response.token);
        this.error = '';
        this.isLoggedIn.set(true);
        void this.router.navigateByUrl('/admin/orders');
      },
      error: () => {
        this.error = 'Invalid username or password.';
        this.isLoggedIn.set(false);
      },
    });
  }
}