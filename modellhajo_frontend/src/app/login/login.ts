import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Md5 } from 'ts-md5';
import { App } from '../app';
import User from '../../interfaces/user.interface';


@Component({
  selector: 'login-root',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: '../app.scss'
})
export class Login extends App {
  protected usernameOrEmail = ''
  protected pwd = ''
  protected sendLoginData(){
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/
    const isEmail = emailRegex.test(this.usernameOrEmail)    
    const hashedPwd = Md5.hashStr(`PasswordSalted${this.pwd}`)
    this.http.get<{success:boolean, user?:User}>(`http://127.0.0.1:8000/api/login/${this.usernameOrEmail}/${isEmail}/${hashedPwd}`).subscribe(
      (data)=>{
        if(data.success){
          console.log(data.user);
        }
        else {
          console.log("user not found");
        }
      }
    )
  }
}
