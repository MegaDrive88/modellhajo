import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DataService } from '../services/data.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const ds = inject(DataService);
    const router = inject(Router)
    const minimumRole = route.data['minRole'] as number;
    let rolelvl = ds.getUser()?.szerepkor_elfogadva ? ds.getUser()!.role.szint : 1
    if (ds.getUser() && rolelvl >= minimumRole) {
        return true;
    }
    return router.createUrlTree(['/']);
};