import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MENU_API_URL } from './menu-api.config';

interface MenuApiItem {
  Dish: string;
  Type: string;
  Description: string;
  Price: number;
}

interface MenuItem extends MenuApiItem {
  quantity: number;
}

type MenuResponse =
  | MenuApiItem[]
  | { menu?: MenuApiItem[]; items?: MenuApiItem[]; Items?: MenuApiItem[] };

@Component({
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);
  protected isCartOpen = false;
  protected readonly menu = signal<MenuItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly loadErrorMessage = signal('');

  ngOnInit() {
    this.http.get<MenuResponse>(MENU_API_URL).subscribe({
      next: (response) => {
        const items = Array.isArray(response)
          ? response
          : response.menu ?? response.items ?? response.Items ?? [];
        this.menu.set(items.map((item) => ({ ...item, quantity: 0 })));
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
    return this.menu().reduce(
      (total, item) => total + item.quantity,
      0,
    );
  }

  protected get cartItems() {
    return this.menu().filter((item) => item.quantity > 0);
  }

  protected toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }
}
