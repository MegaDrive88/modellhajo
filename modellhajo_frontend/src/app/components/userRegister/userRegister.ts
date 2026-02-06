import { Component } from '@angular/core';
import { App } from '../../app';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'user-register-root',
  imports: [FormsModule],
  templateUrl: './userRegister.html',
  styleUrls: [
    '../../app.scss',
    './userRegister.scss'
  ]})
export class UserRegisterComponent {

}
