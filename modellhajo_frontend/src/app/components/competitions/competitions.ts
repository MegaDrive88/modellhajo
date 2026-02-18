import { Component, inject, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { FormsModule } from '@angular/forms';
import Competition from '../../interfaces/competition.interface';
import { CommonModule } from '@angular/common';
import Association from '../../interfaces/association.interface';
import Category from '../../interfaces/category.interface';
import { NgSelectModule } from '@ng-select/ng-select';
import CompetitionCategory from '../../interfaces/competition.category.interface';
import { DataService } from '../../services/data.service';


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
  protected associations!: Association[]
  protected categories!: Category[]
  protected newCompetitionCategories!: number[]
  protected userCompetitions!: Competition[]
  protected competitionCategories!: CompetitionCategory[]
  
  private today(){
    let raw = new Date().toISOString().split(":")
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
    this.ds.getAssociationsAndCategories().subscribe(
        data=>{
            this.associations = data.associations
            this.categories = data.categories
        }
    )
    this.ds.getCompetitionCategories().subscribe(
      data=>{
        if (data.success){
          this.competitionCategories = data.categories
        }
      },
      error=>console.log(error)
    )
    this.ds.getUserCompetitions().subscribe(
        data=>{                
            this.userCompetitions = data.data
            for (const comp of this.userCompetitions) {
                comp.categories = this.competitionCategories.filter(x=>x.versenyid == comp.id).map(x=>x.category)
            }
            this.ds.loader.loadingOff()
        }
    )
  }
  async sendCompetitionData(){
      this.ds.loader.loadingOn()
      const imageUploader = document.querySelector("#competitionThumbnail") as HTMLInputElement
      let original_name: string|null = null
      if (imageUploader.files && imageUploader.files[0]){
          const file = imageUploader.files[0]
          original_name = file.name
          const formdata = new FormData()
          formdata.append("thumbnail", file)
          const data:any = await this.ds.uploadCompetitionThumbnail(formdata)
          this.newComp.kep_fajlnev = original_name
          this.newComp.kep_url = data.url            
      }
      this.ds.createCompetition(this.newComp).subscribe(
            data=> {
                if (data.success) {
                    this.ds.createCompetitionCategories({ compId: data.compId, categs: this.newCompetitionCategories}).subscribe(
                        data => {
                            if (data.success) {
                                alert("Sikeres verseny létrehozás")
                                this.ds.loader.loadingOff()
                                location.reload()
                            }
                        }
                    )
                }
            },
            error => console.log(error)
        )
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
  deleteCompetition(id:number){
    if (confirm("Biztosan törölni szeretné?")) {
        this.ds.deleteCompetition(id).subscribe(
            data=>{
                if(data.success) location.reload()
            },
            error => console.log(error)
        )
    }
  }
}
