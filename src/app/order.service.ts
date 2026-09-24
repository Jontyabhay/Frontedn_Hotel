import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { ORDER_API_URL } from './menu-api.config';
import { map, Observable } from 'rxjs';

export interface OrderedItem {
  Dish: string;
  Price: number;
  quantity: number;
}

export interface PendingOrder {
  id?: string;
  table: string;
  token: string;
  items: OrderedItem[];
  total: number;
}

interface OrderRequestItem {
  dish: string;
  qty: number;
}

interface ApiOrderItem {
  dish: string;
  qty: number;
  Price: number;
}

interface ApiConfirmedOrder {
  _id: string;
  table: string;
  orders: ApiOrderItem[];
  status: string;
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

  getConfirmedOrders(token: string): Observable<PendingOrder[]> {
    const params = new HttpParams().set('token', token);

    return this.http
      .get<ApiConfirmedOrder[]>('/api/admin/orders', { params })
      .pipe(
        map((orders) =>
          orders.map((order) => ({
            id: order._id,
            table: order.table,
            token: '',
            items: order.orders.map((item) => ({
              Dish: item.dish,
              Price: item.Price,
              quantity: item.qty,
            })),
            total: order.orders.reduce(
              (total, item) => total + item.Price * item.qty,
              0,
            ),
         })),
        ),
      );
    }
}
