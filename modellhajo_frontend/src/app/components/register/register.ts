import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { App } from '../../app';
import { FormGroup } from "../formgroup";
import User from '../../../interfaces/user.interface';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'register-root',
  imports: [RouterOutlet, FormsModule, CommonModule, FormGroup, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: '../../app.scss'
})
export class Register extends App {
  protected newUser: any = {
    megjeleno_nev: "",
    felhasznalonev: "",
    email: "",
    password : "",
    conf_password : "",
    desired_role : 4,
    mmszid: ""
  }

  protected errorString = ""
  editEvent($event: { field: string; value: any }){
      (this.newUser as any)[$event.field] = $event.value
  }
  updateRoleId(event:any){
    this.newUser.szerepkor_id = event.target.value
  }
  protected sendRegisterData(){
    this.http.post<any>(`http://127.0.0.1:${this.PORT}/api/createAccount`, this.newUser).subscribe(
      (data)=>{
        if(data.success){
          alert("Sikeres felhasználó létrehozás")
          this.router.navigateByUrl("/login")
        }
        else{
          this.errorString = data.error
        }
      },
      error=>{
        alert("Szerverhiba, próbálja újra később!")
      }
    )
  }
}
