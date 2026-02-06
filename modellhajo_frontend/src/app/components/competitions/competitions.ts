import { Component, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { App } from '../../app';

@Component({
  selector: 'competitions-root',
  imports: [MenuBarComponent],
  templateUrl: './competitions.html',
  styleUrls: [
    '../../app.scss',
    './competitions.scss'
  ]})
export class CompetitionsComponent implements OnInit {
  constructor(protected statics:App){}
  ngOnInit(): void {
  }
}
