import { Component, inject } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'calendar-root',
  imports: [MenuBarComponent],
  templateUrl: './admin.html',
  styleUrls: [
    '../../app.scss',
    './admin.scss'
  ]})
export class AdminComponent {
  protected ds = inject(DataService)
}
