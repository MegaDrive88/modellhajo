import { Component, DestroyRef, inject } from '@angular/core';
import Competition from '../../interfaces/competition.interface';
import { TopBarComponent } from "../top-bar";
import CompetitionCategory from '../../interfaces/competition.category.interface';
import { DatePipe, NgClass } from '@angular/common';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'calendar-root',
  imports: [TopBarComponent, DatePipe, RouterLink],
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
    forkJoin({
      compCats: this.ds.getCompetitionCategories(),
      allComps: this.ds.getAllCompetitions()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ compCats, allComps }) => {
        this.competitionCategories = compCats.categories
        if (allComps.success) {
          this.competitions = allComps.data.sort((a, b) => {
            const dateA = new Date(a.kezdet).getTime();
            const dateB = new Date(b.kezdet).getTime();
            return dateB - dateA;
          });
          for (const comp of this.competitions) {
            comp.categories = this.competitionCategories.filter(x => x.versenyid == comp.id).map(x => x.category)
          }
        }
      },
      error: (err) => {
        console.error('Failed to load competitions', err)
        Swal.fire({title: 'Hiba történt a versenyek betöltésekor.', theme: 'material-ui-dark'})
      }
    })
  }
}
