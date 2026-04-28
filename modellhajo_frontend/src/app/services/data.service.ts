import { inject, Injectable } from '@angular/core';
import User from '../interfaces/user.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import MenuItem from '../interfaces/menuitem.interface';
import { Router } from '@angular/router';
import Association from '../interfaces/association.interface';
import Category from '../interfaces/category.interface';
import Competition from '../interfaces/competition.interface';
import CompetitionCategory from '../interfaces/competition.category.interface';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import CompetitionEntry from '../interfaces/competition.entry.interface';
import Role from '../interfaces/role.interface';

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

export interface CompetitionResponse {
  success: boolean;
  data: Competition;
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

export interface EntriesResponse {
  success: boolean;
  entries: {
    [versenyid: string] : CompetitionEntry[]
  };
}

export interface CompetitorsResponse {
  success: boolean;
  competitors: User[];
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
}

export interface RolesResponse {
  success: boolean;
  roles: Role[];
}

export interface ResetPasswordResponse {
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly http = inject(HttpClient);
  public readonly router = inject(Router);
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
      this.http.post<BasicResponse>(`${this.API_URL}/auth/logout`, {}, { headers }).subscribe({
        error: () => {}
      });
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
    return this.http.get<boolean>(`${this.API_URL}/auth/check-token`, { headers: this.getHeaders() });
  }

  retrieveMenuItems() {
    return this.http.get<MenuItemsResponse>(
      `${this.API_URL}/users/menu-items`,
      { headers: this.getHeaders() }
    );
  }

  login(loginModel: { user: string; isEmail: boolean; pwdHash: string }) {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, loginModel);
  }

  getAssociationsAndCategories() {
    return this.http.get<AssociationsAndCategoriesResponse>(
      `${this.API_URL}/lookups/associations-categories`
    );
  }

  getRoles() {
    return this.http.get<RolesResponse>(`${this.API_URL}/lookups/roles`);
  }

  getCompetitionCategories() {
    return this.http.get<CompetitionCategoriesResponse>(
      `${this.API_URL}/competitions/categories`
    );
  }

  getUserCompetitions() {
    return this.http.get<CompetitionsResponse>(
      `${this.API_URL}/competitions/mine`,
      { headers: this.getHeaders() }
    );
  }

  async uploadCompetitionThumbnail(formdata: FormData): Promise<UploadThumbnailResponse> {
    return firstValueFrom(
      this.http.post<UploadThumbnailResponse>(
        `${this.API_URL}/competitions/thumbnail`,
        formdata,
        { headers: this.getHeaders() }
      )
    );
  }

  createCompetition(newComp: Omit<Competition, 'id' | 'letrehozo_id'>) {
    return this.http.post<CreateCompetitionResponse>(
      `${this.API_URL}/competitions`,
      newComp,
      { headers: this.getHeaders() }
    );
  }

  updateCompetition(id: number, competition: Omit<Competition, 'id' | 'letrehozo_id'> & { categs?: number[] }) {
    return this.http.put<BasicResponse>(
      `${this.API_URL}/competitions/${id}`,
      competition,
      { headers: this.getHeaders() }
    );
  }

  createCompetitionCategories(data: { compId: number; categs: number[] }) {
    return this.http.post<BasicResponse>(
      `${this.API_URL}/competitions/categories`,
      data,
      { headers: this.getHeaders() }
    );
  }

  deleteCompetition(id: number) {
    return this.http.delete<BasicResponse>(
      `${this.API_URL}/competitions/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getAllCompetitions() {
    return this.http.get<CompetitionsResponse>(`${this.API_URL}/competitions`);
  }

  createAccount(newUser:any){
    return this.http.post<any>(`${this.API_URL}/auth/register`, newUser)
  }

  getRoleRequests(){
    return this.http.get<User[]>(`${this.API_URL}/admin/role-requests`, {headers: this.getHeaders()})
  }

  decideRoleRequest(verdict: boolean, id: number){
    return this.http.patch<BasicResponse>(`${this.API_URL}/admin/role-requests/${verdict}`, {id: id}, {headers: this.getHeaders()})
  }

  getCompetitionById(id: number){
    return this.http.get<CompetitionResponse>(`${this.API_URL}/competitions/${id}`)
  }

  updateUser(userData: User){
    return this.http.patch<any>(`${this.API_URL}/users/${userData.id}`, userData, {headers: this.getHeaders()} )
  }

  updatePassword(id: number, passwordModel: any){
    return this.http.patch<any>(`${this.API_URL}/users/${id}/password`, passwordModel, {headers: this.getHeaders()} )
  }

  enterCompetition(id: number, entry: number[], assoc: string | null, mmszid: string){
    return this.http.post<any>(`${this.API_URL}/competitions/${id}/entries`, {entry: entry, assoc: assoc, mmszid: mmszid}, {headers: this.getHeaders()} )
  }

  getEntriesByUserId(id: number){
    return this.http.get<EntriesResponse>(`${this.API_URL}/users/${id}/entries`, {headers: this.getHeaders()})
  }

  getEntriesByOrganizerId(){
    return this.http.get<EntriesResponse>(`${this.API_URL}/organizer/entries`, {headers: this.getHeaders()})
  }

  cancelEntry(id:number){
    return this.http.delete<any>(`${this.API_URL}/entries/${id}`, {headers: this.getHeaders()})
  }

  deleteAllEntries(compId: number){
    return this.http.delete<BasicResponse>(`${this.API_URL}/deleteAllEntries/${compId}`, {headers: this.getHeaders()})
  }

  bulkUpdateEntryNumbers(compId: number, entries: { id: number; rajtszam: number | null }[]){
    return this.http.patch<BasicResponse>(
      `${this.API_URL}/bulkUpdateEntryNumbers/${compId}`,
      { entries },
      { headers: this.getHeaders() }
    )
  }

  updateEntryNumber(id: number, rajtszam: number | null){
    return this.http.patch<BasicResponse>(
      `${this.API_URL}/entries/${id}`,
      { rajtszam },
      { headers: this.getHeaders() }
    )
  }

  getCompetitors(){
    return this.http.get<CompetitorsResponse>(`${this.API_URL}/users/competitors`, {headers: this.getHeaders()})
  }

  getEntriesByCompetitionId(id: number){    
    return this.http.get<EntriesResponse>(`${this.API_URL}/competitions/${id}/entries`, {headers: this.getHeaders()})
  }

  forgotPassword(email: string){
    return this.http.post<ForgotPasswordResponse>(`${this.API_URL}/auth/password/forgot`, { email })
  }

  resetPassword(payload: { email: string; token: string; new_password: string; conf_password: string }){
    return this.http.post<ResetPasswordResponse>(`${this.API_URL}/auth/password/reset`, payload)
  }

  createNewEmail(to: string){
    return this.forgotPassword(to)
  }

  manuallyEnterCompetitor(id:number, data: Object){
    return this.http.post<any>(`${this.API_URL}/competitions/${id}/entries/manual`, data, {headers: this.getHeaders()})
  }
}