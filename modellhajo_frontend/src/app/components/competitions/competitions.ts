import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { FormsModule } from '@angular/forms';
import Competition from '../../interfaces/competition.interface';
import { CommonModule } from '@angular/common';
import Association from '../../interfaces/association.interface';
import Category from '../../interfaces/category.interface';
import { NgSelectModule } from '@ng-select/ng-select';
import CompetitionCategory from '../../interfaces/competition.category.interface';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'competitions-root',
  imports: [MenuBarComponent, FormsModule, CommonModule, NgSelectModule],
  templateUrl: './competitions.html',
  styleUrls: [
    '../../app.scss',
    './competitions.scss'
  ]})
export class CompetitionsComponent implements OnInit {
  protected ds = inject(DataService)
  private destroyRef = inject(DestroyRef)
  protected associations!: Association[]
  protected categories!: Category[]
  protected newCompetitionCategories: number[] = []
  protected userCompetitions!: Competition[]
  protected competitionCategories!: CompetitionCategory[]

  @ViewChild('competitionThumbnailInput') thumbnailInput!: ElementRef<HTMLInputElement>
  
  private today(){
    const raw = new Date().toISOString().split(":")
    raw.pop()
    return raw.join(":")
  }
  protected newComp: Omit<Competition, "id" | "letrehozo_id"> = {
      kezdet: this.today(),
      veg: this.today(),
      nev: '',
      evszam: '',
      helyszin: '',
      megjelenik: this.today(),
      nevezesi_hatarido: this.today(),
      gps_x: null,
      gps_y: null,
      szervezo_egyesulet: -1,
      leiras: null,
      nevezesi_dij_junior: null,
      nevezesi_dij_normal: null,
      nevezesi_dij_senior: null,
      kep_url: null,
      kep_fajlnev: null,
      categories:[]
  }
  ngOnInit(): void {
    this.ds.loader.loadingOn()
    // Use forkJoin to guarantee both calls complete before processing
    forkJoin({
      assocAndCats: this.ds.getAssociationsAndCategories(),
      compCats: this.ds.getCompetitionCategories(),
      userComps: this.ds.getUserCompetitions()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ assocAndCats, compCats, userComps }) => {
        this.associations = assocAndCats.associations
        this.categories = assocAndCats.categories
        this.competitionCategories = compCats.categories
        this.userCompetitions = userComps.data
        for (const comp of this.userCompetitions) {
          comp.categories = this.competitionCategories.filter(x => x.versenyid == comp.id).map(x => x.category)
        }
        this.ds.loader.loadingOff()
      },
      error: (err) => {
        console.error('Failed to load competition data', err)
        alert('Hiba történt az adatok betöltésekor.')
        this.ds.loader.loadingOff()
      }
    })
  }
  async sendCompetitionData(){
      this.ds.loader.loadingOn()
      const fileInput = this.thumbnailInput.nativeElement
      if (fileInput.files && fileInput.files[0]){
          const file = fileInput.files[0]
          const formdata = new FormData()
          formdata.append("thumbnail", file)
          const data = await this.ds.uploadCompetitionThumbnail(formdata)
          this.newComp.kep_fajlnev = file.name
          this.newComp.kep_url = data.url
      }
      this.ds.createCompetition(this.newComp).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: data => {
          if (data.success) {
            this.ds.createCompetitionCategories({ compId: data.compId, categs: this.newCompetitionCategories })
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: result => {
                  if (result.success) {
                    alert("Sikeres verseny létrehozás")
                    this.ds.loader.loadingOff()
                    this.ds.router.navigateByUrl('/competitions', { replaceUrl: true })
                      .then(() => this.ngOnInit())
                  }
                },
                error: err => {
                  console.error(err)
                  this.ds.loader.loadingOff()
                }
              })
          }
        },
        error: err => {
          console.error(err)
          this.ds.loader.loadingOff()
        }
      })
  }
  FormEnabled(){
        return (
            this.newComp.nev != "" &&
            this.newComp.helyszin != "" &&
            this.newComp.szervezo_egyesulet != -1 &&
            this.newComp.nevezesi_dij_junior != null && this.newComp.nevezesi_dij_junior > 0 &&
            this.newComp.nevezesi_dij_normal != null && this.newComp.nevezesi_dij_normal > 0 &&
            this.newComp.nevezesi_dij_senior != null && this.newComp.nevezesi_dij_senior > 0 &&
            (this.newComp.evszam?.length == 4 || this.newComp.evszam?.length == 0) &&
            this.newCompetitionCategories.length > 0 &&
            this.newComp.kezdet <= this.newComp.veg && 
            this.newComp.nevezesi_hatarido <= this.newComp.kezdet
        )
  }
  deleteCompetition(id: number){
    if (confirm("Biztosan törölni szeretné?")) {
        this.ds.deleteCompetition(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: data => {
            if (data.success) {
              this.userCompetitions = this.userCompetitions.filter(c => c.id !== id)
            }
          },
          error: err => console.error(err)
        })
    }
  }
}
