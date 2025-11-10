import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { App } from '../app';
import User from '../../interfaces/user.interface';
import { FormGroup } from "./formgroup";


@Component({
  selector: 'home-root',
  imports: [RouterOutlet, FormsModule, CommonModule, FormGroup],
  templateUrl: './home.html',
  styleUrl: '../app.scss'
})
export class Home extends App implements OnInit {
  protected userCopy: User|undefined = undefined
  override ngOnInit(): void {
      super.ngOnInit()
      this.userCopy = structuredClone(this.user)
  }
  editEvent($event: { field: string; value: any }){
    (this.userCopy as any)[$event.field] = $event.value
  }
  cancelBtnClick(){
      this.userCopy = structuredClone(this.user)
  }
  updateUserData(){
    
  }
}
