import { Component, OnInit } from '@angular/core';
import { App } from '../../app';
import { FormsModule } from '@angular/forms';
import { Md5 } from 'ts-md5';
import User from '../../interfaces/user.interface';

@Component({
  selector: 'login-root',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: [
    '../../app.scss',
    './login.scss'
  ]})
export class LoginComponent extends App implements OnInit {
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
    this.loader.loadingOn()
    this.http.post<{success:boolean, user?:User, access_token?:string}>(`${this.API_URL}/login`, loginModel).subscribe(
      (data)=>{
        this.loginSuccess = data.success
        if(data.success){
          this.user = data.user
          this.dataservice.setUser(this.user!)
          this.dataservice.setToken(data.access_token!)
        }
        this.loader.loadingOff()
      },
      error=>{
        alert("Szerverhiba, próbálja újra később!")
      }
    )
  }
}
