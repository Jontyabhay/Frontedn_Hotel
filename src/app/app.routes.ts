import { Routes } from '@angular/router';
import { CheckoutComponent } from './checkout';
import { HomeComponent } from './home';
import { AdminComponent } from './admin';
import { AdminOrdersComponent } from './admin-orders';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'order', component: CheckoutComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/orders', component: AdminOrdersComponent },
  { path: '**', redirectTo: '' }
];
