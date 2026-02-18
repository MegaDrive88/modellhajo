import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DataService } from '../services/data.service';

export const adminGuard: CanActivateFn = () => {
  const ds = inject(DataService);
  const router = inject(Router);
  if (ds.getUser()?.isadmin) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
