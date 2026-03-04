import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { DataService } from '../services/data.service';

@Component({
  selector: 'top-bar-root',
  imports: [RouterLink],
  template:`
    <div id="top-bar">
        <a routerLink="/">LOGO</a>
        @if(!this.ds.getUser()){
          <a class="blue-button" style="margin-left: auto;" routerLink="/login">Bejelentkezés</a>
          <a class="blue-inverse-button" style="margin-left: 20px;" routerLink="/user_register">Regisztráció</a>
        }@else {
          <a class="blue-button" style="margin-left: auto; position:relative; padding-left:50px;" routerLink="/dashboard">
            <img src="user-profile-filled.svg" style="position:absolute; top:3px; left:4px; width:30px;">  
            Bejelentkezve, mint: {{this.ds.getUser()?.megjeleno_nev}}
          </a>
        }
        
    </div>
    <div id="landing-bg"></div>
`,
  styleUrl:"../app.scss"
})
export class TopBarComponent {
  protected ds = inject(DataService)
}
