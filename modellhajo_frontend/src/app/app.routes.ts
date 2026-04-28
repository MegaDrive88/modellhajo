import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./components/landing/landing').then(m => m.LandingPageComponent) },
    { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) },
    { path: 'user_register', loadComponent: () => import('./components/userRegister/userRegister').then(m => m.UserRegisterComponent) },
    { path: 'forgot_password', loadComponent: () => import('./components/forgot-password-component/forgot-password-component').then(m => m.ForgotPasswordComponent) },
    { path: 'reset_password', loadComponent: () => import('./components/reset-password-component/reset-password-component').then(m => m.ResetPasswordComponent) },
    { path: 'calendar', loadComponent: () => import('./components/calendar/calendar').then(m => m.CalendarComponent) },
    { path: 'competition_register/:id', canActivate: [roleGuard], data: {minRole: 1}, loadComponent: () => import('./components/competitionRegister/competitionRegister').then(m => m.CompetitionRegisterComponent) },
    { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent) },
    { path: 'competitions', canActivate: [roleGuard], data: {minRole: 2}, loadComponent: () => import('./components/competitions/competitions').then(m => m.CompetitionsComponent) },
    { path: 'admin', canActivate: [roleGuard], data: {minRole: 3}, loadComponent: () => import('./components/admin/admin').then(m => m.AdminComponent) },
    { path: 'user_management', canActivate: [authGuard], loadComponent: () => import('./components/userManagement/userManagement').then(m => m.UserManagementComponent) },
    { path: 'competition/:id', loadComponent: () => import('./components/show-competition/show-competition').then(m => m.ShowCompetitonComponent) },
    { path: 'my_entries', canActivate: [roleGuard], data: {minRole: 1}, loadComponent: () => import('./components/myEntries/myEntries').then(m => m.MyEntriesComponent) },
    { path: 'entries', canActivate: [roleGuard], data: {minRole: 2}, loadComponent: () => import('./components/entries/entries').then(m => m.EntriesComponent) },
    { path: 'results', canActivate: [roleGuard], data: {minRole: 2}, loadComponent: () => import('./components/results-component/results-component').then(m => m.ResultsComponent) },
    { path: '**', redirectTo: '' }
];
