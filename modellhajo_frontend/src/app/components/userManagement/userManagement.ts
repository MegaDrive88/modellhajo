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
  selector: 'usermgmt-root',
  imports: [RouterOutlet, FormsModule, CommonModule, TopBar],
  templateUrl: './userManagement.html',
  styleUrl: '../../app.scss'
})
export class UserManagement extends App implements OnInit {
    protected roleRequests: User[] = []
    getRoleRequests(){
      this.http.get<User[]>(`${this.API_URL}/getRoleRequests`, {headers: this.headers}).subscribe(
        data => this.roleRequests = data
      )
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
