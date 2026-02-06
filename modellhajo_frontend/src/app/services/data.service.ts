import { Injectable } from '@angular/core';
import User from '../interfaces/user.interface';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private user: User|undefined;
  private token: string|undefined;

  setUser(value: User) {
    this.user = value;
    localStorage.setItem('modellhajo.user', JSON.stringify(value));
  }

  getUser(): User|undefined {
    if (!this.user && localStorage.getItem('modellhajo.user')) this.user = JSON.parse(localStorage.getItem('modellhajo.user')!)
    return this.user;
  }

  clearUser() {
    this.user = undefined;
    localStorage.removeItem('modellhajo.user');
  }

  setToken(value: string){
    this.token = value
    localStorage.setItem('modellhajo.UserAccessToken', value);
  }

  getToken(): string|undefined {
    if (!this.token && localStorage.getItem('modellhajo.UserAccessToken')) this.token = localStorage.getItem("modellhajo.UserAccessToken")!.trim().replaceAll("\"", "")
    return this.token;
  }

  getHeaders(){
    if (this.token || localStorage.getItem('modellhajo.UserAccessToken')) {
      return new HttpHeaders({
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('modellhajo.UserAccessToken')}`
      });
    }
    return undefined
  }

  logout(){
    this.clearUser()
    localStorage.setItem('modellhajo.UserAccessToken', "");
    location.reload()
  }
  //menuitemekre is get set clear
  
}