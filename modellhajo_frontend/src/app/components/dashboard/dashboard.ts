import { Component, OnInit } from '@angular/core';
import { App } from '../../app';
import { MenuBarComponent } from '../menu-bar';

@Component({
  selector: 'dashboard-root',
  imports: [MenuBarComponent],
  templateUrl: './dashboard.html',
  styleUrls: [
    '../../app.scss',
    './dashboard.scss'
  ]})
export class DashboardComponent extends App implements OnInit {

}
