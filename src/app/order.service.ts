import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ORDER_API_URL } from './menu-api.config';

export interface OrderedItem {
  Dish: string;
  Price: number;
  quantity: number;
}

export interface PendingOrder {
  items: OrderedItem[];
  total: number;
}

interface OrderRequestItem {
  dish: string;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  readonly pendingOrder = signal<PendingOrder | null>(null);

  setOrder(order: PendingOrder) {
    this.pendingOrder.set(order);
  }

  clearOrder() {
    this.pendingOrder.set(null);
  }

  submitOrder(token: string): Observable<unknown> {
    const order = this.pendingOrder();
    if (!order) {
      throw new Error('There is no order to submit.');
    }

    const request = {
      order: order.items.map(({ Dish, quantity }): OrderRequestItem => ({
        dish: Dish,
        qty: quantity,
      })),
    };
    const params = new HttpParams().set('token', token);

    return this.http.post<unknown>(ORDER_API_URL, request, { params });
  }
}
