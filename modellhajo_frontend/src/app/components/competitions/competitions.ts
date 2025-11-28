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
    protected newComp: Omit<Competition, "id" | "letrehozo_id"> = {
        kezdet: new Date(),
        veg: new Date(),
        nev: '',
        evszam: null,
        helyszin: '',
        megjelenik: new Date(),
        nevezesi_hatarido: new Date(),
        gps_x: null,
        gps_y: null,
        szervezo_egyesulet: null,
        leiras: null,
        nevezesi_dij_junior: 0,
        nevezesi_dij_normal: 0,
        nevezesi_dij_senior: 0,
        kep_url: null,
        kep_fajlnev: null
    }
    override ngOnInit(): void {
        super.ngOnInit()
    }
    editEvent($event: { field: string; value: any }){
        // (this.userCopy as any)[$event.field] = $event.value
    }
    sendCompetitionData(){
        const imageUploader = document.querySelector("#competitionThumbnail") as HTMLInputElement
        let original_name: string|null = null
        if (imageUploader.files && imageUploader.files[0]){            
            const file = imageUploader.files[0]
            original_name = file.name
            const formdata = new FormData()
            formdata.append("thumbnail", file)
            this.http.post<any>(`http://127.0.0.1:${this.PORT}/api/uploadCompetitionThumbnail`, formdata, {headers: this.headers}).subscribe(
                data=>{
                  this.newComp.kep_fajlnev = original_name
                  this.newComp.kep_url = data.url
                },
                error=>console.log(error)
            )
        }
        this.http.post<any>(`http://127.0.0.1:${this.PORT}/api/uploadCompetitionThumbnail`, this.newComp, {headers: this.headers}).subscribe(

        )
    }
}
