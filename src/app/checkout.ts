import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
    const order = this.order();
    if (!order) {
      this.submitError.set('Your order is no longer available. Please scan the table QR code again.');
      this.isSubmitting.set(false);
      return;
    }

    this.orderService.submitOrder(order.token).subscribe({
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
