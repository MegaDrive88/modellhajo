import { Component, DestroyRef, inject } from '@angular/core';
import Competition from '../../interfaces/competition.interface';
import { TopBarComponent } from "../top-bar/top-bar";
import CompetitionCategory from '../../interfaces/competition.category.interface';
import { DatePipe, NgClass } from '@angular/common';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private route = inject(ActivatedRoute)
  private destroyRef = inject(DestroyRef)
  protected competitions!: Competition[]
  protected competitionCategories!: CompetitionCategory[]
  protected entryCounts: Record<number, Record<number, number>> = {}
  protected today = new Date()
  protected openOnly = false
  ngOnInit(): void {
    this.openOnly = this.route.snapshot.queryParamMap.get('openOnly') === '1'
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
            comp.kezdet = new Date(comp.kezdet)
            comp.veg = new Date(comp.veg)
            comp.megjelenik = new Date(comp.megjelenik)
            comp.nevezesi_hatarido = new Date(comp.nevezesi_hatarido)
          }
          this.competitions = this.competitions.filter(x => x.megjelenik <= this.today)

          if (this.openOnly) {
            this.competitions = this.competitions.filter(x => x.nevezesi_hatarido >= this.today)
          }

          const entryRequests = this.competitions.map(comp => this.ds.getEntriesByCompetitionId(comp.id))
          if (entryRequests.length === 0) {
            this.entryCounts = {}
            return
          }

          forkJoin(entryRequests).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (entriesResponses) => {
              const counts: Record<number, Record<number, number>> = {}
              entriesResponses.forEach((entriesResponse, index) => {
                const compId = this.competitions[index].id
                const compEntries = entriesResponse.entries?.[compId.toString()] ?? []
                const compCounts: Record<number, number> = {}
                for (const entry of compEntries) {
                  compCounts[entry.kategoriaid] = (compCounts[entry.kategoriaid] ?? 0) + 1
                }
                counts[compId] = compCounts
              })
              this.entryCounts = counts
            },
            error: (err) => {
              console.error('Failed to load entry counts', err)
              this.entryCounts = {}
            }
          })
        }
      },
      error: (err) => {
        console.error('Failed to load competitions', err)
        Swal.fire({title: 'Hiba történt a versenyek betöltésekor.', theme: 'material-ui-dark', icon: 'error'})
      }
    })
  }

  getEntryCount(compId: number, categoryId: number): number {
    return this.entryCounts[compId]?.[categoryId] ?? 0
  }
}
