import { Component, inject } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'dashboard-root',
  imports: [MenuBarComponent],
  templateUrl: './dashboard.html',
  styleUrls: [
    '../../app.scss',
    './dashboard.scss'
  ]})
export class DashboardComponent {
  protected ds = inject(DataService)
}
