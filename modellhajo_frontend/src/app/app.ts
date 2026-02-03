import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import User from '../interfaces/user.interface';
import { DataService } from './data.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingIndicatorComponent } from './components/loading-indicator';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, CommonModule, LoadingIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected loadingService = inject(LoadingService)
  protected readonly API_URL = 'http://127.0.0.1:8000/api'
  protected http = inject(HttpClient);
  protected router = inject(Router);
  protected dataService = inject(DataService);
  protected rememberMe = false;
  protected user:User|undefined;
  protected headers: HttpHeaders|undefined;
  protected userIsAdmin = false
  ngOnInit(): void {
    this.loadingService.loadingOn()
      this.user = this.dataService.getUser()
      this.headers = new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.dataService.getToken()}`
      });
      this.http.get<boolean>(`${this.API_URL}/checkAdmin`, {headers: this.headers}).subscribe(
        data => {
            this.userIsAdmin = data

            this.loadingService.loadingOff()
        },
        error => console.log(error)        
      )
      
      
  }
  ngAfterViewInit(){ // elegansabb megoldas van?
    if (this.user)
      this.http.get<boolean>(`${this.API_URL}/checkTokenExpired`, {headers: this.headers }).subscribe(
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
