import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import User from '../interfaces/user.interface';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected http = inject(HttpClient);
  protected router = inject(Router);
  protected isLoggedIn = false;
  protected rememberMe = false;
  protected user:User|undefined;
  ngOnInit(): void {
      
  }
}
