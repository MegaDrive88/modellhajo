import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Md5} from 'ts-md5';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private http = inject(HttpClient);
  protected usernameOrEmail = ''
  protected pwd = ''
  protected sendLoginData(){
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/
    const isEmail = emailRegex.test(this.usernameOrEmail)
    const hashedPwd = Md5.hashStr(`PasswordSalted${this.pwd}`)
    this.http.get<any>(`http://127.0.0.1:8000/api/login/${this.usernameOrEmail}/${isEmail}/${hashedPwd}`).subscribe(
      data=>console.log(data)
    )
  }
}
