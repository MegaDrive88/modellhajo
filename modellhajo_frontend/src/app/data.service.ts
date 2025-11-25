import { Injectable } from '@angular/core';
import User from '../interfaces/user.interface';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private user: User|undefined;
  private token: string|undefined;

  setUser(value: User) {
    this.user = value;
    localStorage.setItem('modellhajoUser', JSON.stringify(value));
  }

  getUser(): User|undefined {
    if (!this.user && localStorage.getItem('modellhajoUser')) this.user = JSON.parse(localStorage.getItem('modellhajoUser')!)
    return this.user;
  }

  clearUser() {
    this.user = undefined;
    localStorage.removeItem('modellhajoUser');
  }

  setToken(value: string){
    this.token = value
    localStorage.setItem('modellhajoUserAccessToken', value);
  }
  
  getToken(): string|undefined {
    if (!this.token && localStorage.getItem('modellhajoUserAccessToken')) this.token = localStorage.getItem("modellhajoUserAccessToken")!.trim().replaceAll("\"", "")
    return this.token;
  }
}