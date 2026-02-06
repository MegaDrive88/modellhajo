import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { LandingPageComponent } from './components/landing/landing';
import { UserRegisterComponent } from './components/userRegister/userRegister';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CalendarComponent } from './components/calendar/calendar';
import { AdminComponent } from './components/admin/admin';
import { CompetitionsComponent } from './components/competitions/competitions';

export const routes: Routes = [
    {path: "", component: LandingPageComponent},
    {path: "login", component: LoginComponent},
    {path: "user_register", component: UserRegisterComponent},
    {path: "dashboard", component: DashboardComponent},
    {path: "calendar", component: CalendarComponent},
    {path: "admin", component: AdminComponent},
    {path: "competitions", component: CompetitionsComponent}
];
