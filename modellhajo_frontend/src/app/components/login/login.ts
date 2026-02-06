import { DataService } from './../../services/data.service';
import { Component, OnInit } from '@angular/core';
import { App } from '../../app';
import { FormsModule } from '@angular/forms';
import { Md5 } from 'ts-md5';
import User from '../../interfaces/user.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'login-root',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: [
    '../../app.scss',
    './login.scss'
  ]})
export class LoginComponent implements OnInit {
  constructor(private statics:App){}
  protected dataservice!:DataService
  protected router!:Router
  ngOnInit(): void {
      this.dataservice = this.statics.dataservice
      this.router = this.statics.router
  }
  protected usernameOrEmail = ''
  protected password = ''
  // protected loginAttempts = 0
  protected loginSuccess = true
  sendLoginData(){
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/
    const isEmail = emailRegex.test(this.usernameOrEmail)    
    const hashedPwd = Md5.hashStr(`PasswordSalted${this.password}`)
    // this.loginAttempts++
    this.loginSuccess = true
    const loginModel = {
      user: this.usernameOrEmail,
      isEmail: isEmail,
      pwdHash: hashedPwd
    }
    this.statics.loader.loadingOn()
    this.statics.http.post<{success:boolean, user?:User, access_token?:string}>(`${this.statics.API_URL}/login`, loginModel).subscribe(
      (data)=>{
        this.loginSuccess = data.success
        if(data.success){
          this.dataservice.setUser(data.user!)
          this.dataservice.setToken(data.access_token!)
        }
        this.statics.loader.loadingOff()
      },
      error=>{
        alert("Szerverhiba, próbálja újra később!")
        this.statics.loader.loadingOff()
      }
    )
  }
}
