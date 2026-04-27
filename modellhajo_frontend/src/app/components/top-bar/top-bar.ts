import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { DataService } from '../../services/data.service';
import MenuItem from '../../interfaces/menuitem.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'top-bar-root',
  imports: [RouterLink, RouterLinkActive],
  template:`
    <nav class="navbar fancy-navbar fixed-top">
      <div class="container-fluid px-4 top-bar-layout">
        <a class="navbar-brand" [routerLink]="['/']">
          <img src="logo.webp" alt="" style="width: 80px">
        </a>

        @if(!this.ds.getUser()){
          <div class="top-bar-auth-buttons">
            <a class="blue-button" routerLink="/login" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Bejelentkezés</a>
            <a class="blue-inverse-button" routerLink="/user_register" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Regisztráció</a>
          </div>
        }@else {
          <ul class="navbar-nav top-bar-left-menu">
            <li class="nav-item">
                <a class="nav-link" [routerLink]="['/user_management']" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Adatmódosítás</a>
            </li>
            @if (ds.getUser()?.isadmin){
              <li class="nav-item">
                <a class="nav-link" [routerLink]="['/admin']" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Adminisztráció</a>
              </li>
            }
            @for (item of menuItems; track item.id) {
              <li class="nav-item">
                <a class="nav-link" [routerLink]="['/' + item.route]" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{item.menupont_nev}}</a>
              </li>
            }
          </ul>

          <div class="top-bar-user-right">
            <span class="top-bar-user-name">Bejelentkezve, mint {{this.ds.getUser()?.megjeleno_nev}}</span>
            <button class="btn blue-button px-4 rounded-pill" type="button" (click)="ds.logout()">Kijelentkezés</button>
          </div>
        }
      </div>
    </nav>
    <div class="top-bar-spacer" aria-hidden="true"></div>
    <div id="landing-bg"></div>
`,
  styleUrls:["../../app.scss", "./top-bar.scss"]
})
export class TopBarComponent implements OnInit {
  protected ds = inject(DataService)
  private destroyRef = inject(DestroyRef)
  protected menuItems: MenuItem[] = []

  ngOnInit(): void {
    if (!this.ds.getUser()) {
      this.menuItems = []
      return
    }

    const cached = this.ds.getMenuItems()
    if (cached) {
      this.menuItems = cached
      return
    }

    this.ds.retrieveMenuItems().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        if (data.success) {
          this.menuItems = data.items
          this.ds.setMenuItems(data.items)
        }
      },
      error: (err) => {
        console.error('Failed to load menu items', err)
      }
    })
  }
}
