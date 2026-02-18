import { inject, Injectable } from '@angular/core';
import User from '../interfaces/user.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import MenuItem from '../interfaces/menuitem.interface';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import Association from '../interfaces/association.interface';
import Category from '../interfaces/category.interface';
import Competition from '../interfaces/competition.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly http = inject(HttpClient)
  public readonly router = inject(Router);
  public readonly loader = inject(LoadingService)
  private readonly API_URL = 'http://127.0.0.1:8000/api'
    // private readonly API_URL = 'http://127.0.0.1:8000/api'
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

  private getHeaders(){
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
  checkTokenExpired(){
    return this.http.get<boolean>(`${this.API_URL}/checkTokenExpired`, {headers: this.getHeaders()})
  }
  retrieveMenuItems(){
    return this.http.get<{success:boolean, items:MenuItem[]}>(`${this.API_URL}/getMenuItems/${this.getUser()?.szerepkor_id}`, { headers: this.getHeaders() })
  }
  login(loginModel:any){
    return this.http.post<{success:boolean, user?:User, access_token?:string}>(`${this.API_URL}/login`, loginModel)
  }
  getAssociationsAndCategories(){
    return this.http.get<{success:boolean, associations:Association[], categories: Category[]}>(`${this.API_URL}/getAssociationsAndCategories`)
  }
  getCompetitionCategories(){
    return this.http.get<any>(`${this.API_URL}/getCompetitionCategories`)
  }
  getUserCompetitions(){
    return this.http.get<{success:boolean, data:Competition[]}>(`${this.API_URL}/getUserCompetitions`, {headers: this.getHeaders()})
  }
  uploadCompetitionThumbnail(formdata:any){
    return this.http.post<any>(`${this.API_URL}/uploadCompetitionThumbnail`, formdata, {headers: this.getHeaders()}).toPromise() // async await mindenhova?
  }
  createCompetition(newComp:any){
    return this.http.post<any>(`${this.API_URL}/createCompetition`, newComp, {headers: this.getHeaders()})
  }
  createCompetitionCategories(data:any){
    return this.http.post<any>(`${this.API_URL}/createCompetitionCategories`, data, {headers: this.getHeaders()})
  }
  deleteCompetition(id:number){
    return this.http.delete<any>(`${this.API_URL}/deleteCompetition/${id}`, {headers: this.getHeaders()})
  }
  getAllCompetitions(){
    return this.http.get<any>(`${this.API_URL}/getAllCompetitions`)
  }
}