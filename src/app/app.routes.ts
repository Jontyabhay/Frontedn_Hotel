import { Routes } from '@angular/router';
import { CheckoutComponent } from './checkout';
import { HomeComponent } from './home';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'order', component: CheckoutComponent },
  { path: '**', redirectTo: '' },
];
