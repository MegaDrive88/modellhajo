import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { DataService } from '../services/data.service';

export const authGuard: CanActivateFn = () => {
  const ds = inject(DataService);
  if (ds.getUser()) {
    return true;
  }
  return ds.router.createUrlTree(['/login']);
};
