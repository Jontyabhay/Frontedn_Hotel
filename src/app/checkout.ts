import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_TOKEN } from './menu-api.config';
import { OrderService } from './order.service';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink],
  styleUrl: './checkout.scss',
  templateUrl: './checkout.html',
})
export class CheckoutComponent {
  private readonly orderService = inject(OrderService);
  protected readonly order = this.orderService.pendingOrder;
  protected readonly isPaymentComplete = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal('');

  protected completePayment() {
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.submitError.set('');
    this.orderService.submitOrder(API_TOKEN).subscribe({
      next: () => {
        this.isPaymentComplete.set(true);
        this.isSubmitting.set(false);
      },
      error: () => {
        this.submitError.set('We could not place your order. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  protected returnToMenu() {
    this.orderService.clearOrder();
  }
}
