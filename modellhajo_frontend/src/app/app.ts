import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import User from '../interfaces/user.interface';
import { DataService } from './data.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected http = inject(HttpClient);
  protected router = inject(Router);
  protected dataService = inject(DataService);
  protected rememberMe = false;
  protected user:User|undefined;
  ngOnInit(): void {
      this.user = this.dataService.getUser()
  }
  private translate = inject(TranslateService);
  constructor() {
    this.translate.addLangs(['en', 'hu']);
    this.translate.setFallbackLang('hu');
    this.translate.use('hu');
  }
  logout(){
    this.dataService.clearUser()
    this.user = undefined
    this.router.navigateByUrl("/login")
  }
}
