import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { App } from '../../app';
import User from '../../../interfaces/user.interface';
import { FormGroup } from "../formgroup";
import { TopBar } from '../topbar';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'account-root',
  imports: [RouterOutlet, FormsModule, CommonModule, FormGroup, TopBar, TranslatePipe],
  templateUrl: './account.html',
  styleUrl: '../../app.scss'
})
export class Account extends App implements OnInit {
  
}
