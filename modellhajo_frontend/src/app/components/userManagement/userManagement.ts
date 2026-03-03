import { Component, inject, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import User from '../../interfaces/user.interface';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'admin-root',
  imports: [MenuBarComponent, FormsModule, TranslatePipe],
  templateUrl: './userManagement.html',
  styleUrls: [
    '../../app.scss',
    './userManagement.scss'
]})
export class UserManagementComponent implements OnInit{
  private ds = inject(DataService)
  protected userCopy!: User
  protected pwdModel = {
    old_password: "",
    new_password: "",
    conf_password: ""
  }
  protected userDataErrorString = ''
  protected pwdErrorString = ''
  ngOnInit(): void {
    this.userCopy = structuredClone(this.ds.getUser())!
  }
  updateUserData(){
    this.userDataErrorString = ""
    this.ds.updateUser(this.userCopy).subscribe({
        next:(data)=>{
            if(data.success){
                this.ds.setUser(data.user)
                alert("Adatai sikeresen módosultak!")
            }
        },
        error:(err)=>{this.userDataErrorString = err.error.error}
    })
  }
  updatePassword(){
    this.pwdErrorString = ""
    this.ds.updatePassword(this.userCopy.id, this.pwdModel).subscribe({
        next:(data)=>{
            if(data.success){
                this.ds.setUser(data.user)
                alert("Sikeres jelszó változtatás, kérjük jelentkezzen be újra!")
                this.ds.logout()
            }
        },
        error:(err)=>{this.pwdErrorString = err.error.error}
    })
  }
}
