import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './auth/guards/auth.guard';
import { redirectIfAuthGuard } from './auth/guards/redirect-if-auth.guard';
import { adminGuard } from './admin/guards/admin.guard';
import { AdminComponent } from './admin/admin.component';
import { LayoutComponent } from './layout/layout.component';
import { TransactionsComponent } from './transactions/transactions.component';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [redirectIfAuthGuard],
    children: [
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
    ],
  },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'transactions',
        component: TransactionsComponent,
      },
    ],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: '/auth/login' },
];
