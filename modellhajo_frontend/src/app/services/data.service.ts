import { Injectable } from '@angular/core';
import User from '../interfaces/user.interface';
import { HttpHeaders } from '@angular/common/http';
import MenuItem from '../interfaces/menuitem.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private user: User|undefined;
  private token: string|undefined;
  private menuitems: MenuItem[]|undefined

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
    this.clearMenuItems()
    localStorage.setItem('modellhajo.UserAccessToken', "");
    location.reload()
  }
  //menuitemekre is get set clear
  getMenuItems(){
    if (!this.menuitems && localStorage.getItem('modellhajo.MenuItems')) this.menuitems = JSON.parse(localStorage.getItem("modellhajo.MenuItems")!) as MenuItem[]
    return this.menuitems;
  }
  setMenuItems(value:MenuItem[]){
    this.menuitems = value
    localStorage.setItem("modellhajo.MenuItems", JSON.stringify(value))
  }
  clearMenuItems(){
    this.menuitems = undefined
    localStorage.removeItem('modellhajo.MenuItems');
  }
}