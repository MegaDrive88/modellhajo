import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from './components/loading-indicator';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  ngOnInit() {
    // Token validity is enforced by protected API endpoints (401 handling)
    // to avoid issuing an extra authenticated request on every navigation.
  }
}
