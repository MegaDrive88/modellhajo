import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { TopBarComponent } from "../top-bar/top-bar";
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import Competition from '../../interfaces/competition.interface';
import Swal from 'sweetalert2';
import { Subject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-results-component',
  imports: [TopBarComponent, CommonModule],
  templateUrl: './results-component.html',
  styleUrls:['../../app.scss', './results-component.scss'],
})
export class ResultsComponent implements OnInit {
  protected ds = inject(DataService)
  protected competitions: Competition[] = []
  protected selectedCompetition: Competition | null = null
  protected selectedCompetitionId$ = new Subject<number | null>()
  private destroyRef = inject(DestroyRef)

  ngOnInit(): void {
    this.ds.getUserCompetitions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.competitions = res.data.filter(x => new Date(x.kezdet) <= new Date()) || []
      },
      error: (err) => {
        console.error('Failed to load competitions', err)
        Swal.fire({ title: 'Hiba történt a versenyek betöltésekor.', theme: 'material-ui-dark', icon: 'error' })
      }
    })

    this.selectedCompetitionId$.pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((id) => {
        if (id === null) return of(null)
        return this.ds.getCompetitionById(id)
      })
    ).subscribe({
      next: (res: any) => {
        if (!res) {
          this.selectedCompetition = null
          return
        }
        if (res.success) {
          this.selectedCompetition = res.data
        }
      },
      error: (err) => {
        console.error(err)
        Swal.fire({ title: 'Hiba történt a verseny adatainak betöltésekor.', theme: 'material-ui-dark', icon: 'error' })
      }
    })
  }

  onSelectChange(ev: Event){
    const val = (ev.target as HTMLSelectElement).value
    if (!val) {
      this.selectedCompetitionId$.next(null)
      return
    }
    this.selectedCompetitionId$.next(Number(val))
  }
}
 