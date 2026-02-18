import { Component, inject, OnInit } from '@angular/core';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import MenuItem from '../../interfaces/menuitem.interface';
import { DataService } from '../../services/data.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'menu-bar-root',
  imports: [RouterLink],
  templateUrl:"./menu-bar.html",
  styleUrl:"./menu-bar.scss",
})
export class MenuBarComponent implements OnInit {
  protected ds = inject(DataService)
  protected menuItems:MenuItem[] = []
  async ngOnInit() {   
      this.ds.loader.loadingOn()
      this.ds.checkTokenExpired().subscribe(
          ()=>{},
          error=>{
            if (error.status == 401){
              alert("Lejárt a munkamenet, kérjük jelentkezzen be újra!")
              this.ds.loader.loadingOff()
              this.ds.logout()
            }
          }
      )
      if (!this.ds.getMenuItems()){
        this.ds.retrieveMenuItems().subscribe(
          data=>{            
            if(data.success){
              this.menuItems = data.items
              this.ds.setMenuItems(data.items)
            }
            this.ds.loader.loadingOff()
          }
        )
      }
      else{
        this.menuItems = this.ds.getMenuItems()!
        this.ds.loader.loadingOff()
      }
      
      await import('bootstrap');
  }
}
