import { DataService } from './../services/data.service';
import { Component, AfterViewInit } from '@angular/core';
import 'bootstrap/dist/js/bootstrap.bundle.min';

@Component({
  selector: 'top-bar-root',
  imports: [],
  template:`
    <div id="top-bar">
        <a href="/">LOGO</a>
        <a class="blue-button" style="margin-left: auto;" href="/login">Bejelentkezés</a>
        <a class="blue-inverse-button" style="margin-left: 20px;" href="/user_register">Regisztráció</a>
    </div>
    <div id="landing-bg"></div>
`,
  styleUrl:"../app.scss"
})
export class TopBarComponent {

}
