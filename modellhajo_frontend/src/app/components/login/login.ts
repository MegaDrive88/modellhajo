import { DataService } from './../../services/data.service';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Md5 } from 'ts-md5';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'login-root',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: [
    '../../app.scss',
    './login.scss'
  ]})
export class LoginComponent {
  protected ds = inject(DataService)
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
    this.ds.loader.loadingOn()
    this.ds.login(loginModel).subscribe(
      (data)=>{
        this.loginSuccess = data.success
        if(data.success){
          this.ds.setUser(data.user!)
          this.ds.setToken(data.access_token!)
        }
        this.ds.loader.loadingOff()
      },
      error=>{
        alert("Szerverhiba, próbálja újra később!")
        this.ds.loader.loadingOff()
      }
    )
  }
}
