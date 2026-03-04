import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { DataService } from '../services/data.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const ds = inject(DataService);
  const allowedRoles = route.data['roles'] as number[];
  if (ds.getUser() && ds.getUser()?.szerepkor_elfogadva && allowedRoles?.includes(ds.getUser()?.szerepkor_id!)) {
    return true;
  }
  return ds.router.createUrlTree(['/dashboard']);
};
