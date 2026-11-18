import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneratedBill, OrderService } from './order.service';

@Component({
  selector: 'app-admin-bill',
  templateUrl: './admin-bill.html',
})
export class AdminBillComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly bill = signal<GeneratedBill | null>(null);
  protected readonly tableName = signal('');
  protected readonly isLoading = signal(false);
  protected readonly error = signal('');

  ngOnInit() {
    const token = sessionStorage.getItem('adminToken');

    if (!token) {
      void this.router.navigateByUrl('/admin');
      return;
    }

    this.tableName.set(
      this.route.snapshot.queryParamMap.get('table_name') ?? '',
    );
  }

  protected generateBill(rawTableName: string) {
    const tableName = rawTableName.trim();
    const token = sessionStorage.getItem('adminToken');

    if (!tableName) {
      this.error.set('Enter a table name to generate a bill.');
      return;
    }

    if (!token) {
      void this.router.navigateByUrl('/admin');
      return;
    }

    this.tableName.set(tableName);
    this.bill.set(null);
    this.error.set('');
    this.isLoading.set(true);
    this.orderService.generateBill(tableName, token).subscribe({
      next: (bill) => {
        this.bill.set(bill);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);

        if (error.status === 401 || error.status === 403) {
          sessionStorage.removeItem('adminToken');
          void this.router.navigateByUrl('/admin');
          return;
        }

        const detail =
          typeof error.error?.detail === 'string' ? error.error.detail : null;
        this.error.set(
          detail ??
            `Could not generate the bill for table ${tableName} (HTTP ${error.status}). Please try again.`,
        );
      },
    });
  }

  protected backToOrders() {
    void this.router.navigateByUrl('/admin/orders');
  }
}
