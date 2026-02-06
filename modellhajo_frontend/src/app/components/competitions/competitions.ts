import { Component, OnInit, Pipe } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { App } from '../../app';
import User from '../../interfaces/user.interface';
import { FormsModule } from '@angular/forms';
import Competition from '../../interfaces/competition.interface';
import { CommonModule } from '@angular/common';
import Association from '../../interfaces/association.interface';
import Category from '../../interfaces/category.interface';
import { NgSelectModule } from '@ng-select/ng-select';
import CompetitionCategory from '../../interfaces/competition.category.interface';


@Component({
  selector: 'competitions-root',
  imports: [MenuBarComponent, FormsModule, CommonModule, NgSelectModule],
  templateUrl: './competitions.html',
  styleUrls: [
    '../../app.scss',
    './competitions.scss'
  ]})
export class CompetitionsComponent implements OnInit {
  constructor(protected statics:App){}
  protected user!:User
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
    this.user = this.statics.dataservice.getUser()! 
    this.statics.loader.loadingOn()   
    this.statics.http.get<{success:boolean, associations:Association[], categories: Category[]}>(`${this.statics.API_URL}/getAssociationsAndCategories`).subscribe(
        data=>{
            this.associations = data.associations
            this.categories = data.categories
        }
    )
    this.statics.http.get<any>(`${this.statics.API_URL}/getCompetitionCategories`).subscribe(
      data=>{
        if (data.success){
          this.competitionCategories = data.categories
        }
      },
      error=>console.log(error)
    )
    this.statics.http.get<{success:boolean, data:Competition[]}>(`${this.statics.API_URL}/getUserCompetitions`, {headers: this.statics.dataservice.getHeaders()}).subscribe(
        data=>{                
            this.userCompetitions = data.data
            for (const comp of this.userCompetitions) {
                comp.categories = this.competitionCategories.filter(x=>x.versenyid == comp.id).map(x=>x.category)
            }
            this.statics.loader.loadingOff()
        }
    )
  }
  async sendCompetitionData(){
      this.statics.loader.loadingOn()
      const headers = this.statics.dataservice.getHeaders()
      const imageUploader = document.querySelector("#competitionThumbnail") as HTMLInputElement
      let original_name: string|null = null
      if (imageUploader.files && imageUploader.files[0]){
          const file = imageUploader.files[0]
          original_name = file.name
          const formdata = new FormData()
          formdata.append("thumbnail", file)
          const data:any = await this.statics.http.post<any>(`${this.statics.API_URL}/uploadCompetitionThumbnail`, formdata, {headers: headers}).toPromise()
          this.newComp.kep_fajlnev = original_name
          this.newComp.kep_url = data.url            
      }
      this.statics.http.post<any>(`${this.statics.API_URL}/createCompetition`, this.newComp, {headers: headers}).subscribe(
            data=> {
                if (data.success) {
                    this.statics.http.post<any>(`${this.statics.API_URL}/createCompetitionCategories`, { compId: data.compId, categs: this.newCompetitionCategories}, {headers: headers}).subscribe(
                        data => {
                            if (data.success) {
                                alert("Sikeres verseny létrehozás")
                                this.statics.loader.loadingOff()
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
        this.statics.http.delete<any>(`${this.statics.API_URL}/deleteCompetition/${id}`, {headers: this.statics.dataservice.getHeaders()}).subscribe(
            data=>{
                if(data.success) location.reload()
            },
            error => console.log(error)
        )
    }
  }
}
