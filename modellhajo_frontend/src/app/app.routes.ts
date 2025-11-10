import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';

export const routes: Routes = [
    {path: '', component: Login}, // landing esetleg
    {path: 'login', component: Login},
    {path: 'homepage', component: Home}
];
