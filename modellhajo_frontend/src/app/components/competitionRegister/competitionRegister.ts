import { AfterViewInit, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { NgSelectModule } from '@ng-select/ng-select';
import Competition from '../../interfaces/competition.interface';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Category from '../../interfaces/category.interface';

@Component({
  selector: 'landing-root',
  imports: [MenuBarComponent, FormsModule, NgSelectModule],
  templateUrl: './competitionRegister.html',
  styleUrls: [
    '../../app.scss',
    './competitionRegister.scss'
  ]
})
export class CompetitionRegisterComponent implements OnInit{
  protected competition:Competition|undefined
  protected ds = inject(DataService)
  private destroyRef = inject(DestroyRef)
  private route = inject(ActivatedRoute)
  protected newCompetitionCategories: number[] = []
  protected competitionCategories: Category[] = []
  ngOnInit(){
      this.ds.loader.loadingOn();
      const competitionId = Number(this.route.snapshot.paramMap.get('id')!);
      forkJoin({
        competition: this.ds.getCompetitionById(competitionId),
        categories: this.ds.getCompetitionCategories()
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ competition, categories }) => {
          if (competition.success) this.competition = competition.data;
          categories.categories = categories.categories.filter(x => x.versenyid == this.competition?.id);
          this.competitionCategories = categories.categories.map(x => x.category);
          this.ds.loader.loadingOff(); // tul hamar lekapcsol, menubar miatt valszeg
        },
        error: (err) => {
          alert("Nem létezik ilyen verseny")
          this.ds.router.navigateByUrl('/dashboard')
          console.log(err);
          this.ds.loader.loadingOff();
        }
      });
  }
  enterCompetition(){    
    if(!this.ds.getUser()?.mmsz_id){
      alert("A nevezéshez szükséges MMSZ azonosító Önnek nincs kitöltve. Ezt az 'Adatmódosítás' menüpontban adhatja meg")
      this.ds.router.navigateByUrl("/user_management")
      return
    }
    this.ds.loader.loadingOn()
    // TODO egyesuletet valasztani 
    this.ds.enterCompetition(this.competition?.id!, this.newCompetitionCategories).subscribe({
      next:(data)=>{
        if(data.skipped.length > 0) alert(`Ön már nevezett ${data.skipped.join(", ")} kategóriá(k)ban${data.delta != 0 ? ", a többiben sikeresen nevezett" : ""}`)
        else alert(`Sikeresen nevezett a(z) ${this.competition?.nev} versenyre`)
        this.ds.loader.loadingOff()
      }
    })
  }
}
