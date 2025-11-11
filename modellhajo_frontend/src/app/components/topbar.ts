import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { App } from "../app";


@Component({
  selector: 'topbar',
  imports: [FormsModule, CommonModule],
  template:`
    <button class="btn" style="float: right;" (click)="logout()">Kijelentkezés</button>
    <h3>Bejelentkezve, mint: {{username}}</h3><br>
  `,
  styleUrl: '../app.scss'
})
export class TopBar extends App { 
    @Input() username: string = ''
}
 