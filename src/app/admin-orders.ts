import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { OrderService, PendingOrder, OrderedItem } from './order.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.html',
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly orders = signal<PendingOrder[]>([]);
  protected readonly selectedTable = signal('all');
  protected readonly approvingOrderId = signal<string | null>(null);
  protected readonly approvalError = signal('');
  protected readonly approvalMessage = signal('');
  protected readonly approvedOrderIds = signal<Set<string>>(new Set());
  protected readonly editOrderId = signal<string | null>(null);
  protected readonly editError = signal('');
  protected readonly savingItem = signal(false);

  protected readonly hasUnapprovedOrders = computed(() =>
  this.filteredOrders().some(
    (order) => !!order.id && !this.approvedOrderIds().has(order.id),
  ),
);

  protected readonly editingOrder = computed(() => {
    const id = this.editOrderId();
    return this.orders().find((order) => order.id === id) ?? null;
  });
  protected readonly tableNumbers = computed(() =>
    [...new Set(
      this.orders()
        .filter((order) => order.items.length > 0)
        .map((order) => order.table),
    )].sort(),
  );
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

      protected openEdit(order: PendingOrder) {
        if (!order.id) {
          return;
        }

        this.editError.set('');
        void this.router.navigate(['/admin/orders', order.id]);
      }

      protected closeEdit() {
        this.editError.set('');
        void this.router.navigate(['/admin/orders']);
      }

      protected saveItem(order: PendingOrder, item: OrderedItem, rawQuantity: string) {
        const quantity = Number(rawQuantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
          this.editError.set('Quantity must be a whole number greater than 0.');
          return;
        }

        this.updateItem(order, item, quantity);
      }

      protected removeItem(order: PendingOrder, item: OrderedItem) {
        this.updateItem(order, item, null);
      }

      private updateItem(order: PendingOrder, item: OrderedItem, qty: number | null) {
        const token = sessionStorage.getItem('adminToken');

        if (!order.id || !token) {
          this.editError.set('Please log in again.');
          return;
        }

        this.savingItem.set(true);
        this.editError.set('');

        this.orderService.updateOrder(order.id, item.Dish, qty, token).subscribe({
          next: () => {
            this.orderService.getConfirmedOrders(token).subscribe({
              next: (orders) => {
                this.orders.set(orders);
                this.savingItem.set(false);
              },
              error: () => {
                this.editError.set('Order saved, but the orders could not be reloaded.');
                this.savingItem.set(false);
              },
            });
          },
          error: () => {
            this.editError.set('Could not update this item.');
            this.savingItem.set(false);
          },
        });
      }

  protected approveOrder(order: PendingOrder) {
    const token = sessionStorage.getItem('adminToken');

    if (!order.id || !token) {
      this.approvalError.set('Please log in again.');
      return;
    }

    this.approvingOrderId.set(order.id);
    this.approvalError.set('');
    this.approvalMessage.set('');

    this.orderService.approveOrder(order.id, token).subscribe({
      next: () => {
        this.approvedOrderIds.update((ids) => new Set(ids).add(order.id!));
        this.approvingOrderId.set(null);
        this.approvalMessage.set(`Order ${order.id} approved.`);
        window.location.reload();
      },
      error: () => {
        this.approvingOrderId.set(null);
        this.approvalError.set(`Could not approve order ${order.id}.`);
      },
    });
  }

  protected readonly isloading = signal(true);
  protected readonly error = signal('');

  ngOnInit() {

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.editOrderId.set(params.get('order_id')));
      
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