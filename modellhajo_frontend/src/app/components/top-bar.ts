import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import 'bootstrap/dist/js/bootstrap.bundle.min';

@Component({
  selector: 'top-bar-root',
  imports: [RouterLink],
  template:`
    <div id="top-bar">
        <a routerLink="/">LOGO</a>
        <a class="blue-button" style="margin-left: auto;" routerLink="/login">Bejelentkezés</a>
        <a class="blue-inverse-button" style="margin-left: 20px;" routerLink="/user_register">Regisztráció</a>
    </div>
    <div id="landing-bg"></div>
`,
  styleUrl:"../app.scss"
})
export class TopBarComponent {

}
