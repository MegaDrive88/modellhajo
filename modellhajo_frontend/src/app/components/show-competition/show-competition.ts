import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { DataService } from "../../services/data.service";
import { ActivatedRoute } from "@angular/router";
import Competition from "../../interfaces/competition.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TopBarComponent } from "../top-bar";

@Component({
  selector: 'competitions-root',
  imports: [CommonModule, TopBarComponent],
  templateUrl: './show-competition.html',
  styleUrls: [
    '../../app.scss',
    './show-competition.scss'
  ]})
export class ShowCompetitonComponent implements OnInit {
    protected competition:Competition|undefined
    protected ds = inject(DataService)
    private route = inject(ActivatedRoute)
    private destroyRef = inject(DestroyRef)
    ngOnInit(): void {
        this.ds.loader.loadingOn()
        this.ds.getCompetitionById(Number(this.route.snapshot.paramMap.get('id')!))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
            next:(data)=>{
                if (data.success) this.competition = data.data
                this.ds.loader.loadingOff()
            },
            error: (err)=>{console.log(err);}
        })
    }
}
/*TODO 
- adatmodositas
- verseny nevezes - addigra mmszid
- tobb rendezo egy versenyhez
- tamogatohoz versenyzot kapcsolni
- ikonok fooldalon
- egy verseny oldal
- bejelentkezés + regisztracio gomb eltuntetes
- rendezo lassa a nevezoket
- openstreetmap
*/