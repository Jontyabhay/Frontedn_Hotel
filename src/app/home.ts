import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MENU_API_URL } from './menu-api.config';
import { OrderService } from './order.service';

interface MenuApiItem {
  Dish: string;
  Type: string;
  Description: string;
  Price: number;
}

interface MenuItem extends MenuApiItem {
  table: string;
  quantity: number;
}

type MenuResponse =
  | MenuApiItem[]
  | { menu?: MenuApiItem[]; items?: MenuApiItem[]; Items?: MenuApiItem[]; table?: string; token?: string };

@Component({
  selector: 'app-home',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class HomeComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  protected isCartOpen = false;
  protected readonly menu = signal<MenuItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly loadErrorMessage = signal('');
  protected readonly scannedToken = signal('');
  protected readonly scannedTable = signal('');

  ngOnInit() {
    this.loadMenuFromLocation();
  }

  @HostListener('window:hashchange')
  protected onHashChange() {
    this.loadMenuFromLocation();
  }

  private loadMenuFromLocation() {
    const token = this.getTokenFromLocation();
    this.isLoading.set(true);
    this.loadError.set(false);
    this.menu.set([]);
    if (!token) {
      this.loadError.set(true);
      this.loadErrorMessage.set('Open this page with #menu?token=YOUR_TABLE_TOKEN.');
      this.isLoading.set(false);
      return;
    }

    this.scannedToken.set(token);
    this.http.get<MenuResponse>(MENU_API_URL(token)).subscribe({
      next: (response) => {
        const items = Array.isArray(response)
          ? response
          : response.menu ?? response.items ?? response.Items ?? [];
        const table = !Array.isArray(response) ? response.table ?? 'selected table' : 'selected table';
        this.scannedTable.set(table);
        const previousItems = new Map(
          this.orderService.pendingOrder()?.items.map((item) => [item.Dish, item.quantity]),
        );
        this.menu.set(items.map((item) => ({
          ...item,
          table,
          quantity: previousItems.get(item.Dish) ?? 0,
        })));
        this.isLoading.set(false);
      },
      error: (error: { status?: number }) => {
        this.loadError.set(true);
        this.loadErrorMessage.set(error.status
          ? `The menu API returned HTTP ${error.status}.`
          : 'The menu API could not be reached. Start the backend on port 8000.');
        this.isLoading.set(false);
      },
    });
  }

  private getTokenFromLocation(): string | null {
    const match = window.location.href.match(/[?&]token=([^&#]*)/);
    return match ? decodeURIComponent(match[1]).trim() || null : null;
  }

  protected changeQuantity(item: MenuItem, change: number) {
    this.menu.update((items) =>
      items.map((menuItem) =>
        menuItem === item
          ? { ...menuItem, quantity: Math.max(0, menuItem.quantity + change) }
          : menuItem,
      ),
    );
  }

  protected get cartQuantity(): number {
    return this.menu().reduce((total, item) => total + item.quantity, 0);
  }

  protected get cartItems() {
    return this.menu().filter((item) => item.quantity > 0);
  }

  protected get cartTotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.Price * item.quantity,
      0,
    );
  }

  protected toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  protected emptyCart() {
    this.menu.update((items) =>
      items.map((item) => ({ ...item, quantity: 0 })),
    );
    this.isCartOpen = false;
  }

  protected placeOrder() {
    if (this.cartItems.length === 0) return;

    this.orderService.setOrder({
      table: this.scannedTable(),
      token: this.scannedToken(),
      items: this.cartItems.map(({ Dish, Price, quantity }) => ({
        Dish,
        Price,
        quantity,
      })),
      total: this.cartTotal,
    });
    this.router.navigate(['/order']);
  }

  protected scrollToMenu(event: Event) {
  event.preventDefault();
  document.getElementById('menu')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}
}
