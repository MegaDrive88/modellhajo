import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  protected readonly PORT = 8000
  protected http = inject(HttpClient);
  protected router = inject(Router);
  protected dataService = inject(DataService);
  protected rememberMe = false;
  protected user:User|undefined;
  protected headers: HttpHeaders|undefined;
  
  ngOnInit(): void {
      this.user = this.dataService.getUser() // nem lesz ez itt jo
      this.headers = new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.dataService.getToken()}`
      });
      if (this.user)
        this.http.get<boolean>(`http://127.0.0.1:${this.PORT}/api/checkTokenExpired`, {headers: {'Authorization': `Bearer ${this.dataService.getToken()}`}}).subscribe(
          data=>{},
          error=>{
            if (error.status == 401){
              alert("Lejárt a munkamenet, kérjük jelentkezzen be újra!")
              this.logout()
            }
          }
        )
      
  }
  private translate = inject(TranslateService);
  constructor() {
    this.translate.addLangs(['en', 'hu']);
    this.translate.setFallbackLang('hu');
    this.translate.use('hu');
  }
  logout(){ // backend hivas , token torles stb
    this.dataService.clearUser()
    this.user = undefined
    this.router.navigateByUrl("/login")
  }
}
