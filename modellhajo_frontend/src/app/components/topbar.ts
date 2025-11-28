import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { App } from "../app";


@Component({
  selector: 'topbar',
  imports: [FormsModule, CommonModule],
  template:`
    <button class="btn" style="float: right;" (click)="logout()">Kijelentkezés</button>
    <div class="row">
      <h3 class="col">Bejelentkezve, mint: {{username}}</h3>
      <a class="col" href="/homepage">Dashboard</a>
      <a class="col" href="/account">Adatok módosítása</a>
      <a class="col" href="/competitions">Versenyek</a>
    </div>
  `,
  styleUrl: '../app.scss'
})
export class TopBar extends App { 
    @Input() username: string = ''
}
 