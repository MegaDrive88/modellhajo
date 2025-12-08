import { Component, OnInit, inject } from '@angular/core';
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


@Component({
  selector: 'competitions-root',
  imports: [RouterOutlet, FormsModule, CommonModule, FormGroup, TopBar],
  templateUrl: './competitions.html',
  styleUrl: '../../app.scss'
})
export class Competitions extends App implements OnInit {
    protected associations:any[] = []
    protected formEnabled:boolean = false
    protected userCompetitions:Competition[] = []
    protected newComp: Omit<Competition, "id" | "letrehozo_id"> = { // kategoriak -- Andras
        kezdet: new Date().toISOString().split('T')[0],
        veg: new Date().toISOString().split('T')[0],
        nev: '',
        evszam: null, //nincs
        helyszin: '',
        megjelenik: new Date().toISOString().split('T')[0],
        nevezesi_hatarido: new Date().toISOString().split('T')[0],
        gps_x: null,
        gps_y: null,
        szervezo_egyesulet: -1,
        leiras: null,
        nevezesi_dij_junior: 0,
        nevezesi_dij_normal: 0,
        nevezesi_dij_senior: 0,
        kep_url: null,
        kep_fajlnev: null
    }
    override ngOnInit(): void {
        super.ngOnInit()
        this.http.get<{success:boolean, data:any[]}>(`${this.API_URL}/getAllAssociations`).subscribe(
            data=>{
                this.associations = data.data
            }
        )
        this.http.get<{success:boolean, data:Competition[]}>(`${this.API_URL}/getUserCompetitions`, {headers: this.headers}).subscribe(
            data=>{                
                this.userCompetitions = data.data
            }
        )
        
    }
    editEvent($event: { field: string; value: any }){
        (this.newComp as any)[$event.field] = $event.value
        this.updateFormEnabled()        
    }
    sendCompetitionData(){
        const imageUploader = document.querySelector("#competitionThumbnail") as HTMLInputElement
        let original_name: string|null = null
        if (imageUploader.files && imageUploader.files[0]){            
            const file = imageUploader.files[0]
            original_name = file.name
            const formdata = new FormData()
            formdata.append("thumbnail", file)
            this.http.post<any>(`${this.API_URL}/uploadCompetitionThumbnail`, formdata, {headers: this.headers}).subscribe(
                data=>{
                  this.newComp.kep_fajlnev = original_name
                  this.newComp.kep_url = data.url
                },
                error=>console.log(error)
            )
        }
        
        this.http.post<any>(`${this.API_URL}/createCompetition`, this.newComp, {headers: this.headers}).subscribe(
            data=> {
                if (data.success) {
                    alert("Sikeres verseny létrehozás")
                    location.reload()
                }
            },
            error => console.log(error)
        )
    }
    updateFormEnabled(){
        this.formEnabled = ( // datumok
            this.newComp.nev != "" &&
            this.newComp.helyszin != "" &&
            this.newComp.szervezo_egyesulet != -1 &&
            this.newComp.nev != "" &&
            this.newComp.nevezesi_dij_junior > 0 &&
            this.newComp.nevezesi_dij_normal > 0 &&
            this.newComp.nevezesi_dij_senior > 0
        )
    }
    assocSelectorChange(){
        this.newComp.szervezo_egyesulet = Number((document.querySelector("#assocSelector") as HTMLSelectElement).value)
        this.updateFormEnabled()        
    }
    toggleDropdown(event:MouseEvent){
        let sender = event.target! as HTMLButtonElement
        if(sender.textContent == 'V') sender.textContent = '<'
        else sender.textContent = 'V'

    }
}
