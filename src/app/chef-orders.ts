import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, PendingOrder } from './order.service';

@Component({
  selector: 'app-chef-orders',
  templateUrl: './chef-orders.html',
  styleUrl: './chef-orders.scss',
})
export class ChefOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  protected readonly orders = signal<PendingOrder[]>([]);
  protected readonly ordersByTable = computed(() => {
    const groups = new Map<string, PendingOrder[]>();

    for (const order of this.orders()) {
      const table = order.table || 'Unassigned';
      const tableOrders = groups.get(table) ?? [];
      tableOrders.push(order);
      groups.set(table, tableOrders);
    }

    return [...groups.entries()]
      .sort(([tableA], [tableB]) =>
        tableA.localeCompare(tableB, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )
      .map(([table, orders]) => ({ table, orders }));
  });
  protected readonly isLoading = signal(true);
  protected readonly error = signal('');
  protected readonly dispatchError = signal('');
  protected readonly dispatchingOrderIds = signal<Set<string>>(new Set());

  ngOnInit() {
    const token = sessionStorage.getItem('chefToken');

    if (!token) {
      void this.router.navigateByUrl('/chef');
      return;
    }

    this.orderService.getChefApprovedOrders(token).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);

        if (error.status === 401 || error.status === 403) {
          sessionStorage.removeItem('chefToken');
          void this.router.navigateByUrl('/chef');
          return;
        }

        this.error.set('Could not load approved orders. Please try again.');
      },
    });
  }

  protected dispatchOrder(order: PendingOrder) {
    const orderId = order.id;
    const token = sessionStorage.getItem('chefToken');

    if (!orderId) {
      this.dispatchError.set('Cannot dispatch an order without an order ID.');
      return;
    }

    if (!token) {
      void this.router.navigateByUrl('/chef');
      return;
    }

    this.dispatchError.set('');
    this.dispatchingOrderIds.update((ids) => new Set(ids).add(orderId));

    this.orderService.dispatchOrder(orderId, token).subscribe({
      next: () => {
        this.orders.update((orders) =>
          orders.filter((item) => item.id !== orderId),
        );
        this.dispatchingOrderIds.update((ids) => {
          const updated = new Set(ids);
          updated.delete(orderId);
          return updated;
        });
      },
      error: (error: HttpErrorResponse) => {
        this.dispatchingOrderIds.update((ids) => {
          const updated = new Set(ids);
          updated.delete(orderId);
          return updated;
        });

        if (error.status === 401 || error.status === 403) {
          sessionStorage.removeItem('chefToken');
          void this.router.navigateByUrl('/chef');
          return;
        }

        this.dispatchError.set(
          `Could not dispatch order ${orderId}. Please try again.`,
        );
      },
    });
  }
}
