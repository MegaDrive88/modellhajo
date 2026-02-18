import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { DataService } from '../services/data.service';

export const adminGuard: CanActivateFn = () => {
  const ds = inject(DataService);
  if (ds.getUser()?.isadmin) {
    return true;
  }
  return ds.router.createUrlTree(['/login']);
};
