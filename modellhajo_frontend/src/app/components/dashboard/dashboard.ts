import { Component, inject, OnInit } from '@angular/core';
import { TopBarComponent } from '../top-bar/top-bar';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'dashboard-root',
  imports: [TopBarComponent],
  templateUrl: './dashboard.html',
  styleUrls: [
    '../../app.scss',
    './dashboard.scss'
  ]})
export class DashboardComponent implements OnInit{
  protected ds = inject(DataService)
  ngOnInit(): void { //ideiglenes
      if((this.ds.getUser()?.role?.szint ?? 0) >= 2) {
        this.ds.router.navigateByUrl("/competitions")
      } else {
        this.ds.router.navigateByUrl("/my_entries")
      }
      return
  }
}
