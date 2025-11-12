import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Md5 } from 'ts-md5';
import { App } from '../../app';
import User from '../../../interfaces/user.interface';


@Component({
  selector: 'login-root',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: '../../app.scss'
})
export class Login extends App {
  protected usernameOrEmail = ''
  protected pwd = ''
  // protected loginAttempts = 0
  protected loginSuccess = true
  protected async sendLoginData(){
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/
    const isEmail = emailRegex.test(this.usernameOrEmail)    
    const hashedPwd = Md5.hashStr(`PasswordSalted${this.pwd}`)
    // this.loginAttempts++
    this.loginSuccess = true
    this.http.get<{success:boolean, user?:User, access_token?:string}>(`http://127.0.0.1:8000/api/login/${this.usernameOrEmail}/${isEmail}/${hashedPwd}`).subscribe(
      (data)=>{
        this.loginSuccess = data.success
        if(data.success){
          this.dataService.setUser(data.user!)
          localStorage.setItem("modellhajoUserAccessToken", data.access_token!)
          this.router.navigateByUrl("/homepage")
        }
      },
      error=>{
        alert("Szerverhiba, próbálja újra később!")
      }
    )
  }
}
