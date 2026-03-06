import { CommonModule, DatePipe } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { DataService } from "../../services/data.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import Competition from "../../interfaces/competition.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TopBarComponent } from "../top-bar";

@Component({
  selector: 'show-competitions-root',
  imports: [CommonModule, TopBarComponent, DatePipe, RouterLink],
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
    protected today = new Date().toISOString()
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
- tobb rendezo egy versenyhez
- verseny szerkesztes
- tamogatohoz versenyzot kapcsolni
- openstreetmap
*/