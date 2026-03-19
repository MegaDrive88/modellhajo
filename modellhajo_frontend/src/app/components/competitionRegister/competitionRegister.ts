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
import Association from '../../interfaces/association.interface';

@Component({
  selector: 'competitionRegister-root',
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
  protected associations: Association[] = []
  protected selectedAssoc = -1
  protected mmszid:any
  ngOnInit(){
      this.mmszid = this.ds.getUser()?.mmsz_id
      this.ds.loader.loadingOn();
      const competitionId = Number(this.route.snapshot.paramMap.get('id')!);
      forkJoin({
        competition: this.ds.getCompetitionById(competitionId),
        categories: this.ds.getCompetitionCategories(),
        associations: this.ds.getAssociationsAndCategories()
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ competition, categories, associations }) => {
          if (competition.success) this.competition = competition.data;
          categories.categories = categories.categories.filter(x => x.versenyid == this.competition?.id);
          this.competitionCategories = categories.categories.map(x => x.category);
          this.associations = [{id:-1, nev: "Nincs megadva", logo_url:undefined}, ...associations.associations]
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
    if(!this.mmszid){
      alert("A nevezéshez szükséges MMSZ azonosító Önnek nincs kitöltve")
      return
    }
    let user = this.ds.getUser()
    user!.mmsz_id = this.mmszid
    this.ds.setUser(user!)
    this.ds.loader.loadingOn()
    this.ds.enterCompetition(this.competition?.id!, this.newCompetitionCategories, this.selectedAssoc, this.mmszid).subscribe({
      next:(data)=>{        
        if(data.skipped.length > 0) alert(`Ön már nevezett ${data.skipped.map((x :any)=>this.competitionCategories.find(y=>y.id == x)?.nev).join(", ")} kategóriá(k)ban${data.delta != 0 ? ", a többiben sikeresen nevezett" : ""}`)
        else alert(`Sikeresen nevezett a(z) ${this.competition?.nev} versenyre`)
        this.ds.loader.loadingOff()
        this.ds.router.navigateByUrl("/my_entries")
      }
    })
  }
}
