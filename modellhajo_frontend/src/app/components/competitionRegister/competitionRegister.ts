import { AfterViewInit, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TopBarComponent } from '../top-bar/top-bar';
import { NgSelectModule } from '@ng-select/ng-select';
import Competition from '../../interfaces/competition.interface';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Category from '../../interfaces/category.interface';
import Association from '../../interfaces/association.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'competitionRegister-root',
  imports: [TopBarComponent, FormsModule, NgSelectModule],
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
  protected selectedAssoc: string | null = null
  protected mmszid:any
  protected isJunior = false
  ngOnInit(){
      this.mmszid = this.ds.getUser()?.mmsz_id
      this.selectedAssoc = this.ds.getUser()?.egyesulet ?? null
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
          if (new Date(this.competition?.nevezesi_hatarido as string) < new Date()) 
            this.ds.router.navigate(["/"])
          categories.categories = categories.categories.filter(x => x.versenyid == this.competition?.id);
          this.competitionCategories = categories.categories.map(x => x.category);
          this.associations = associations.associations
        },
        error: (err) => {
          Swal.fire({title: 'Nem létezik ilyen verseny', theme: 'material-ui-dark', icon: 'error'})
          this.ds.router.navigateByUrl('/dashboard')
          console.log(err);
        }
      });
  }
  enterCompetition(){    
    if(!this.mmszid){
      Swal.fire({title: 'A nevezéshez szükséges MMSZ azonosító Önnek nincs kitöltve', theme: 'material-ui-dark', icon: 'warning'})
      return
    }
    let user = this.ds.getUser()
    user!.mmsz_id = this.mmszid
    this.ds.setUser(user!)
    this.ds.enterCompetition(this.competition?.id!, this.newCompetitionCategories, this.selectedAssoc, this.mmszid, this.isJunior).subscribe({
      next:(data)=>{        
        if(data.skipped.length > 0) Swal.fire({title: `Ön már nevezett ${data.skipped.map((x :any)=>this.competitionCategories.find(y=>y.id == x)?.nev).join(", ")} kategóriá(k)ban${data.delta != 0 ? ", a többiben sikeresen nevezett" : ""}`, theme: 'material-ui-dark', icon: 'warning'})
        else Swal.fire({title: `Sikeresen nevezett a(z) ${this.competition?.nev} versenyre`, theme: 'material-ui-dark', icon: 'success'})
        this.ds.router.navigateByUrl("/my_entries")
      }
    })
  }

  addAssociationTag = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      return null
    }

    const exists = this.associations.some(a => a.nev.toLowerCase() === trimmed.toLowerCase())
    if (!exists) {
      this.associations = [...this.associations, { id: 0, nev: trimmed, logo_url: null }]
    }

    return { id: 0, nev: trimmed, logo_url: null }
  }
}
