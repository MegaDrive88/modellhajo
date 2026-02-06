import { Component, OnInit } from '@angular/core';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { App } from '../../app';
import MenuItem from '../../interfaces/menuitem.interface';

@Component({
  selector: 'menu-bar-root',
  imports: [],
  templateUrl:"./menu-bar.html",
styles:`
.fancy-navbar {
  background: linear-gradient(135deg, var(--mat-sys-primary), var(--mat-sys-on-secondary-fixed));
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}
.fancy-navbar .navbar-brand,
.fancy-navbar .nav-link {
  color: #fff !important;
  position: relative;
  transition: all 0.3s ease;
}
.navbar-brand{
    font-weight:500;
}
.fancy-navbar .nav-link::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 50%;
  transition: all 0.3s ease;
  background: var(--mat-sys-primary)
}
.fancy-navbar .dropdown-toggle::after {
    position:static;
    background:none;
}
.fancy-navbar .nav-link:hover::after {
  width: 100%;
  left: 0;
}
.fancy-navbar .dropdown-toggle:hover::after {
    width: auto;
}
.fancy-navbar .nav-link:hover {
  color: #0d6efd !important;
}
.fancy-navbar .dropdown-menu {
  border-radius: 12px;
  overflow: hidden;
}
`,
})
export class MenuBarComponent implements OnInit {
  constructor(protected statics:App){}
  protected menuItems:MenuItem[] = []
  async ngOnInit() {   
      this.statics.loader.loadingOn()
      this.statics.http.get<boolean>(`${this.statics.API_URL}/checkTokenExpired`, {headers: this.statics.dataservice.getHeaders()}).subscribe(
          ()=>{},
          error=>{
            if (error.status == 401){
              alert("Lejárt a munkamenet, kérjük jelentkezzen be újra!")
              this.statics.loader.loadingOff()
              this.statics.dataservice.logout()
            }
          }
      )
      if (!this.statics.dataservice.getMenuItems()){
        this.statics.http.get<{success:boolean, items:MenuItem[]}>(`${this.statics.API_URL}/getMenuItems/${this.statics.dataservice.getUser()?.szerepkor_id}`, { headers: this.statics.dataservice.getHeaders() }).subscribe(
          data=>{            
            if(data.success){
              this.menuItems = data.items
              this.statics.dataservice.setMenuItems(data.items)
            }
            this.statics.loader.loadingOff()
          }
        )
      }
      else{
        this.menuItems = this.statics.dataservice.getMenuItems()!
        this.statics.loader.loadingOff()
      }
      
      await import('bootstrap');
  }
}
