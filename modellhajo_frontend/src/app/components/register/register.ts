import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { App } from '../../app';
import { FormGroup } from "../formgroup";
import User from '../../../interfaces/user.interface';


@Component({
  selector: 'register-root',
  imports: [RouterOutlet, FormsModule, CommonModule, FormGroup],
  templateUrl: './register.html',
  styleUrl: '../../app.scss'
})
export class Register extends App {
  protected newUser: Omit<User, "id" | "szerepkor_id"> = {
    megjeleno_nev: "",
    felhasznalonev: "",
    email: "",
    jelszo: ""
  } // class interface helyett?
}
