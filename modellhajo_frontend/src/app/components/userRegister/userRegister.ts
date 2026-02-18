import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'user-register-root',
  imports: [FormsModule, RouterLink],
  templateUrl: './userRegister.html',
  styleUrls: [
    '../../app.scss',
    './userRegister.scss'
  ]})
export class UserRegisterComponent {

}
