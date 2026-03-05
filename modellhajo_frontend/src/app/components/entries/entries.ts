import { Component, inject, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'entries-root',
  imports: [MenuBarComponent],
  templateUrl: './entries.html',
  styleUrls: [
    '../../app.scss',
    './entries.scss'
  ]})
export class EntriesComponent implements OnInit {
  protected ds = inject(DataService)
  ngOnInit(): void {
    this.ds.loader.loadingOn()
    forkJoin({
      competitions: this.ds.getAllCompetitions(),
      entries: this.ds.getEntriesByOrganizerId(),
      // categories: this.ds.getAssociationsAndCategories()
    }).subscribe(({ competitions, entries }) => {

    });
  }
}
