import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService, PendingOrder } from './order.service';

@Component({
  selector: 'app-admin-orders',
  imports: [RouterLink],
  templateUrl: './admin-orders.html',
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  protected readonly orders = signal<PendingOrder[]>([]);
  protected readonly selectedTable = signal('all');
  protected readonly tableNumbers = computed(() =>
  [...new Set(this.orders().map((order) => order.table))].sort(),);
  protected readonly filteredOrders = computed(() => {
  const table = this.selectedTable();

  return table === 'all'
    ? this.orders()
    : this.orders().filter((order) => order.table === table);
  }); 
  protected selectTable(event: Event) {
  const select = event.target as HTMLSelectElement;
  this.selectedTable.set(select.value);
}
  protected readonly isloading = signal(true);
  protected readonly error = signal('');

  ngOnInit() {
    const token = sessionStorage.getItem('adminToken');

    if (!token) {
      this.error.set('Please log in again.');
      this.isloading.set(false);
      return;
    }

    this.orderService.getConfirmedOrders(token).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isloading.set(false);
      },
      error: () => {
        this.error.set('Could not load orders.');
        this.isloading.set(false);
      },
    });
  }
}