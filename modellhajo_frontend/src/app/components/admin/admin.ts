import { Component } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { App } from '../../app';
import User from '../../interfaces/user.interface';

@Component({
  selector: 'calendar-root',
  imports: [MenuBarComponent],
  templateUrl: './admin.html',
  styleUrls: [
    '../../app.scss',
    './admin.scss'
  ]})
export class AdminComponent {
  constructor(protected statics:App){}
  protected user!:User
  ngOnInit(): void {
      this.user = this.statics.dataservice.getUser()!
  }
}
