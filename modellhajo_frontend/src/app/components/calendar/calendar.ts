import { Component, DestroyRef, inject } from '@angular/core';
import Competition from '../../interfaces/competition.interface';
import { TopBarComponent } from "../top-bar";
import CompetitionCategory from '../../interfaces/competition.category.interface';
import { DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'calendar-root',
  imports: [TopBarComponent, DatePipe],
  templateUrl: './calendar.html',
  styleUrls: [
    '../../app.scss',
    './calendar.scss'
  ]})
export class CalendarComponent {
  protected ds = inject(DataService)
  private destroyRef = inject(DestroyRef)
  protected competitions!: Competition[]
  protected competitionCategories!: CompetitionCategory[]
  protected today = new Date().toISOString()
  ngOnInit(): void {
    this.ds.loader.loadingOn()
    forkJoin({
      compCats: this.ds.getCompetitionCategories(),
      allComps: this.ds.getAllCompetitions()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ compCats, allComps }) => {
        this.competitionCategories = compCats.categories
        if (allComps.success) {
          this.competitions = allComps.data
          for (const comp of this.competitions) {
            comp.categories = this.competitionCategories.filter(x => x.versenyid == comp.id).map(x => x.category)
          }
        }
        this.ds.loader.loadingOff()
      },
      error: (err) => {
        console.error('Failed to load competitions', err)
        alert('Hiba történt a versenyek betöltésekor.')
        this.ds.loader.loadingOff()
      }
    })
  }
}
