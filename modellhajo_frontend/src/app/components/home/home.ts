import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { App } from '../../app';
import User from '../../../interfaces/user.interface';
import { FormGroup } from "../formgroup";
import { TopBar } from '../topbar';


@Component({
  selector: 'home-root',
  imports: [RouterOutlet, FormsModule, CommonModule, FormGroup, TopBar],
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
  override ngOnInit(): void {
      super.ngOnInit()
      this.userCopy = structuredClone(this.user)
  }
  editEvent($event: { field: string; value: any }){
    if(!$event.field.includes("password"))
      (this.userCopy as any)[$event.field] = $event.value
  }
  cancelBtnClick(){
      this.userCopy = structuredClone(this.user)
  }
  async updateUserData(){
    this.http.patch<any>(`http://127.0.0.1:8000/api/updateUser/${this.userCopy!.id}`, this.userCopy).subscribe(
      (data)=>{
        if(data.success){
          this.user = data.user
          localStorage.setItem('modellhajoUser', JSON.stringify(this.user));
        }
        else
          console.log(data.error);
      }
    )
    if(this.pwdUpdaterVisible){
      this.http.patch<any>(`http://127.0.0.1:8000/api/updatePassword/${this.userCopy!.id}`, this.userCopy).subscribe(
        (data)=>{
          if(data.success){
            this.user = data.user
            localStorage.setItem('modellhajoUser', JSON.stringify(this.user));
          }
          else
            console.log(data.error);
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
  }
}
