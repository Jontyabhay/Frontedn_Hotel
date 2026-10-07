import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService, PendingOrder } from './order.service';

@Component({
  selector: 'app-chef-dashboard',
  imports: [RouterLink],
  templateUrl: './chef-dashboard.html',
  styleUrl: './chef-dashboard.scss',
})
export class ChefDashboardComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  protected readonly orders = signal<PendingOrder[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal('');

  ngOnInit() {
    const token = sessionStorage.getItem('adminToken');

    if (!token) {
      this.error.set('Please log in again.');
      this.isLoading.set(false);
      return;
    }

    this.orderService.getConfirmedOrders(token).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Could not load orders.');
        this.isLoading.set(false);
      },
    });
  }
}