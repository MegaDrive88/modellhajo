import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, ViewChild, Input } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { App } from "../app";
import 'bootstrap/dist/js/bootstrap.bundle.min';


@Component({ // szebbre
  selector: 'topbar',
  imports: [FormsModule, CommonModule],
  template:`
  
    <div class="row">
      <h3 class="col-10">Bejelentkezve, mint: {{username}}</h3>
      <div class="dropdown col-2">
        <button
          #toggle
          class="btn dropdown-toggle w-100"
          data-bs-toggle="dropdown">
          Menü
        </button>

        <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
          <a class="dropdown-item" href="/account">Adatok módosítása</a>
          @if(userIsAdmin){
          <a class="dropdown-item" href="/usermanagement">Felhasználókarbantartás</a>
          }
          @for (item of menuItems; track $index) {
          <a class="dropdown-item" href="{{item.route}}">{{item.text}}</a>
          }
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" (click)="logout()">Kijelentkezés</a>
        </div>
      </div>
    </div>
  `,
  styleUrl: '../app.scss'
})
export class TopBar extends App {
    @ViewChild('dropdownToggle', { static: true }) dropdownToggle!: ElementRef; 
    @Input() username: string = ''
    protected menuItems: Array<{route: string, text: string}> = []
    override async ngOnInit() {
        super.ngOnInit()
        this.loadingService.loadingOn()

        this.http.get<any>(`${this.API_URL}/getMenuItems/${this.user?.szerepkor_id}`, { headers: this.headers }).subscribe(
          data=>{            
            if(data.success){
              for (const item of data.items) {
                switch(item.menuitem_nev){
                  case "Versenyek":
                    this.menuItems.push({route: "/competitions", text: "Versenyek"})
                    break;
                }
              }
            }
            this.loadingService.loadingOff()

          }
        )
        await import('bootstrap');

    }
}
 