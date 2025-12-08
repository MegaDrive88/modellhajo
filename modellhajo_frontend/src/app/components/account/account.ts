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
  selector: 'account-root',
  imports: [RouterOutlet, FormsModule, CommonModule, FormGroup, TopBar, TranslatePipe],
  templateUrl: './account.html',
  styleUrl: '../../app.scss'
})
export class Account extends App implements OnInit {
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
  protected userIsAdmin = false;
  protected roleRequests: User[] = []
  override ngOnInit(): void { // ha lejart a token?
      super.ngOnInit()
      this.userCopy = structuredClone(this.user)
      this.updateFormEnabled()
      
      this.checkAdmin()
  }
  checkAdmin(){
    this.http.get<boolean>(`${this.API_URL}/checkAdmin`, {headers: this.headers}).subscribe(
      data => {
        this.userIsAdmin = data
        if(this.userIsAdmin){
          this.getRoleRequests()
        }
        
      },
      error => console.log(error)        
    )
  }
  getRoleRequests(){
    this.http.get<User[]>(`${this.API_URL}/getRoleRequests`, {headers: this.headers}).subscribe(
      data => this.roleRequests = data
    )
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
  updateUserData(){
    (document.querySelector(".successBox") as any).style.display = "none"
    this.userDataErrorString = ""
    this.pwdErrorString = ""
    if(!this.pwdUpdaterVisible){
      this.http.patch<any>(`${this.API_URL}/updateUser/${this.userCopy!.id}`, this.userCopy, {headers: this.headers}).subscribe(
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
      this.http.patch<any>(`${this.API_URL}/updatePassword/${this.userCopy!.id}`, this.pwdModel, {headers: this.headers}).subscribe(
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
                       Object.keys(this.userCopy!).filter(item => typeof (this.userCopy as any)[item] === "string").every(x => (this.userCopy as any)[x] != ""))
                        //sufni megoldas, mmsz id el fogja rontani xdd
  }
  decideRoleRequest(id:number, verdict: boolean){
    this.http.patch<{success:boolean}>(`${this.API_URL}/decideRoleRequest/${verdict}`, {id: id}, {headers: this.headers}).subscribe(
      data => {
        if(data.success)
          this.getRoleRequests()
      },
      error => console.log(error)
    )
  }
}
