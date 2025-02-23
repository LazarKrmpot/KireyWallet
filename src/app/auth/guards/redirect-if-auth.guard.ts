import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { User } from '../models/auth';

export const redirectIfAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('user') || 'null') as User;

  if (user) {
    user.role === 'admin'
      ? router.navigateByUrl('/admin')
      : router.navigateByUrl('/app');

    return false;
  }

  return true;
};
