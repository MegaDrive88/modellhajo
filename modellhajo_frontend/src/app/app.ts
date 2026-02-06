import { DataService } from './services/data.service';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from './components/loading-indicator';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
    public readonly http = inject(HttpClient)
    public readonly router = inject(Router);
    public readonly loader = inject(LoadingService)
    public readonly API_URL = 'http://127.0.0.1:8000/api'
    // public readonly API_URL = 'http://127.0.0.1:8000/api'
    public readonly dataservice = inject(DataService)
}
