import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { Register } from './components/register/register';

export const routes: Routes = [
    {path: '', component: Login}, // landing esetleg
    {path: 'login', component: Login},
    {path: 'homepage', component: Home},
    {path: 'register', component: Register}
];
