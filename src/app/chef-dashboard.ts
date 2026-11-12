import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chef-dashboard',
  imports: [FormsModule],
  templateUrl: './chef-dashboard.html',
  styleUrl: './chef-dashboard.scss',
})
export class ChefComponent {
  username = '';
  password = '';
  error = '';

  protected readonly isLoggingIn = signal(false);

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  login() {
    this.error = '';
    this.isLoggingIn.set(true);

    this.http
      .post<{ token: string }>('/api/chef', {
        username: this.username,
        password: this.password,
      })
      .subscribe({
      next: (response) => {
        sessionStorage.setItem('chefToken', response.token);
        this.password = '';
        this.isLoggingIn.set(false);
        void this.router.navigateByUrl('/chef/orders');
      },
      error: (error: HttpErrorResponse) => {
        this.error =
          error.status === 401
            ? 'Invalid username or password.'
            : 'Unable to sign in. Please try again.';
        this.isLoggingIn.set(false);
      },
    });
  }
}