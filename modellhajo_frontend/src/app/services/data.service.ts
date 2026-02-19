import { inject, Injectable } from '@angular/core';
import User from '../interfaces/user.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import MenuItem from '../interfaces/menuitem.interface';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import Association from '../interfaces/association.interface';
import Category from '../interfaces/category.interface';
import Competition from '../interfaces/competition.interface';
import CompetitionCategory from '../interfaces/competition.category.interface';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface AssociationsAndCategoriesResponse {
  success: boolean;
  associations: Association[];
  categories: Category[];
}

export interface CompetitionCategoriesResponse {
  success: boolean;
  categories: CompetitionCategory[];
}

export interface CompetitionsResponse {
  success: boolean;
  data: Competition[];
}

export interface CreateCompetitionResponse {
  success: boolean;
  compId: number;
}

export interface UploadThumbnailResponse {
  success: boolean;
  url: string;
}

export interface BasicResponse {
  success: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  access_token?: string;
}

export interface MenuItemsResponse {
  success: boolean;
  items: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly http = inject(HttpClient);
  public readonly router = inject(Router);
  public readonly loader = inject(LoadingService);
  public readonly API_URL = environment.apiUrl;
  public readonly STORAGE_URL = environment.storageUrl;

  private user: User | undefined;
  private token: string | undefined;
  private menuitems: MenuItem[] | undefined;

  setUser(value: User) {
    this.user = value;
    localStorage.setItem('modellhajo.user', JSON.stringify(value));
  }

  getUser(): User | undefined {
    if (!this.user && localStorage.getItem('modellhajo.user')) {
      this.user = JSON.parse(localStorage.getItem('modellhajo.user')!);
    }
    return this.user;
  }

  clearUser() {
    this.user = undefined;
    localStorage.removeItem('modellhajo.user');
  }

  setToken(value: string) {
    this.token = value;
    localStorage.setItem('modellhajo.UserAccessToken', value);
  }

  getToken(): string | undefined {
    if (!this.token && localStorage.getItem('modellhajo.UserAccessToken')) {
      this.token = localStorage.getItem('modellhajo.UserAccessToken')!.trim().replaceAll('"', '');
    }
    return this.token;
  }

  clearToken() {
    this.token = undefined;
    localStorage.removeItem('modellhajo.UserAccessToken');
  }

  getHeaders(): HttpHeaders | undefined {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      });
    }
    return undefined;
  }

  logout() {
    const headers = this.getHeaders();
    if (headers) {
      // Invalidate token server-side; ignore errors (already expired / offline)
      // this.http.post<BasicResponse>(`${this.API_URL}/logout`, {}, { headers }).subscribe({
      //   error: () => {}
      // });
    }
    this.clearUser();
    this.clearMenuItems();
    this.clearToken();
    this.router.navigateByUrl('/login');
  }

  getMenuItems() {
    if (!this.menuitems && localStorage.getItem('modellhajo.MenuItems')) {
      this.menuitems = JSON.parse(localStorage.getItem('modellhajo.MenuItems')!) as MenuItem[];
    }
    return this.menuitems;
  }

  setMenuItems(value: MenuItem[]) {
    this.menuitems = value;
    localStorage.setItem('modellhajo.MenuItems', JSON.stringify(value));
  }

  clearMenuItems() {
    this.menuitems = undefined;
    localStorage.removeItem('modellhajo.MenuItems');
  }

  checkTokenExpired() {
    return this.http.get<boolean>(`${this.API_URL}/checkTokenExpired`, { headers: this.getHeaders() });
  }

  retrieveMenuItems() {
    return this.http.get<MenuItemsResponse>(
      `${this.API_URL}/getMenuItems/${this.getUser()?.szerepkor_id}`,
      { headers: this.getHeaders() }
    );
  }

  login(loginModel: { user: string; isEmail: boolean; pwdHash: string }) {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, loginModel);
  }

  getAssociationsAndCategories() {
    return this.http.get<AssociationsAndCategoriesResponse>(
      `${this.API_URL}/getAssociationsAndCategories`
    );
  }

  getCompetitionCategories() {
    return this.http.get<CompetitionCategoriesResponse>(
      `${this.API_URL}/getCompetitionCategories`
    );
  }

  getUserCompetitions() {
    return this.http.get<CompetitionsResponse>(
      `${this.API_URL}/getUserCompetitions`,
      { headers: this.getHeaders() }
    );
  }

  async uploadCompetitionThumbnail(formdata: FormData): Promise<UploadThumbnailResponse> {
    return firstValueFrom(
      this.http.post<UploadThumbnailResponse>(
        `${this.API_URL}/uploadCompetitionThumbnail`,
        formdata,
        { headers: this.getHeaders() }
      )
    );
  }

  createCompetition(newComp: Omit<Competition, 'id' | 'letrehozo_id'>) {
    return this.http.post<CreateCompetitionResponse>(
      `${this.API_URL}/createCompetition`,
      newComp,
      { headers: this.getHeaders() }
    );
  }

  createCompetitionCategories(data: { compId: number; categs: number[] }) {
    return this.http.post<BasicResponse>(
      `${this.API_URL}/createCompetitionCategories`,
      data,
      { headers: this.getHeaders() }
    );
  }

  deleteCompetition(id: number) {
    return this.http.delete<BasicResponse>(
      `${this.API_URL}/deleteCompetition/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getAllCompetitions() {
    return this.http.get<CompetitionsResponse>(`${this.API_URL}/getAllCompetitions`);
  }

  createAccount(newUser:any){
    return this.http.post<any>(`${this.API_URL}/createAccount`, newUser)
  }

  getRoleRequests(){
    return this.http.get<User[]>(`${this.API_URL}/getRoleRequests`, {headers: this.getHeaders()})
  }

  decideRoleRequest(verdict: boolean, id: number){
    return this.http.patch<{success:boolean}>(`${this.API_URL}/decideRoleRequest/${verdict}`, {id: id}, {headers: this.getHeaders()})
  }

}