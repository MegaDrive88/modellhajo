import { Component, OnInit, Pipe, PipeTransform, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { App } from '../../app';
import User from '../../../interfaces/user.interface';
import { FormGroup } from "../formgroup";
import { TopBar } from '../topbar';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpHeaders } from '@angular/common/http';
import Competition from '../../../interfaces/competition.interface';
import { NgSelectModule } from '@ng-select/ng-select';
import Category from '../../../interfaces/category.interface';
import Association from '../../../interfaces/association.interface';


@Pipe({ name: 'categoryFilter' })
export class CategoryFilterPipe implements PipeTransform {
  transform(list: any[], id: number) {
    return list.filter(x => x.id === id)[0].categories;
  }
}

@Component({
  selector: 'competitions-root',
  imports: [RouterOutlet, FormsModule, CommonModule, FormGroup, TopBar, NgSelectModule, CategoryFilterPipe],
  templateUrl: './competitions.html',
  styleUrl: '../../app.scss'
})
export class Competitions extends App implements OnInit {
    protected associations: Association[] = []
    protected categories: Category[] = []
    protected newCompetitionCategories: number[] = []
    protected formEnabled: boolean = false
    protected userCompetitions: Competition[] = []
    protected categoriesByCompetition: {id:number,categories:Category[]}[] = []
    protected newComp: Omit<Competition, "id" | "letrehozo_id"> = {
        kezdet: new Date().toISOString().split('T')[0],
        veg: new Date().toISOString().split('T')[0],
        nev: '',
        evszam: '',
        helyszin: '',
        megjelenik: new Date().toISOString().split('T')[0],
        nevezesi_hatarido: new Date().toISOString().split('T')[0],
        gps_x: null,
        gps_y: null,
        szervezo_egyesulet: -1,
        leiras: null,
        nevezesi_dij_junior: null,
        nevezesi_dij_normal: null,
        nevezesi_dij_senior: null,
        kep_url: null,
        kep_fajlnev: null
    }
    override ngOnInit(): void {
        super.ngOnInit()
        this.http.get<{success:boolean, associations:Association[], categories: Category[]}>(`${this.API_URL}/getAssociationsAndCategories`).subscribe(
            data=>{
                this.associations = data.associations
                this.categories = data.categories
            }
        )
        this.http.get<{success:boolean, data:Competition[]}>(`${this.API_URL}/getUserCompetitions`, {headers: this.headers}).subscribe(
            data=>{                
                this.userCompetitions = data.data
                for(let comp of this.userCompetitions){
                    this.http.get<any>(`${this.API_URL}/getCompetitionCategories/${comp.id}`, {headers: this.headers}).subscribe(
                        data=> {
                            if(data.success) this.categoriesByCompetition.push({
                                id: comp.id,
                                categories: data.categories.map((x:any)=>x.category)
                            })
                            console.log(this.categoriesByCompetition);

                        },
                        error=>console.log(error)
                    )
                }
            }
        )
        
    }
    editEvent($event: { field: string; value: any }){
        (this.newComp as any)[$event.field] = $event.value
        this.updateFormEnabled()        
    }
    async sendCompetitionData(){
        const imageUploader = document.querySelector("#competitionThumbnail") as HTMLInputElement
        let original_name: string|null = null
        if (imageUploader.files && imageUploader.files[0]){
            const file = imageUploader.files[0]
            original_name = file.name
            const formdata = new FormData()
            formdata.append("thumbnail", file)
            const data:any = await this.http.post<any>(`${this.API_URL}/uploadCompetitionThumbnail`, formdata, {headers: this.headers}).toPromise()
            this.newComp.kep_fajlnev = original_name
            this.newComp.kep_url = data.url            
        }
        
        this.http.post<any>(`${this.API_URL}/createCompetition`, this.newComp, {headers: this.headers}).subscribe(
            data=> {
                if (data.success) {
                    this.http.post<any>(`${this.API_URL}/createCompetitionCategories`, { compId: data.compId, categs: this.newCompetitionCategories}, {headers: this.headers}).subscribe(
                        data => {
                            if (data.success) {
                                alert("Sikeres verseny létrehozás")
                                location.reload()
                            }
                        }
                    )
                }
            },
            error => console.log(error)
        )
    }
    updateFormEnabled(){
        this.formEnabled = (
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
    assocSelectorChange(){
        this.newComp.szervezo_egyesulet = Number((document.querySelector("#assocSelector") as HTMLSelectElement).value)
        this.updateFormEnabled()        
    }
    toggleDropdown(id:number, event:MouseEvent){
        let sender = event.target! as HTMLButtonElement
        if(sender.textContent == 'V') {
            sender.textContent = '<';
            (document.querySelector(`.competition-dropdown-${id}`)! as HTMLDivElement).hidden = false
        }
        else {
            sender.textContent = 'V';
            (document.querySelector(`.competition-dropdown-${id}`)! as HTMLDivElement).hidden = true
        }
    }
    deleteCompetition(id: number){
        if (confirm("Biztosan törölni szeretné?")) {
            this.http.delete<any>(`${this.API_URL}/deleteCompetition/${id}`, {headers: this.headers}).subscribe(
                data=>{
                    if(data.success) location.reload()
                },
                error => console.log(error)
            )
        }
    }
}

