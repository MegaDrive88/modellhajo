import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { App } from '../../app';
import User from '../../../interfaces/user.interface';
import { FormGroup } from "../formgroup";
import { TopBar } from '../topbar';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'home-root',
  imports: [RouterOutlet, FormsModule, CommonModule, FormGroup, TopBar, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: '../../app.scss'
})
export class Home extends App implements OnInit {
  protected userCopy: User|undefined = undefined
  protected pwdUpdaterVisible = false
  protected pwdModel = {
    old_password: "",
    new_password: "",
    conf_password: ""
  }
  protected userDataErrorString = ''
  protected pwdErrorString = ''
  protected formEnabled = false;
  override ngOnInit(): void {
      super.ngOnInit()
      this.userCopy = structuredClone(this.user)
      this.updateFormEnabled()
  }
  editEvent($event: { field: string; value: any }){

    if(!$event.field.includes("password"))
      (this.userCopy as any)[$event.field] = $event.value
    else 
      (this.pwdModel as any)[$event.field] = $event.value
    this.updateFormEnabled()

  }
  cancelBtnClick(){
    this.userCopy = structuredClone(this.user)
    this.pwdModel = {
      old_password: "",
      new_password: "",
      conf_password: ""
    }
  }
  async updateUserData(){
    (document.querySelector(".successBox") as any).style.display = "none"
    this.userDataErrorString = ""
    this.pwdErrorString = ""
    if(!this.pwdUpdaterVisible){
      this.http.patch<any>(`http://127.0.0.1:${this.PORT}/api/updateUser/${this.userCopy!.id}`, this.userCopy).subscribe(
        (data)=>{
          if(data.success){
            this.user = data.user
            localStorage.setItem('modellhajoUser', JSON.stringify(this.user));
            (document.querySelector(".successBox") as any).style.display = "inline-block"
          }
          else
            this.userDataErrorString = data.error
        }
      )
    }
    else{ 
      const headers = new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.dataService.getToken()}`
      }); //MUKODIK
      this.http.patch<any>(`http://127.0.0.1:${this.PORT}/api/updatePassword/${this.userCopy!.id}`, this.pwdModel, {headers}).subscribe(
        (data)=>{
          if(data.success){
            this.user = data.user
            localStorage.setItem('modellhajoUser', JSON.stringify(this.user));
            alert("Sikeres jelszó változtatás, kérjük jelentkezzen be újra!")
            this.logout()
          }
          else
            this.pwdErrorString = data.error
        }
      )
    }
  }
  togglePwdUpdate(){
    this.pwdUpdaterVisible = !this.pwdUpdaterVisible;
    if (this.pwdUpdaterVisible) 
      (document.querySelector("#pwdtoggler") as any).textContent = "ʌ"
    else
      (document.querySelector("#pwdtoggler") as any).textContent = "v"
    this.updateFormEnabled()
  }
  private updateFormEnabled(){
    if(!this.userCopy) {
      this.formEnabled = false
      return
    }
    this.formEnabled = (this.pwdUpdaterVisible ? 
                       Object.keys(this.pwdModel).every(x => (this.pwdModel as any)[x] != "") : 
                       Object.keys(this.userCopy!).every(x => (this.userCopy as any)[x] != ""))
  }
}
