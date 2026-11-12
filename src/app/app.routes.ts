import { Routes } from '@angular/router';
import { CheckoutComponent } from './checkout';
import { HomeComponent } from './home';
import { AdminComponent } from './admin';
import { AdminOrdersComponent } from './admin-orders';
import { ChefComponent } from './chef-dashboard';
import { ChefOrdersComponent } from './chef-orders';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'order', component: CheckoutComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/orders/:order_id', component: AdminOrdersComponent },
  { path: 'admin/orders/:order_id', component: AdminOrdersComponent },
  { path: 'admin/orders', component: AdminOrdersComponent },
  { path: 'chef', component: ChefComponent, pathMatch: 'full' },
  { path: 'chef/orders', component: ChefOrdersComponent },
  { path: '**', redirectTo: '' }
];
