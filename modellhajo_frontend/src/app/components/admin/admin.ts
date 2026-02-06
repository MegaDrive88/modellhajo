import { Component } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';

@Component({
  selector: 'calendar-root',
  imports: [MenuBarComponent],
  templateUrl: './admin.html',
  styleUrls: [
    '../../app.scss',
    './admin.scss'
  ]})
export class AdminComponent {

}
