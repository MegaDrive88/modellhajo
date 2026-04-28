import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DataService } from '../services/data.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const ds = inject(DataService);
    const router = inject(Router)
    const minimumRole = route.data['minRole'] as number;
    if (ds.getUser() && ds.getUser()!.role.szint >= minimumRole) {
        return true;
    }
    return router.createUrlTree(['/'], { queryParams: { returnUrl: state.url } });
};