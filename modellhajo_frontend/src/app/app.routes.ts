import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { LandingPageComponent } from './components/landing/landing';

export const routes: Routes = [
    {path: "", component: LandingPageComponent},
    {path: "login", component: LoginComponent}
];
