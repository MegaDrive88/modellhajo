import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./components/landing/landing').then(m => m.LandingPageComponent) },
    { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) },
    { path: 'user_register', loadComponent: () => import('./components/userRegister/userRegister').then(m => m.UserRegisterComponent) },
    { path: 'calendar', loadComponent: () => import('./components/calendar/calendar').then(m => m.CalendarComponent) },
    { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent) },
    { path: 'competitions', canActivate: [authGuard], loadComponent: () => import('./components/competitions/competitions').then(m => m.CompetitionsComponent) },
    { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./components/admin/admin').then(m => m.AdminComponent) },
    { path: '**', redirectTo: '' }
];
