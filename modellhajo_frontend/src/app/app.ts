import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from './components/loading-indicator';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from './services/loading.service';
import User from './interfaces/user.interface';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
    protected http = inject(HttpClient)
    protected router = inject(Router);
    protected loader = inject(LoadingService)
    protected readonly API_URL = 'http://127.0.0.1:8000/api'
    protected user!:User
}
